function load_site() {
	var site_id = document.getElementById('select_site').value
	var color = site_id != '' ? network.get_colorMain(site_id) : '#000000'
	var invert = site_id != '' ? network.get_colorInvert(site_id) : '#FFFFFF'
	console.log(color + '\t' + invert)
	var text = site_id != '' ? site_id : text
	currentSite_color = document.getElementById('currentSite_color')
	currentSite_color.innerHTML = site_id
	currentSite_color.style.color = invert
	currentSite_color.style.backgroundColor = color
	emptySelect('remove_source', 1)
	emptySelect('remove_target', 1)
	if(site_id != '') {
		var graph = network.get_site(site_id)
		var nodes = graph.get_nodes()
		add_options(nodes, 'remove_source')
	}
	remove_allChildren('reachability')
	create_table(network.get_site_display(site_id), 'reachability')
}

function load_targets() {
	emptySelect('remove_target', 1)
	var site_id = document.getElementById('select_site').value
	var source_id = document.getElementById('remove_source').value
	var list_target = network.get_target_bySite_bySource(site_id, source_id)
	add_options(list_target, 'remove_target')
}

function add_options(items, elementID) {
	items.forEach(item => {
		var option = document.createElement('option')
		option.text = item
		option.value = item
		document.getElementById(elementID).add(option)
	})
}

function emptySelect(elementID, count_remaining) {
	var select = document.getElementById(elementID)
	var count_current = select.length
	while(count_current != count_remaining) {
		select.remove(count_current - 1)
		count_current = select.length
	}
}

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
}

function remove_allChildren(elementID) {
	var parent = document.getElementById(elementID)
	while(parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild)
	}
}

function create_table(dict_display, elementID) {
	var table = document.createElement('table')
	table.classList.add('table')
	table.classList.add('table-dark')
	var tbody = document.createElement('tbody')
	table.appendChild(tbody)
	var list_sourceID = Object.keys(dict_display)
	list_sourceID.sort(function(a, b) {
		return a - b
	})
	list_sourceID.forEach(source_id => {
		var row = document.createElement('tr')
		var header_cell = document.createElement('th')
		var header_strong = document.createElement('strong')
		var header_text = document.createTextNode(source_id)
		header_strong.appendChild(header_text)
		header_cell.appendChild(header_strong)
		row.appendChild(header_cell)
		var list_targetID = Object.keys(dict_display[source_id])
		list_targetID.sort(function(a, b) {
			return a - b
		})
		list_targetID.forEach(target_id => {
			var cell = document.createElement('th')
			var status = dict_display[source_id][target_id]
			var text = document.createTextNode(target_id + ':' + status)
			cell.appendChild(text)
			row.appendChild(cell)
		})
		table.appendChild(row)
	})
	document.getElementById(elementID).appendChild(table)
}
