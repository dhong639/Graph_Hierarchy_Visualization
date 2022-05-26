/**
 * load_site
 * 		function
 * 			get value of site_id selected by user
 * 			clear all previous information
 * 			display new site_id and tables
 */
function load_site() {
	var site_id = document.getElementById('select_site').value
	document.getElementById('currentSite_color').innerHTML = site_id
	emptySelect('remove_source', 1)
	emptySelect('remove_target', 1)
	if(site_id != '') {
		var graph = network.get_site(site_id)
		var nodes = graph.get_nodes()
		add_options(nodes, 'remove_source')
	}
	remove_allChildren('reachability')
	remove_allChildren('levels')
	if(site_id != '') {
		create_table(network.get_site_display(site_id), 'reachability')
		create_table(network.get_node_byDepth(site_id), 'levels')
	}
}

/**
 * load_targets
 * 		function
 * 			based on source id, add elements to 'remove_target'
 * 			all nodes reachable from the current source
 */
function load_targets() {
	emptySelect('remove_target', 1)
	var site_id = document.getElementById('select_site').value
	var source_id = document.getElementById('remove_source').value
	var list_target = network.get_target_bySite_bySource(site_id, source_id)
	add_options(list_target, 'remove_target')
}

/**
 * emptySelect
 * 		input
 * 			elementID	string	name of element in html
 * 			itmes		list	items to add to select element
 * 		function
 * 			add items to select elements
 */
function add_options(items, elementID) {
	items.forEach(item => {
		var option = document.createElement('option')
		option.text = item
		option.value = item
		document.getElementById(elementID).add(option)
	})
}

/**
 * emptySelect
 * 		input
 * 			elementID		string	name of element in html
 * 			count_remaining	int		how many items to retain (from beginning)
 * 		function
 * 			remove elements from select element
 */
function emptySelect(elementID, count_remaining) {
	var select = document.getElementById(elementID)
	var count_current = select.length
	while(count_current != count_remaining) {
		select.remove(count_current - 1)
		count_current = select.length
	}
}

/**
 * remove_link
 * 		function
 * 			remove link by provided site, source, and target id
 * 			update results in network and graph
 * 			refresh displayed tables for site
 */
function remove_link() {
	var site_id = document.getElementById('select_site').value
	var source_id = document.getElementById('remove_source').value
	var target_id = document.getElementById('remove_target').value
	if(site_id != '' && source_id != '' && target_id != '') {
		network.remove_edge(site_id, source_id, target_id)
	}
	emptySelect('remove_target', 1)
	document.getElementById('remove_source').selectedIndex = 0
	remove_allChildren('reachability')
	create_table(network.get_site_display(site_id), 'reachability')
	remove_allChildren('levels')
	create_table(network.get_node_byDepth(site_id), 'levels')
}

/**
 * remove_allChildren
 * 		input
 * 			elementID	string	name of element in html
 * 		function
 * 			remove tables for display, levels, and weights
 */
function remove_allChildren(elementID) {
	var parent = document.getElementById(elementID)
	while(parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild)
	}
}

/**
 * create_table
 * 		input
 * 			dict_data	dict	dictionary of keys and values
 * 									values are either arrays or dictionaries
 * 			elementID	string	name of element in html
 * 		function
 * 			append graph to div for display, levels, and weights
 */
function create_table(dict_data, elementID) {
	var table = document.createElement('table')
	table.classList.add('table')
	table.classList.add('table-dark')
	var tbody = document.createElement('tbody')
	table.appendChild(tbody)
	var list_sourceID = Object.keys(dict_data)
	list_sourceID.sort(function(a, b) {
		return a - b
	})
	list_sourceID.forEach(source_id => {
		var row = document.createElement('tr')
		var header_cell = document.createElement('th')
		var header_strong = document.createElement('strong')
		var header_text
		if(elementID == 'levels') {
			header_text = document.createTextNode('level-' + source_id)
		}
		else{
			header_text = document.createTextNode('node-' + source_id)
		}
		header_strong.appendChild(header_text)
		header_cell.appendChild(header_strong)
		row.appendChild(header_cell)
		/**
		 * arrays create tables with two columns per row
		 * applies only for levels
		 */
		if(Array.isArray(dict_data[source_id])) {
			var list_targetID = dict_data[source_id]
			list_targetID.forEach(target_id => {
				var cell = document.createElement('th')
				var text = document.createTextNode(target_id)
				cell.appendChild(text)
				row.appendChild(cell)
			})
			table.appendChild(row)
		}
		/**
		 * all other items are assumed to be dictionaries
		 * applies for display and weights
		 */
		else {
			var list_targetID = Object.keys(dict_data[source_id])
			list_targetID.sort(function(a, b) {
				return a - b
			})
			list_targetID.forEach(target_id => {
				var cell = document.createElement('th')
				var status = dict_data[source_id][target_id]
				var text = document.createTextNode(target_id + ':' + status)
				cell.appendChild(text)
				row.appendChild(cell)
			})
			table.appendChild(row)
		}
	})
	document.getElementById(elementID).appendChild(table)
}
