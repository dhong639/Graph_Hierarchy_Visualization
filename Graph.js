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
		console.log(this.breadth_first(this.root, true))
		console.log(this.get_node_byDepth())
	}
	/**
	 * get_nodes
	 * 		function
	 * 			return all nodes in graph
	 */
	get_nodes() {
		return Object.keys(this.display)
	}
	/**
	 * get_targetDisplayed
	 * 		input
	 * 			source_id	string	parent of children
	 * 		output
	 * 			return all displayed nodes reachable from source_id
	 * 				all nodes under source_id, connected to source_id
	 */
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
	/**
	 * is_edge
	 * 		input
	 * 			source_id	string	parent of child
	 * 			target_id	string	child of parent
	 * 		function
	 * 			return status of given link
	 */
	is_edge(source_id, target_id) {
		return this.display[source_id][target_id]
	}
	/**
	 * remove_edge
	 * 		input
	 * 			source_id	string	parent of child
	 * 			target_id	string	child of parent
	 * 		function
	 * 			remove edge and add in new edge, if possible
	 */
	remove_edge(source_id, target_id) {
		var new_link = null
		var flag = this.is_edge(source_id, target_id)
		var list_nodes = this.breadth_first(target_id)
		// link is disabled regardless
		this.display[source_id][target_id] = 0
		this.display[target_id][source_id] = 0
		/**
		 * check that edge is displayed
		 * if an edge is displayed, need to know all the nodes under the removed edge
		 * 		specifically, all nodes that exist but aren't displayed
		 * source node is not affected, starts at target node
		 */
		if(flag == 2) {
			/**
			 * based on links under removed edge, attempt a connection from parent to a child
			 * link is any link from the source a node discovered by breadth_first
			 * will fail if breadth first discovers nothing
			 */
			var weight = Infinity
			var new_target = null
			list_nodes.forEach(node => {
				if(this.display[node][source_id] == 1) {
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
	/**
	 * build_graph
	 * 		input
	 * 			count_nodes		int		maximum nodes possible in graph
	 * 			count_ports		int		maximum weight assigned to a link
	 * 		function
	 * 			create graph with random number of nodes and random weights for every link
	 * 			note that this is a full mesh topology
	 */
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
	/**
	 * spanning_tree
	 * 		input
	 * 			start	string	where to start spanning tree, some node
	 * 		function
	 * 			prim's algorithm for spanning tree
	 * 			determines which nodes are to be displayed and which ain't
	 */
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
	/**
	 * set_edgeOff
	 * 		input
	 * 			source_id	string	parent of child
	 * 			target_id	string	child of parent
	 * 		function
	 * 			set value in display to off
	 */
	set_edgeOff(source_id, target_id) {
		this.display[source_id][target_id] = 0
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
	/**
	 * is_root
	 * 		input
	 * 			id	string	some node
	 * 		function
	 * 			check if given id is root of graph
	 */
	is_root(id) {
		return id == this.root
	}
	/**
	 * get_size
	 * 		function
	 * 			get number of items in the graph
	 */
	get_size() {
		return Object.keys(this.weights).length
	}
	/**
	 * breadth_first
	 * 		input
	 * 			start	string	where to start breadth_first
	 * 			flag	bool	false = return nodes
	 * 							true = return edges
	 * 		function
	 * 			traverse graph, level by level
	 */
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
	/**
	 * get_node_byDepth
	 * 		function
	 * 			group nodes by which level they appear
	 * 			note that this is each edge returned by breadth_first
	 * 				the source and target represent one level above and below the other
	 */
	get_node_byDepth() {
		var dict_depth = {}

		// root starts at depth 0
		var depth = 0
		var set_depthCurr = []
		set_depthCurr.push(this.root)
		var set_depthNext = []

		var list_edge = this.breadth_first(this.root, true)
		list_edge.forEach(edge => {
			if(!set_depthCurr.includes(edge[0])) {
				dict_depth[depth] = []
				set_depthCurr.forEach(value => {
					dict_depth[depth].push(value)
				})
				set_depthCurr = []
				set_depthNext.forEach(value => {
					set_depthCurr.push(value)
				})
				set_depthNext = []
				depth += 1
			}
			set_depthNext.push(edge[1])
		})
		/**
		 * upon reaching end, values from depthCurr and depthNext are not added
		 * add them afterwards
		 */
		dict_depth[depth] = []
		set_depthCurr.forEach(value => {
			dict_depth[depth].push(value)
		})
		depth += 1
		dict_depth[depth] = []
		set_depthNext.forEach(value => {
			dict_depth[depth].push(value)
		})
		
		return dict_depth
	}
}
