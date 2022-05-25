class Graph {
	constructor(count_nodes, count_ports, /*div_id, root=null*/) {
		this.root = Math.floor(Math.random() * count_nodes)
		/**
		 * determine what elements to display
		 * 		0: link does not exist, don't display
		 * 		1: link is disabled by spt, don't display
		 * 		2: link is enabled, display
		 */
		this.display = {}
		/** determine likelihood that a link is enabled by spt
		 * 	anything with a weight of 0 does not actually exist
		 */
		this.weights = {}

		this.build_graph(count_nodes, count_ports)
		this.spanning_tree(this.root)
		//console.log(this.display)
	}
	get_nodes() {
		return Object.keys(this.display)
	}
	get_targetDisplayed(source_id) {
		var list_target = []
		for(var target_id in this.display[source_id]) {
			if(this.display[source_id][target_id] == 2) {
				list_target.push(target_id)
			}
		}
		list_target.sort()
		return list_target
	}
	is_edge(source_id, target_id) {
		return this.display[source_id][target_id]
	}
	remove_edge(source_id, target_id) {
		var new_link = null
		var flag = this.is_edge(source_id, target_id)
		var list_nodes = this.breadth_first(target_id)
		this.display[source_id][target_id] = 0
		this.display[target_id][source_id] = 0
		if(flag == 2) {
			var weight = Infinity
			var new_target = null
			list_nodes.forEach(node => {
				if(this.display[node][source_id] == 1) {
					//console.log(node)
					if(this.weights[node][source_id] < weight) {
						weight = this.weights[node][source_id]
						new_target = node
					}
				}
			})
			if(new_target != null) {
				new_link = [source_id, new_target, weight]
			}
		}
		if(new_link != null) {
			this.display[source_id][new_link[1]] = 2
		}
		return new_link
	}
	build_graph(count_nodes, count_ports) {
		// there must be at least 2 nodes in the graph
		count_nodes = count_nodes < 2 ? 2 : count_nodes
		/**
		 * first step is to initialize displays
		 * 		by default, all edges are set as 1, disabled by spt
		 * 			loops do not and will never exist
		 * 		at the same time, prepare to set weights
		 */
		for(var i = 0; i < count_nodes; i++) {
			this.display[i] = {}
			this.weights[i] = {}
			for(var j = 0; j < count_nodes; j++) {
				this.display[i][j] = i == j ? 0 : 1
				this.weights[i][j] = 0
			}
		}
		/**
		 * second step is to continue initializing weights
		 * 		do not set weights if already set
		 * 		do not create loops
		 * 		otherwise, weights are at least 1 in value
		 * 		cannot have link from 
		 */
		for(var i in this.weights) {
			for(var j in this.weights[i]) {
				if(!this.weights[i][j] && i != j) {
					var weight = Math.floor(Math.random() * count_ports + 1)
					this.weights[i][j] = weight
					this.weights[j][i] = weight
				}
			}
		}
	}
	spanning_tree(start) {
		var V = Object.keys(this.weights).length
		var count_node = 0

		var selected = {}
		for(var key in this.weights) {
			selected[key] = false
		}
		selected[start] = true

		while(count_node < V - 1) {
			var minimum = Infinity
			var x = 0
			var y = 0
			for(var i in selected) {
				if(selected[i]) {
					for(var j in selected) {
						/**
						 * cannot select a node such that i == j or previously visited nodes
						 * edge must exist
						 * 		edge must have a weight
						 * 		weight must be greater than 0
						 */
						if(!selected[j] && j in this.weights[i] && this.weights[i][j]) {
							if(this.weights[i][j] < minimum) {
								minimum = this.weights[i][j]
								x = i
								y = j
							}
						}
					}
				}
			}
			/**
			 * set edge to be displayed
			 * unidirectional as opposed to bidirectional
			 */
			this.display[x][y] = 2
			selected[y] = true
			count_node += 1
		}
		/**
		 * edges should flow downward from root
		 * enforce direction in case ignored by spanning tree
		 */
		 /*this.breadth_first(this.root, true).forEach(edge => {
			var source = edge[0]
			var target = edge[1]
			this.display[source][target] = 2
			this.display[target][source] = 1
		})*/
	}
	set_edgeOff(source_id, target_id) {
		this.display[source_id][target_id] = 2
	}
	get_display() {
		var list_edges = []
		for(var i in this.display) {
			for(var j in this.display[i]) {
				if(this.display[i][j] == 2) {
					list_edges.push([i, j, this.weights[i][j]])
				}
			}
		}
		return list_edges
	}
	is_root(id) {
		return id == this.root
	}
	get_size() {
		return Object.keys(this.weights).length
	}
	breadth_first(start, flag=false) {
		var output = []

		var visited = {}
		for(var node in this.display) {
			visited[node] = false
		}
		var queue = []

		queue.push(start)
		visited[start] = true

		while(queue.length != 0) {
			var i = queue.shift()
			// by default, only output nodes
			if(flag == false) {
				output.push(i)
			}

			for(var j in this.display) {
				/**
				 * ignore nodes that were previously visited
				 * link in either direction must be displayed by spanning tree
				 */
				if(visited[j] == false && this.display[i][j] == 2) {
					queue.push(j)
					visited[j] = true
					/**
					 * if flag is set, output edges instead
					 * edges always returned as [parent, child]
					 */
					if(flag == true) {
						output.push([i, j])
					} 
				}
			}
		}

		return output
	}
}
