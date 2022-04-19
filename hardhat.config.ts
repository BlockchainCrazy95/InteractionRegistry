import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";

dotenv.config();

const infura_api_key = process.env.INFURA_API_KEY
const privateKey = process.env.PRIVATE_KEY
const mnemonic = process.env.MNEMONIC

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers:[
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  paths:{
    cache: './build/cache',
    artifacts: './build/artifacts'
  },
  typechain:{
    outDir: './build/typechain'
  },
  networks: { 
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: 
      { mnemonic: mnemonic}
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${infura_api_key}`,
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${infura_api_key}`,
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    ava_test: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${infura_api_key}`,
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    poly_test: {
      url: 'https://rpc-mumbai.matic.today',
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    polygon: {
      url: 'https://rpc-mainnet.matic.network',
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    bsc_test: {
      url: 'https://speedy-nodes-nyc.moralis.io/f20199705d9b3bb894f74574/bsc/testnet',
      accounts: privateKey !== undefined ? [privateKey] : []
    },
    bsc_main: {
      url: 'https://bsc-dataseed.binance.org/',
      accounts: privateKey !== undefined ? [privateKey] : []
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined && process.env.REPORT_GAS == 'true',
    currency: "USD",
  },
  etherscan: {
    // apiKey: "FU1AS6EIA7CMEYS2SFP7Q4R4HEC2B33KV3", //etherscan_api
    // apiKey: "28EDTKTB42367Q2MVEWBYZCGVCRST7CGWG",    //avalanche_api
    // apiKey: "RZDZIJGC2GP83N2KF5QVJ18Q6YPJ2Y5JV8", //polygon_api
    apiKey: "DWS7T88FYW6YTCP4DWVUBFUGZEKXQUJ6ZZ" //bscscan_api
  },
};

export default config;
