$(document).ready(function() {
    App.init();
});

App = {
  web3Provider: null,
  contracts: {},
  userAccount: null,

  init: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function(){
    $.getJSON("Energy.json", function(energy) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Energy = TruffleContract(energy);
        // Connect provider to interact with contract
        App.contracts.Energy.setProvider(App.web3Provider);

        var accountInterval = setInterval(function() {
          // Check if account has changed
          if (web3.eth.accounts[0] !== App.userAccount) {
            App.userAccount = web3.eth.accounts[0];

            App.render();
          }
        }, 1000); 
		
        App.listenForEvents();
        return;
      });
  },

  listenForEvents: async function(){
    let instance = await App.contracts.Energy.deployed();

    instance.allEvents({fromBlock: 0, toBlock: 'latest'}, (error, eventResult) => {
      if (error)
        console.log('Error in myEvent event handler: ' + error);
      else
		 if(eventResult.event == "StorageCreated"){
          Storage.addToList(eventResult.args);

        } else if(eventResult.event == "StorageEdited"){

        } else if(eventResult.event == "Sell"){
            web3.eth.getBlock(eventResult.blockNumber, function(error, result){
                if(!error){
                    History.addToHistory(eventResult.args.prosumerAddress, eventResult.args.storageOwner, eventResult.args.storageId, eventResult.event, eventResult.args.quantity, eventResult.args.earned, result.timestamp);
                }else
                    console.error(error);
            });

        } else if(eventResult.event == "Buy"){
            web3.eth.getBlock(eventResult.blockNumber, function(error, result){
                if(!error){
                    History.addToHistory(eventResult.args.prosumerAddress, eventResult.args.storageOwner, eventResult.args.storageId, eventResult.event, eventResult.args.quantity, eventResult.args.paid, result.timestamp);
                }else
                    console.error(error);
            });

        } else {
          console.error("Evento inaspettato "+event);
        }
        /*
		QUESTO NON VA BENE, ANCHE GLI EVENTI VECCHI FANNO RINNOVARE LA PAGINA
		if(eventResult.event == "StorageCreated"){
          Storage.addToList(eventResult.args);
          if(PageManager.current == "storage") PageManager.storage();
          else if(PageManager.current == "mystorage" && eventResult.args.owner == App.userAccount) PageManager.mystorage();

        } else if(eventResult.event == "StorageEdited"){
          if(PageManager.current == "storage") PageManager.storage();
          else if(PageManager.current == "mystorage" && eventResult.args.owner == App.userAccount) PageManager.mystorage();

        } else if(eventResult.event == "Sell"){
            web3.eth.getBlock(eventResult.blockNumber, function(error, result){
                if(!error){
                    History.addToHistory(eventResult.args.prosumerAddress, eventResult.args.storageOwner, eventResult.args.storageId, eventResult.event, eventResult.args.quantity, eventResult.args.earned, result.timestamp);
                }else
                    console.error(error);
            });
            if(PageManager.current == "history") PageManager.history();
            else if(PageManager.current == "home" && eventResult.args.prosumerAddress == App.userAccount) PageManager.home();
            else if(PageManager.current == "mystorage" && eventResult.args.storageOwner == App.userAccount) PageManager.mystorage();

        } else if(eventResult.event == "Buy"){
            web3.eth.getBlock(eventResult.blockNumber, function(error, result){
                if(!error){
                    History.addToHistory(eventResult.args.prosumerAddress, eventResult.args.storageOwner, eventResult.args.storageId, eventResult.event, eventResult.args.quantity, eventResult.args.paid, result.timestamp);
                }else
                    console.error(error);
            });
            if(PageManager.current == "history") PageManager.history();
            else if(PageManager.current == "home" && eventResult.args.prosumerAddress == App.userAccount) PageManager.home();
            else if(PageManager.current == "mystorage" && eventResult.args.storageOwner == App.userAccount) PageManager.mystorage();

        } else {
          console.error("Evento inaspettato "+event);
        }*/
    });
  },

  render: async function(){
    let instance = await App.contracts.Energy.deployed();
    $("#user-account").html(App.userAccount);
    $("#user-account-img").attr("data-jdenticon-value",App.userAccount);
    jdenticon.update('canvas');
	
    //Codice da eseguire se l'utente è anche un energy manager
    if(await instance.isEnergyManager(App.userAccount)){
        $(".energy-manager").show();
    }
    //Prima sezione che verrà caricata
    PageManager.home();
  },

  giveMeKwh: async function(){
    let instance = await App.contracts.Energy.deployed();
    await instance.givekWh(1000);
  }

}

PageManager = {
  current: null,

  home: function(){
    PageManager.current = "home";
    PageManager.cleanWindow();
    $('#home-button').addClass('active');
    $("#dinamic-content").load("html/home.html");
    $("input#search").attr("placeholder", "Search account statistic...");
    $("#page-title").html("User page");
    UserProfile.render();
  },

  history: function(){
    PageManager.current = "history";
    PageManager.cleanWindow();
    $('#history-button').addClass('active');
    $("#dinamic-content").load("html/history.html");
    $("input#search").attr("placeholder", "Search account history...");
    $("#page-title").html("History");
    History.render();
  },

  storage: function(){
    PageManager.current = "storage";
    PageManager.cleanWindow();
    $('#storage-button').addClass('active');
    $("#dinamic-content").load("html/storage.html");
    $("input#search").attr("placeholder", "Search storage...");
    $("#page-title").html("Storage page");
    Storage.render();
  },

  mystorage: function(){
    PageManager.current = "mystorage";
    PageManager.cleanWindow();
    $('#my-storage-button').addClass('active');
    $("#dinamic-content").load("html/my-storage.html");
    $("input#search").attr("placeholder", "Search...");
    $("#page-title").html("My Storage page");
    MyStorage.render();
  },

  cleanWindow: function(){
    $('#dinamic-content').html('');
    $('.sidebar-wrapper >> li').removeClass('active');
  }
}

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

