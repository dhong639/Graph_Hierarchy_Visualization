class Network {
	constructor(count_sites, count_nodes, count_ports, div_id) {
		this.dict_site = {}
		for(var i = 0; i<count_sites; i++) {
			var color = this.get_colorRandom()
			var invert = this.get_colorInvert(color)
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
						'color': 'data(invert)',
						'background-color': 'data(color)',
						'background-opacity': 0.75,
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
					selector: ':selected',
					style: {
						'background-color': 'data(invert)',
						'color': 'data(color)',
					}
				}
			]
		})
	}
	display() {
		this.cy.add({
			data: {
				id: 'S',
				label: 'S',
				shape: 'square',
				color: '#000000',
				invert: '#FFFFFF'
			}
		})
		var total = 0
		for(var site_id in this.dict_site) {
			var color = this.dict_site[site_id].color
			var invert = this.dict_site[site_id].invert
			var set_node = new Set()
			var root = null
			this.dict_site[site_id].data.get_display().forEach(edge => {
				var source = edge[0]
				var target = edge[1]
				var weight = edge[2]
				if(!set_node.has(source)) {
					set_node.add(source)
					this.add_node(site_id, source, color, invert)
					if(this.dict_site[site_id].data.is_root(source)) {
						root = source
					}
				}
				if(!set_node.has(target)) {
					set_node.add(target)
					this.add_node(site_id, target, color, invert)
					if(this.dict_site[site_id].data.is_root(target)) {
						root = target
					}
				}
				this.add_edge(site_id, source, target, weight)
			})
			var root_id = this.get_id_node(site_id, root)
			this.cy.$('#' + root_id).style({
				'width': 40 + set_node.size * 2.75,
				'height': 40 + set_node.size * 2.75,
				'font-size': 40 + set_node.size * 0.25
			})
			total += set_node.size
			this.add_edge(site_id, 'S', root, set_node.size)
		}
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
	get_id_node(site_id, id) {
		return id == 'S' ? 'S' : site_id + '-' + id
	}
	get_id_edge(site_id, source, target) {
		var source_id = this.get_id_node(site_id, source)
		var target_id = this.get_id_node(site_id, target)
		return source_id + '_' + target_id
	}
	add_node(site_id, id, color, invert) {
		var node_id = this.get_id_node(site_id, id)
		this.cy.add({
			data: {
				id: node_id,
				label: id,
				shape: this.dict_site[site_id].data.is_root(id) ? 'star' : 'ellipse',
				color: color,
				invert: invert
			}
		})
	}
	add_edge(site_id, source, target, weight) {
		this.cy.add({
			data: {
				id: this.get_id_edge(site_id, source, target), 
				source: this.get_id_node(site_id, source), 
				target: this.get_id_node(site_id, target),
				weight: weight
			}
		})
	}
	get_colorRandom() {
		var value = Math.floor(Math.random()*16777215).toString(16)
		var color = '#' + value
		while(color.length < 7) {
			color += '0'
		}
		return color
	}
	get_colorInvert(hexTripletColor) {
		var color = hexTripletColor;
		color = color.substring(1); // remove #
		color = parseInt(color, 16); // convert to integer
		color = 0xFFFFFF ^ color; // invert three bytes
		color = color.toString(16); // convert to hex
		color = ("000000" + color).slice(-6); // pad with leading zeros
		color = "#" + color; // prepend #
		return color;
	}
}