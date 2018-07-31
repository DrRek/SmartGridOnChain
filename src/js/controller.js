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
        console.log("Evento: "+eventResult.event);
        if(eventResult.event == "StorageCreated"){
            storageDisplay.addToList(eventResult.args);
        }else if(eventResult.event == "Sell"){
            web3.eth.getBlock(eventResult.blockNumber, function(error, result){
                if(!error){
                    console.log(eventResult);
                    historyTable.addToHistory(eventResult.args.prosumerAddress, eventResult.args.storageOwner, eventResult.args.storageId, eventResult.event, eventResult.args.quantity, eventResult.args.earned, result.timestamp);
                }else
                    console.error(error);
            });
        }
    });
  },

  render: async function(){

    let instance = await App.contracts.Energy.at(App.contractAddress);
    if(await instance.isEnergyManager(App.userAccount)){
        $(".energy-manager").show();
    }
    
    home();
  },

  renderHome: async function(){
    let instance = await App.contracts.Energy.at(App.contractAddress);
    let currentKwh = await instance.getPossessedkWh(App.userAccount);
    $("#balanceKwh").text(currentKwh);


    web3.eth.getBalance(App.userAccount, function(error, result){
        if(!error)
            $("#balanceEth").text(result);
        else
            console.error(error);
    });
  },

  giveMeKwh: async function(){
    let instance = await App.contracts.Energy.at(App.contractAddress);
    await instance.givekWh(1000);
  }

}

$(document).ready(function() {
    App.init();
});

function home(){
	cleanWindow();
	$('#home-button').addClass('active');
    $("#dinamic-content").load("home.html");
    $("input#search").attr("placeholder", "Search account statistic...");
    $("#page-title").html("User page");
    App.renderHome();
}

function history(){
	cleanWindow();
	$('#history-button').addClass('active');
    $("#dinamic-content").load("history.html");
    $("input#search").attr("placeholder", "Search account history...");
    $("#page-title").html("History");
    historyTable.render();
}

function storage(){
	cleanWindow();
	$('#storage-button').addClass('active');
    $("#dinamic-content").load("storage.html");
    $("input#search").attr("placeholder", "Search storage...");
    $("#page-title").html("Storage page");
    storageDisplay.render();
}

function mystorage(){
    cleanWindow();
    $('#my-storage-button').addClass('active');
    $("#dinamic-content").load("my-storage.html");
    $("input#search").attr("placeholder", "Search...");
    $("#page-title").html("My Storage page");
    myStorage.render();
}

function cleanWindow(){
	$('#dinamic-content').html('');
	$('.sidebar-wrapper >> li').removeClass('active');
}