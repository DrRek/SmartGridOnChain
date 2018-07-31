History = {
	history: [],

	render: function(){
		for(var i = 0; i < History.history.length; i++){
			History.addToHistoryTable(History.history[i]);
		}
	},

	addToHistory: function(prosumer, storage, id, type, quantity, charge, date) {
		var temp = [];
		temp[0] = prosumer;
		temp[1] = storage;
		temp[2] = id;
		temp[3] = type;
		temp[4] = quantity;
		temp[5] = charge;
		temp[6] = date;
		History.history.push(temp);
	},

	addToHistoryTable: function(element){
		var prosumerString = "<td>"+element[0].substring(0,10)+"...</td>";
		var storageString = "<td>"+element[1].substring(0,10)+"...</td>";
		
		waitForEl("tbody#history", function() {
  			$("tbody#history").append("<tr>"+prosumerString+storageString+"<td>"+element[2]+"</td><td>"+element[3]+"</td><td>"+element[4]+"</td><td>"+element[5]+"</td><td class='text-right'>"+element[6]+"</td></tr>");
		});
	} 
};

//TODO: Sistemare questa funzione per aspettare che la pagina venga creata
var waitForEl = function(selector, callback) {
  if (jQuery(selector).length) {
    callback();
  } else {
    setTimeout(function() {
      waitForEl(selector, callback);
    }, 100);
  }
};