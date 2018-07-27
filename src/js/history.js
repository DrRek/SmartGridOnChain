historyTable = {
	boh: function(){},
	addToHistory: function(prosumer, storage, id, type, quantity, charge, date) {
		var prosumerString = "<td>"+prosumer.substring(0,10)+"...</td>";
		var storageString = "<td>"+storage.substring(0,10)+"...</td>";
		$("tbody.history").prepend("<tr>"+prosumerString+storageString+"<td>"+id+"</td><td>"+type+"</td><td>"+quantity+"</td><td>"+charge+"</td><td class='text-right'>"+date+"</td></tr>");
	}
};