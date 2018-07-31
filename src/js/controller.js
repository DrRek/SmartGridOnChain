$(document).ready(function() {
    App.init();
});

App = {
  web3Provider: null,
  contracts: {},
  userAccount: null,
  //Ricordati di inserire l'address del contratto come stringa
  contractAddress: "0x3958d9d1fbf834b9aaa6c415092bc5d76db60406",

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
    let instance = await App.contracts.Energy.at(App.contractAddress);

    instance.allEvents({fromBlock: 0, toBlock: 'latest'}, (error, eventResult) => {
      if (error)
        console.log('Error in myEvent event handler: ' + error);
      else
        if(eventResult.event == "StorageCreated"){
            Storage.addToList(eventResult.args);
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
        }
    });
  },

  render: async function(){
    let instance = await App.contracts.Energy.at(App.contractAddress);
    $("#user-account").html(App.userAccount);
    $("#user-account-img").attr("data-jdenticon-value",App.userAccount);
    jdenticon.update('canvas');
    //Codice da eseguire se l'utente è anche un energy manager
    if(await instance.isEnergyManager(App.userAccount)){
        $(".energy-manager").show();
    }
    //Prima sezione che verrà caricata
    home();
  },

  giveMeKwh: async function(){
    let instance = await App.contracts.Energy.at(App.contractAddress);
    await instance.givekWh(1000);
  }

}

function home(){
	cleanWindow();
	$('#home-button').addClass('active');
    $("#dinamic-content").load("home.html");
    $("input#search").attr("placeholder", "Search account statistic...");
    $("#page-title").html("User page");
    UserProfile.render();
}

function history(){
	cleanWindow();
	$('#history-button').addClass('active');
    $("#dinamic-content").load("history.html");
    $("input#search").attr("placeholder", "Search account history...");
    $("#page-title").html("History");
    History.render();
}

function storage(){
	cleanWindow();
	$('#storage-button').addClass('active');
    $("#dinamic-content").load("storage.html");
    $("input#search").attr("placeholder", "Search storage...");
    $("#page-title").html("Storage page");
    Storage.render();
}

function mystorage(){
    cleanWindow();
    $('#my-storage-button').addClass('active');
    $("#dinamic-content").load("my-storage.html");
    $("input#search").attr("placeholder", "Search...");
    $("#page-title").html("My Storage page");
    MyStorage.render();
}

function cleanWindow(){
	$('#dinamic-content').html('');
	$('.sidebar-wrapper >> li').removeClass('active');
}