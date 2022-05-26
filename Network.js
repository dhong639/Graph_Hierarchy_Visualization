class Network {
	constructor(count_sites, count_nodes, count_ports, div_id) {
		this.dict_site = {}
		for(var i = 0; i<count_sites; i++) {
			var color = this.get_colorRandom()
			var invert = this.get_colorInvert(color)
			/**
			 * try to put dark text against light background
			 * invert = text
			 * color = background
			 * readability results may vary
			 */
			if(color < invert) {
				var temp = invert
				invert = color
				color = temp
			}
			invert = this.adjust_color(invert, -128)
			var nodes = Math.floor(Math.random() * count_nodes) + 1
			var ports = Math.floor(Math.random() * count_ports) + 1
			this.dict_site[color.substring(1)] = {
				color: color,
				invert: invert,
				data: new Graph(nodes, ports)
			}
		}
		this.cy = cytoscape({
			container: document.getElementById(div_id),
			//wheelSensitivity: 0.1,
			elements: [],
			style: [
				{
					selector: 'node',
					style: {
						'label': 'data(label)',
						'text-valign': 'center',
						'text-halign': 'center',
						'text-wrap': 'wrap',
						'color': 'data(invert)',
						'background-color': 'data(color)',
						'background-opacity': 'data(opacity)',
						'shape': 'data(shape)'
					}
				},
				{
					selector: 'edge',
					style: {
						'curve-style': 'bezier',
						'line-opacity': 0.75,
						'label': 'data(weight)'
					}
				},
				{
					selector: 'node:selected',
					style: {
						'background-color': 'data(invert)',
						'color': 'data(color)',
					}
				}
			]
		})
	}
	/**
	 * get_target_bySite_bySource
	 * 		input
	 * 			site_id		string	id of site (looks like a hex color code)
	 * 			source_id	string	id of parent node (integer, all keys are strings)
	 * 		function
	 * 			return all children connected to parent node
	 */
	get_target_bySite_bySource(site_id, source_id) {
		return this.dict_site[site_id].data.get_targetDisplayed(source_id)
	}
	/**
	 * remove_edge
	 * 		input
	 * 			site_id		string	id of site (looks like a hex color code)
	 * 			source_id	string	id of parent node (integer, all keys are strings)
	 * 			target_id	string	id of child node (still a string despite being a number)
	 * 		function
	 * 			remove edge in site with given source and target from displayed cytoscape object
	 * 			remove edge from connected edges in appropriate graph object
	 * 			add new edge to maintain connectivity, if possible
	 */
	remove_edge(site_id, source_id, target_id) {
		var flag = this.dict_site[site_id].data.is_edge(source_id, target_id)
		if(flag == 2) {
			var edge_id = this.get_edgeID(site_id, source_id, target_id)
			this.cy.remove('#' + edge_id)
		}
		var new_link = this.dict_site[site_id].data.remove_edge(source_id, target_id)
		if(new_link != null) {
			this.cy.add({
				group: 'edges',
				data: {
					id: this.get_edgeID(site_id, new_link[0], new_link[1]),
					source: this.get_nodeID(site_id, new_link[0]),
					target: this.get_nodeID(site_id, new_link[1]),
					weight: new_link[2]
				}
			})
		}
	}
	/**
	 * get_sites
	 * 		function
	 * 			return all sites in current object
	 */
	get_sites() {
		return Object.keys(this.dict_site)
	}
	/**
	 * get_site
	 * 		input
	 * 			site_id		string	id of site (looks like a hex color code)
	 * 		function
	 * 			return Graph object stored at some site
	 */
	get_site(site_id) {
		return this.dict_site[site_id].data
	}
	/**
	 * get_colorMain
	 * 		input
	 * 			site_id		string	id of site (looks like a hex color code)
	 * 		function
	 * 			return color code used for node background
	 */
	get_colorMain(site_id) {
		return this.dict_site[site_id].color
	}
	/**
	 * get_colorInvert
	 * 		input
	 * 			site_id		string	id of site (looks like a hex color code)
	 * 		function
	 * 			return coor code used for text color
	 */
	get_colorInvert(site_id) {
		return this.dict_site[site_id].invert
	}
	/**
	 * get_site_display
	 * 		input
	 * 			site_id		string	id of site (looks like a hex color code)
	 * 		function
	 * 			return matrix that shows what's connected and not
	 * 				0 = link doesn't exist
	 * 				1 = link not active (unfavorable weight for spanning tree)
	 * 				2 = link displayed
	 */
	get_site_display(site_id) {
		return this.dict_site[site_id].data.display
	}
	/**
	 * display
	 * 		function
	 * 			display cytoscape object
	 * 			should ideally only run once
	 * 			changes do not reload graph
	 */
	display() {
		this.cy.add({
			/**
			 * represents server or controller at top of network
			 * adjust size later
			 */
			data: {
				id: 'S',
				label: 'S',
				shape: 'square',
				color: '#000000',
				invert: '#FFFFFF',
				opacity: 1,
				parent: ''
			}
		})
		var total = 0
		for(var site_id in this.dict_site) {
			/**
			 * this is a box drawn around all elements in a site
			 * other elements use this as a parent
			 * click and drag box to move whole site
			 */
			this.cy.add({
				data: {
					id: site_id,
					label: '',
					shape: 'star',
					color: '#D3D3D3',
					invert: '#2c2c2c',
					opacity: 0.25
				}
			})
			var color = this.dict_site[site_id].color
			var invert = this.dict_site[site_id].invert
			var set_node = new Set()
			var root = null
			this.dict_site[site_id].data.get_display().forEach(edge => {
				var source = edge[0]
				var target = edge[1]
				var weight = edge[2]
				// do not add duplicate nodes
				if(!set_node.has(source)) {
					set_node.add(source)
					this.add_node(site_id, source, color, invert, true)
					if(this.dict_site[site_id].data.is_root(source)) {
						root = source
					}
				}
				if(!set_node.has(target)) {
					set_node.add(target)
					this.add_node(site_id, target, color, invert, true)
					if(this.dict_site[site_id].data.is_root(target)) {
						root = target
					}
				}
				// note that edges are unidirectional
				this.add_edge(site_id, source, target, weight)
			})
			/**
			 * represents root of site
			 * size dependent on number of nodes below root
			 */
			var root_id = this.get_nodeID(site_id, root)
			this.cy.$('#' + root_id).style({
				'width': 40 + set_node.size * 2.75,
				'height': 40 + set_node.size * 2.75,
				'font-size': 40 + set_node.size * 0.25
			})
			total += set_node.size
			this.add_edge(site_id, 'S', root, set_node.size)
		}
		// size determined by total nodes in entire graph
		this.cy.$('#S').style({
			'width': 40 + total * 2.75,
			'height': 40 + total * 2.75,
			'font-size': 40 + total
		})
		this.cy.layout({
			name: 'breadthfirst',
			roots: '#S'
		}).run();
	}
	/**
	 * get_nodeID
	 * 		input
	 * 			site_id		string	string	id of site (looks like a hex color code)
	 * 			id			string	id of some node generated by Graph object
	 * 		function
	 * 			determine node id for node when applied to graph
	 * 			to avoid duplicates, nodeID requires site and node id
	 * 			server is exempted from process
	 */
	get_nodeID(site_id, id) {
		return id == 'S' ? 'S' : site_id + '.' + id
	}
	/**
	 * get_edgeID
	 * 		input
	 * 			site_id		string	string	id of site (looks like a hex color code)
	 * 			source		string	parent of target
	 * 			target		string	child of parent
	 * 		function
	 * 			based on node_id of source and target, join with '_' to create edge id
	 */
	get_edgeID(site_id, source, target) {
		var source_id = this.get_nodeID(site_id, source)
		var target_id = this.get_nodeID(site_id, target)
		return source_id + '_' + target_id
	}
	/**
	 * add_node
	 * 		input
	 * 			site_id		string	string	id of site (looks like a hex color code)
	 * 			id			string	id of some node generated by Graph object
	 * 			color		string	hex code representing background color of node
	 * 			invert		string	hex code representing text color of some node
	 * 		function
	 * 			create node in site and assign node to the site
	 * 			roots are drawn as stars, everything else is a circle
	 */
	add_node(site_id, id, color, invert) {
		var node_id = this.get_nodeID(site_id, id)
		this.cy.add({
			data: {
				id: node_id,
				label: this.dict_site[site_id].data.is_root(id) ? site_id + ' - ' + id : id,
				shape: this.dict_site[site_id].data.is_root(id) ? 'star' : 'ellipse',
				color: color,
				invert: invert,
				parent: site_id,
				opacity: 0.75
			}
		})
	}
	/**
	 * add_edge
	 * 		input
	 * 			site_id		string	string	id of site (looks like a hex color code)
	 * 			source		string	parent of target
	 * 			target		string	child of parent
	 * 			weight		int		favorability of link
	 * 		function
	 * 			add link between source and target
	 */
	add_edge(site_id, source, target, weight) {
		this.cy.add({
			data: {
				id: this.get_edgeID(site_id, source, target), 
				source: this.get_nodeID(site_id, source), 
				target: this.get_nodeID(site_id, target),
				weight: weight
			}
		})
	}
	/**
	 * get_colorRandom
	 * 		function
	 * 			generate a random color
	 */
	get_colorRandom() {
		var value = Math.floor(Math.random()*16777215).toString(16)
		var color = '#' + value
		while(color.length < 7) {
			color += '0'
		}
		return color
	}
	/**
	 * get_colorInvert
	 * 		input
	 * 			hexTripletColor		string	some random color
	 * 		function
	 * 			get contrasting color based on input color
	 */
	get_colorInvert(hexTripletColor) {
		var color = hexTripletColor;
		color = color.substring(1);				// remove '#'
		color = parseInt(color, 16);			// convert to integer
		color = 0xFFFFFF ^ color;				// invert three bytes
		color = color.toString(16);				// convert to hex
		color = ("000000" + color).slice(-6);	// pad with leading zeros
		color = "#" + color;					// prepend '#'
		return color;
	}
	/**
	 * adjust_color
	 * 		input
	 * 			col		string	some random color
	 * 			amt		int		positive or negative number
	 * 		function
	 * 			brighten or darken color
	 */
	adjust_color(col, amt) {
		var usePound = false;
		var final_length = 6
		if(col[0] == "#") {
			col = col.slice(1);
			usePound = true;
			final_length = 7
		}
		var num = parseInt(col,16);
		var r = (num >> 16) + amt;
		if(r > 255){
			r = 255
		}
		else if(r < 0){
			r = 0
		}
		var b = ((num >> 8) & 0x00FF) + amt;
		if(b > 255){
			b = 255
		}
		else if(b < 0){
			b = 0
		}
		var g = (num & 0x0000FF) + amt;
		if(g > 255){
			g = 255
		}
		else if(g < 0){
			g = 0
		}
		var string = (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16)
		while(string.length < final_length) {
			string += '0'
		}
		return string
	}
	/**
	 * get_node_byDepth
	 * 		input
	 * 			site_id		string	string	id of site (looks like a hex color code)
	 * 		function
	 * 			get dict representing all nodes at various depths from Graph object
	 */
	get_node_byDepth(site_id) {
		return this.dict_site[site_id].data.get_node_byDepth()
	}
}
