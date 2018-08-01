MyStorage = {
	render: async function(){
		let instance = await App.contracts.Energy.deployed();
        let myStorageNumber = await instance.getAllStorageVirtuale(App.userAccount);
        for(var i = 0; i < myStorageNumber; i++){
        	let result = await instance.getStorageVirtuale(App.userAccount, i);
        	MyStorage.addToMyStorage(i, result[6], result[5] - result[6], result[1], result[2], result[0]);
        }
	},

	addToMyStorage: function(id, usedSpace, availableSpace, buyPrice, sellPrice, date) {
		$("tbody.mystorage").prepend("<tr><td>"+id+"</td><td>"+usedSpace+"</td><td>"+availableSpace+"</td><td>"+buyPrice+"</td><td>"+sellPrice+"</td><td class='text-right'>"+date+"</td></tr>");
	},

	createMyStorage: async function(capacità, buy, sell, date){
		let instance = await App.contracts.Energy.deployed();
        await instance.createStorageVirtuale(capacità, buy, sell, date, {value: buy*capacità});
	}
}

function getNewStorageData(){
	MyStorage.createMyStorage($("[name='full-capacity']").val(), $("[name='buy-price']").val(), $("[name='sell-price']").val(), $("[name='date']").val());
}