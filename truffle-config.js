require('dotenv').config();
require('babel-register');
require('babel-polyfill');


module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    live:  {
     network_id: 1,
     host: "localhost",
     port:  8545,
     gas: 2612388,
     gasPrice: 1000000000, // 1 gwei
	},
    ropsten:  {
     network_id: 3,
     host: "localhost",
     port:  8545,
     gas: 2612388,
     gasPrice: 1000000000,
	},  
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    testrpc: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    ganache: {
      host: 'localhost',
      port: 7545,
      network_id: '*', // eslint-disable-line camelcase
    },
  },
  rpc: {
    host: 'localhost',
    post:8080
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
};
