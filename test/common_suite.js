const BigNumber = web3.BigNumber;
var suite = require('token-test-suite/lib/suite');

const QuintessenceToken = artifacts.require('QuintessenceToken');
const initialSupply = new BigNumber((56000000 * 10**18)*4).dividedToIntegerBy(100);

let options = function(accounts) { return {
	// accounts to test with, accounts[0] being the contract owner
	accounts: accounts,
    
    // factory method to create new token contract
	create: async function () {
		return await QuintessenceToken.new();
	},

	// factory callbacks to mint the tokens
	// use "transfer" instead of "mint" for non-mintable tokens
	mint: async function (token, to, amount) {
		return await token.mint(to, amount, { from: accounts[0] });
	},

    transfer: null,

	// optional:
	// also test the increaseApproval/decreaseApproval methods (not part of the ERC-20 standard)
	increaseDecreaseApproval: false,


	// token info to test
	name: 'Quintessence Token',
	symbol: 'QST',
	decimals: 18,

	// initial state to test
	initialSupply: initialSupply,
	initialBalances: [
		[accounts[0], initialSupply]
	],
	initialAllowances: [
		[accounts[0], accounts[1], 0]
	]
};};

contract('QuintessenceToken', function (accounts) { suite(options(accounts)) });
