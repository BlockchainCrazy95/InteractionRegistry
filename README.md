# Interactions Registry (Proof of Concept)
## About
This project requires developing a simple smart contract that distributes tokens to multiple addresses as part of an “interaction” that occurs off-chain.

## Installation
```shell
$ yarn install
```
## Usage
### Build
```shell
$ yarn compile
$ npx hardhat compile
```
### Test
```shell
$ yarn test
$ npx hardhat Test
```

## Deploying contracts to Testnet (Public)

### Deploy CLI
```shell
$ yarn deploy [NETWORK_NAME]
$ npx hardhat run scripts/deploy.ts --network [NETWORK_NAME]
```
In this project, I deployed contract on BSC testnet.

Please check this url:
https://testnet.bscscan.com/address/0x21F672dA9aef56b9B35f527a689960795bB6DDb3

### Verify Contract
```shell
$ yarn verify [NETWORK_NAME] [CONTRACT_ADDRESS] [...CONSTRUCTOR_PARAMS]
$ npx hardhat verify --network [NETWORK_NAME] [CONTRACT_ADDRESS] [...CONSTRUCTOR_PARAMS]
```
### Environment variable

Create a `.env` using `.env.example` file.

- .env.example
```
INFURA_API_KEY = "INFURA_API_KEY"
PRIVATE_KEY = "YOUR_PRIVATE_KEY"
MNEMONIC = "YOUR MNEMONIC"
REPORT_GAS = true/false
```