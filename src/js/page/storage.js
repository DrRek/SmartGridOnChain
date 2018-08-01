Storage = {
  storages: [],

  render: async function(){
	let instance = await App.contracts.Energy.deployed();
    for(var i = 0; i<Storage.storages.length; i++){
      let storage = await instance.getStorageVirtuale(Storage.storages[i].owner, Storage.storages[i].id);
      Storage.addStorageEntry(Storage.storages[i].owner, Storage.storages[i].id, storage[2], storage[1], storage[6], storage[5]-storage[6]);
    }
    jdenticon.update('canvas.storageImg');
  },

  addToList: function(storage){
    Storage.storages.push(storage);
  },

	addStorageEntry: function(address, id, acquisto, vendita, acquistabili, vendibili){
		var toAppend = ''+
    		'<div class="col-lg-4 col-md-4">'+
          '<div class="card card-chart">'+
            '<div class="card-header">'+
              '<h5 class="card-category">Virtual Storage</h5>'+
              '<div class="dropdown">'+
                  '<button type="button" class="btn btn-round btn-default dropdown-toggle btn-simple btn-icon no-caret" data-toggle="dropdown">'+
                  '<i class="fas fa-archive"></i>'+
                '</button>'+
                '<div class="dropdown-menu dropdown-menu-right">'+
                  '<a class="dropdown-item" onclick="StorageTransactions.buyModalShow(\''+address+'\',\''+id+'\')">Buy</a>'+
                  '<a class="dropdown-item" onclick="StorageTransactions.sellModalShow(\''+address+'\',\''+id+'\')">Sell</a>'+
                '</div>'+
              '</div>'+
            '</div>'+
            '<div class="card-body">'+
                '<canvas class="storageImg" data-jdenticon-value="'+address+'" style="margin-left: calc(50% - 50px);" class="rounded-circle" width="100" height="100"></canvas><br>'+
                '<a href="#" class="simple-text logo-normal text-center center-in-parent" style="font-size: 11px !important; white-space:nowrap; overflow:scroll;">'+
                  address+
                  '<br>'+
                  'ID: '+id+
                '</a>'+
                '<hr style="margin-right: 10%; margin-left: 10%; margin-top: 5px; margin-bottom: 5px;">'+
                '<div style="margin-left: 10px; margin-right: 10px;">'+
                  '<span>Purchase price kWh:</span><span style="float: right;">'+acquisto+' Eth</span><br>'+
                  '<span>Available kWh:</span><span style="float: right;">'+acquistabili+' kWh</span>'+
                '</div>'+
                '<hr style="margin-right: 10%; margin-left: 10%; margin-top: 5px; margin-bottom: 5px;">'+
                '<div style="margin-left: 10px; margin-right: 10px;">'+
                  '<span>Sale price kWh:</span><span style="float: right;">'+vendita+' Eth</span><br>'+
                  '<span>Salable kWh: </span><span style="float: right;">'+vendibili+' kWh</span>'+
                '</div>'+
            '</div>'+
            '<div class="card-footer" style="margin-top: 10px;">'+
              '<div class="stats">'+
                '<i class="fas fa-sync-alt"></i> Just updated'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>';
    $('#storage-container').append(toAppend);
  }
}

StorageTransactions = {
  selected: null,

  buyModalShow: async function(address, id){
    let instance = await App.contracts.Energy.deployed();
    StorageTransactions.selected = await instance.getStorageVirtuale(address, id);  
    $("#modal-title").html("Buy from "+address);
    $("#modal-button").html("Buy");
    $("[name='kwh']").prop('disabled', false);
    $("[name='eth']").prop('disabled', true);
    $("[name='kwh']").attr("onkeyup","StorageTransactions.calculateEthBuy()");
    $("#modal-button").attr("onclick","StorageTransactions.buy('"+address+"',"+id+")");
    StorageTransactions.calculateEthBuy();
    $("#modal-trigger").click();
  },

  buy: async function(address, id){
	let instance = await App.contracts.Energy.deployed();
    instance.buyFromStorageVirtuale(address, id, $("[name='kwh']").val(), {value: StorageTransactions.calculateEthBuy()});
  },

  calculateEthBuy: function(){
    $("[name='eth']").val($("[name='kwh']").val() * StorageTransactions.selected[2]);
    return $("[name='kwh']").val() * StorageTransactions.selected[2];
  },

  sellModalShow: async function(address, id){
	let instance = await App.contracts.Energy.deployed();
    StorageTransactions.selected = await instance.getStorageVirtuale(address, id);  
    $("#modal-title").html("Sell to "+address);
    $("#modal-button").html("Sell");
    $("[name='kwh']").prop('disabled', false);
    $("[name='eth']").prop('disabled', true);
    $("[name='kwh']").attr("onkeyup","StorageTransactions.calculateEthSell()");
    $("#modal-button").attr("onclick","StorageTransactions.sell('"+address+"',"+id+")");
    StorageTransactions.calculateEthSell();
    $("#modal-trigger").click();
  },

  sell: async function(address, id){
	let instance = await App.contracts.Energy.deployed();
    instance.sellToStorageVirtuale(address, id, $("[name='kwh']").val());
  },

  calculateEthSell: function(){
    $("[name='eth']").val($("[name='kwh']").val() * StorageTransactions.selected[1]);
    return $("[name='kwh']").val() * StorageTransactions.selected[1];
  }
}