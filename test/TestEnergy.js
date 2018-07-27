const Energy = artifacts.require("Energy");

contract('Test del contratto Energy, per la compravendita di kWh puliti', async(accounts) =>{

	it("Test isEnergyManager", async() => {
		let depl = await Energy.deployed();

		//Il creatore del contratto deve essere energy manager
		assert(await depl.isEnergyManager(accounts[0]));

		//Gli altri account non devono essere energy manager
		assert(!await depl.isEnergyManager(accounts[1]));
	})

	it("Test addEnergyManager", async() => {
		let depl = await Energy.deployed();

		//Un non energy manager non deve poter aggiungere un nuovo energy manager
		try{
		    await depl.addEnergyManager(accounts[2], {from: accounts[1]});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Un energy manager deve poter aggiungere un altro energy manager
		await depl.addEnergyManager(accounts[1], {from: accounts[0]});
		assert(await depl.isEnergyManager(accounts[1]));
	})

	it("Test createStorageVirtuale", async() => {
		let depl = await Energy.deployed();

		//Un non energy manager non deve poter aggiungere un proprio storage
		try{
		    await depl.createStorageVirtuale(1000, 100, 150, 123, {from: accounts[2], value: 1000*100});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Bisogna pagare almeno quanto il totale che verrà pagato per l'acquisto dei kWh
		try{
		    await depl.createStorageVirtuale(1000, 100, 150, 123, {from: accounts[0], value: 1000*100-1});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Bisogna comrare a meno di quanto si vende, ci deve essere un guadagno
		try{
		    await depl.createStorageVirtuale(1000, 100, 50, 123, {from: accounts[0], value: 1000*100});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Questa va bene
		await depl.createStorageVirtuale(1000, 100, 150, 123, {from: accounts[0], value: 1000*100});
		assert(await depl.getAllStorageVirtuale(accounts[0]) == 1, "Expected 1 storage virtuale");
		  
	})

	it("Test editStorageVirtuale", async() => {
		let depl = await Energy.deployed();

		//Con un indirizzo non valido non deve funzionare
		try{
		    await depl.editStorageVirtuale(0, 1001, 101, 151, 321, {from: accounts[1], value: (1001*101 - 1000*100)});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Con un id non valido non deve funzionare
		try{
		    await depl.editStorageVirtuale(1, 1001, 101, 151, 321, {from: accounts[0], value: (1001*101 - 1000*100)});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Con un prezzoVendita > prezzoAcquisto non deve funzionare
		try{
		    await depl.editStorageVirtuale(0, 1001, 101, 51, 321, {from: accounts[0], value: (1001*101 - 1000*100)});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		await depl.givekWh(2, {from: accounts[1]});
		await depl.sellToStorageVirtuale(accounts[0], 0, 2, {from: accounts[1]});

		//Con una capacità minore del numero di kwh attualmente presenti non deve essere possibile modificare
		try{
		    await depl.editStorageVirtuale(0, 1, 101, 151, 321, {from: accounts[0], value: (1001*101 - 998*100)});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}	

		//Non avendo abbastanza fondi per pagere chi compra non deve essere eseguito
		try{
		    await depl.editStorageVirtuale(0, 1001, 101, 151, 321, {from: accounts[0], value: (1001*101 - 998*100) - 1});
		    assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		await depl.editStorageVirtuale(0, 1001, 101, 151, 321, {from: accounts[0], value: (1001*101 - 998*100)});

		let test = await depl.getStorageVirtuale(accounts[0], 0);
		assert(test[0] == 321);
		assert(test[1] == 101);
		assert(test[2] == 151);
		assert(test[4] == 1001*101);
		assert(test[5] == 1001);
		assert(test[6] == 2);
		assert(test[7] == false);
	})

	it("Test withdrawFromStorageVirtuale", async() => {
		let depl = await Energy.deployed();

		//Un id sbagliato deve dare errore
		try{
			await depl.withdrawFromStorageVirtuale(1, 100, {from: accounts[2]});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		//Un address sbagliato deve dare errore
		try{
			await depl.withdrawFromStorageVirtuale(1, 100, {from: accounts[3]});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead');
		}

		/* TODO: Riuscire a testare il withdraw con successo
		await depl.createStorageVirtuale(1000, 100, 150, 123, {from: accounts[1], value: 1000*100+1000000000000000000});
		let old = await web3.eth.getBalance(accounts[1]);
		await depl.withdrawFromVirtualStorage(0, 3000000000000000000, {from: accounts[1]});
		assert(old < await web3.eth.getBalance(accounts[1]));
		*/
	})

	it("Test givekWh", async() => {
		let depl = await Energy.deployed();

		depl.givekWh(10000, {from: accounts[0]});
		assert(10000 == await depl.getPossessedkWh(accounts[0]));
	})

	it("Test sellToStorageVirtuale", async() => {
		let depl = await Energy.deployed();

		//Con un indirizzo a caso non deve funzionare
		try{
			await depl.sellToStorageVirtuale(accounts[5], 0, 2, {from: accounts[6]});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 1');
		}

		//Con un id a caso non deve funzionare
		try{
			await depl.sellToStorageVirtuale(accounts[0], 2, 2, {from: accounts[6]});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 2');
		}

		await depl.addEnergyManager(accounts[5], {from: accounts[0]});
		await depl.createStorageVirtuale(1000, 100, 150, 123, {from: accounts[5], value: 1000*100});

		//Con una quantità più alta della necessità non deve funzionare
		try{
			await depl.sellToStorageVirtuale(accounts[5], 2, 1001, {from: accounts[6]});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 3');
		}

		//Senza abbastanza kWh del prosumer non deve essere possibile continuare
		try{
			await depl.sellToStorageVirtuale(accounts[5], 2, 500, {from: accounts[6]});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 3');
		}

		await depl.givekWh(500, {from: accounts[6]});

		//Dovrebbe funzionare
		await depl.sellToStorageVirtuale(accounts[5], 0, 500, {from: accounts[6]});	
		assert(await depl.getPossessedkWh(accounts[6]) == 0, "Expected 0 kWh remaining on the account");
	})

	it("Test buyFromStorageVirtuale", async() => {
		let depl = await Energy.deployed();

		//Con un indirizzo a caso non deve funzionare
		try{
			await depl.buyFromStorageVirtuale(accounts[5], 1, 500, {from: accounts[6], value: 75000});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 1');
		}

		//Con un id a caso non deve funzionare
		try{
			await depl.buyFromStorageVirtuale(accounts[0], 2, 500, {from: accounts[6], value: 75000});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 2');
		}

		//Con più dei kWh richiesti dei posseduti non va bene
		try{
			await depl.buyFromStorageVirtuale(accounts[5], 2, 501, {from: accounts[6], value: 75150});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 3');
		}

		//Non pagando abbastanza non va bene
		try{
			await depl.buyFromStorageVirtuale(accounts[5], 2, 500, {from: accounts[6], value: 74999});
			assert.fail('Expected revert not received');
		} catch (error) {
		    const revertFound = error.message.search('revert') >= 0;
		    assert(revertFound, 'Expected "revert", got '+error+' instead 3');
		}

		await depl.buyFromStorageVirtuale(accounts[5], 0, 500, {from: accounts[6], value: 75000});	
		assert(await depl.getPossessedkWh(accounts[6]) == 500, "Expected 500 kWh remaining on the account");
	})
})