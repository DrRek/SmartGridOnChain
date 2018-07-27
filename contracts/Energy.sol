pragma solidity ^0.4.24;

contract Energy {

	//Associa ad ogni utente il numero di kWh disponibili alla vendita ed al consumo
	mapping(address => uint) prosumer;

	struct storageVirtuale {
		uint dataDiScadenzaVendita;
		uint prezzoAcquisto; //Prezzo a cui viene comprata dallo storage
		uint prezzoVendita; //Prezzo a cui viene venduta dallo storage
		uint identificativo;
		uint wallet;	//TODO forse da rimuovere?
		uint32 capienzaTotale;
		uint32 kWhAttualmenteConservati;
		//Dopo questa data sarà solo possibile comprare i rimanenti kWh
		bool deactivated;
	}

	mapping(address => storageVirtuale[]) energyManager;
	mapping(address => bool) energyManagersMapping;

	event Buy(address prosumerAddress, address storageOwner, uint storageId, uint32 quantity, uint paid);
	event Sell(address prosumerAddress, address storageOwner, uint storageId, uint32 quantity, uint earned);
	event StorageCreated(address owner, uint id);
	event StorageEdited(address owner, uint id);

	function buyFromStorageVirtuale(address addr, uint id, uint32 quantity) public payable{
		require(energyManager[addr].length > id);
		storageVirtuale memory scelto = energyManager[addr][id];
		require(quantity <= scelto.kWhAttualmenteConservati);
		require(msg.value >= scelto.prezzoVendita * quantity); //Il prezzo pagato deve essere abbastanza per la quantità
		
		prosumer[msg.sender] += quantity;
		scelto.kWhAttualmenteConservati -= quantity;
		energyManager[addr][id] = scelto;

		scelto.wallet += scelto.prezzoVendita * quantity;

		emit Buy(msg.sender, addr, id, quantity, msg.value);
	}

	function sellToStorageVirtuale(address addr, uint id, uint32 quantity) public{
		require(energyManager[addr].length > id);
		storageVirtuale memory scelto = energyManager[addr][id];
		require(quantity <= scelto.capienzaTotale - scelto.kWhAttualmenteConservati); //Lo storage deve avere necessità
		require(prosumer[msg.sender] >= quantity); //Il venditore deve possedere abbastanza kWh

		prosumer[msg.sender] -= quantity;
		scelto.kWhAttualmenteConservati += quantity;
		scelto.wallet -= scelto.prezzoAcquisto * quantity;
		energyManager[addr][id] = scelto;

		msg.sender.transfer(quantity * scelto.prezzoAcquisto);

		emit Sell(msg.sender, addr, id, quantity, quantity * scelto.prezzoAcquisto);
	}

	function createStorageVirtuale(uint32 capienzaTotale, uint prezzoAcquisto, uint prezzoVendita, uint dataDiScadenzaVendita) public payable{
		require(isEnergyManager(msg.sender));
		//Nella creazione dello storage è necessario anticipare i soldi per pagare chi ha intenzine di vendere.
 		require(msg.value >= capienzaTotale * prezzoAcquisto);
 		//E' necessario che ci sia un guadagno positivo nella vendita dell'energia.
 		require(prezzoAcquisto < prezzoVendita);

 		energyManager[msg.sender].push(storageVirtuale(dataDiScadenzaVendita, prezzoAcquisto, prezzoVendita, energyManager[msg.sender].length, msg.value, capienzaTotale, 0, false));

 		emit StorageCreated(msg.sender, energyManager[msg.sender].length - 1);
	}

	function editStorageVirtuale(uint id, uint32 capienzaTotale, uint prezzoAcquisto, uint prezzoVendita, uint dataDiScadenzaVendita) public payable{
		require(energyManager[msg.sender].length > id); //Deve essere un id valido
		//E' necessario che ci sia un guadagno positivo nella vendita dell'energia.
 		require(prezzoAcquisto < prezzoVendita);

		storageVirtuale memory temp = energyManager[msg.sender][id];
		//La nuova capienzaTotale non può essere minore dei kWhAttualmenteConservati
		require(capienzaTotale >= temp.kWhAttualmenteConservati);
		//Controlla se il wallet dello storage va bene con la nuova quantità
		require(temp.wallet + msg.value >= capienzaTotale * prezzoAcquisto);

		temp.capienzaTotale = capienzaTotale;
		temp.prezzoAcquisto = prezzoAcquisto;
		temp.prezzoVendita = prezzoVendita;
		temp.dataDiScadenzaVendita = dataDiScadenzaVendita;
		temp.wallet += msg.value;

		energyManager[msg.sender][id]=temp;

		emit StorageEdited(msg.sender, id);
	}

	function getPossessedkWh(address he) public view returns(uint){
		return prosumer[he];
	}

	function givekWh(uint quantity) public {
		prosumer[msg.sender] += quantity;
	}

	function disableStorageVirtuale(uint id) public {
		require(energyManager[msg.sender].length > id);
		energyManager[msg.sender][id].deactivated = true;
	}

	function withdrawFromStorageVirtuale(uint id, uint maxWei) public{
		require(energyManager[msg.sender].length > id);
		storageVirtuale memory temp = energyManager[msg.sender][id];
		uint toWithraw = temp.wallet - ((temp.capienzaTotale - temp.kWhAttualmenteConservati) * temp.prezzoAcquisto);
		if(maxWei <= toWithraw){
			msg.sender.transfer(1000);
		} else {
			msg.sender.transfer(1);
		}
	}

	function getAllStorageVirtuale(address toCheck) public view returns(uint){
		return energyManager[toCheck].length;
	}

	function getStorageVirtuale(address addr, uint id) public view returns(uint, uint, uint, uint, uint, uint32, uint32, bool){
		require(energyManager[addr].length > id);
		storageVirtuale storage temp = energyManager[addr][id];
		return(temp.dataDiScadenzaVendita, temp.prezzoAcquisto, temp.prezzoVendita, temp.identificativo, temp.wallet, temp.capienzaTotale, temp.kWhAttualmenteConservati, temp.deactivated);
	}

	function addEnergyManager(address toAdd) public {
		require(isEnergyManager(msg.sender));
		energyManagersMapping[toAdd] = true;
	}

	function isEnergyManager(address toCheck) public view returns(bool){
		return energyManagersMapping[toCheck];
	}

	//Al deploy il sender deve essere impostato come primo energyManager
	constructor() public{
		energyManagersMapping[msg.sender] = true;
	}

	function () public payable{

	}

	function pay() public payable{

	}
}