pragma solidity ^0.5.0;

contract Marketplace {
	string public name; //state variable. We declare public to be able to access from  outside
	uint public productCount = 0;
	mapping (uint => Product) public products; //key value relationship: hash table, associative array...etc.
	//key = Product.id, value = the whole "struct"
	
	struct Product { //create your own data structure
		uint id; //unsisgned integer
		string name;
		uint price;
		address payable owner;
		bool purchased;
	}

	//Create a new event inside Solidity
	event ProductCreated(
		uint id, 
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

	//Create a new event inside Solidity
	event ProductPurchased(
		uint id, 
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

	constructor() public { //only gets run 1 time when contract is deployed
		name = "DAI Marketplace";
	}

	function createProduct(string memory _name, uint _price) public {
		//Make sure parameters are correct
		//Require a valid name
		require(bytes(_name).length > 0);
		//Require a valid price
		require(_price > 0);
		//Increment product count
		productCount ++;
		//Create the product
		products[productCount] = Product(productCount, _name, _price, msg.sender, false); //false for not purchased (the bool value in struct Product)
		//Trigger an event - check logs by triggering an event in solidity
		emit ProductCreated(productCount, _name, _price, msg.sender, false);
	}

	function purchaseProduct(uint _id) public payable { //payable - allows for use of 'value' metadata. Actually transfer Ether to the seller.
		// Fetch the product
		Product memory _product = products[_id];
		// Fetch the owner
		address payable _seller = _product.owner;
		// Make sure the product is valid - it can be purchased
		require(_product.id > 0 && _product.id <= productCount);
		// Require that there is enough Ether in the transaction
		require(msg.value >= _product.price);
		// Require that the product has not been purchased
		require(!_product.purchased); /*bang operator*/
		// Require that the buyer is not the seller
		require(_seller != msg.sender); /*we don't want someone to be able to purchase their own product*/
		// Transfer ownership to the buyer
		_product.owner = msg.sender;
		// Mark as purchased
		_product.purchased = true;
		// Update the product in the mapping (placed back in product mapping like this	)
		products[_id] = _product; 
		// Pay the seller by sending them Ether
		address(_seller).transfer(msg.value); //amount of Ether sent in with the function call
		// Trigger an event
		emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
	}
} 	