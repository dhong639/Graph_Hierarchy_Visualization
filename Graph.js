class Graph {
	constructor(count_nodes, count_ports, /*div_id, root=null*/) {
		this.root = Math.floor(Math.random() * count_nodes)
		/**
		 * determine what elements to display
		 * 		0: link does not exist, don't display
		 * 		1: link is disabled by spt, don't display
		 * 		2: link is enabled, display
		 * determine likelihood that a link is enabled by spt
		 * 		anything with a weight of 0 does not actually exist
		 */
		this.display = {}
		this.weights = {}
		this.build_graph(count_nodes, count_ports)
		this.spanning_tree()
	}
	build_graph(count_nodes, count_ports) {
		// there must be at least 2 nodes in the graph
		count_nodes = count_nodes < 2 ? 2 : count_nodes
		/**
		 * first step is to initialize displays
		 * 		by default, all edges are set as 1, disabled by spt
		 * 		at the same time, prepare to set weights
		 */
		for(var i = 0; i < count_nodes; i++) {
			this.display[i] = {}
			this.weights[i] = {}
			for(var j = 0; j < count_nodes; j++) {
				this.display[i][j] = 1
				this.weights[i][j] = 0
			}
		}
		/**
		 * second step is to continue initializing weights
		 * 		do not set weights if already set
		 * 		do not create loops
		 * 		otherwise, weights are at least 1 in value
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
	set_root(root) {
		root = String(root)
		if(root in this.weights) {
			this.root = root
		}
	}
	spanning_tree() {
		var V = Object.keys(this.weights).length
		var count_node = 0

		var selected = {}
		for(var key in this.weights) {
			selected[key] = false
		}
		selected[this.root] = true

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
	}
	get_display() {
		//this.spanning_tree()
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
}
