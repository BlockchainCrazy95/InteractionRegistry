// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ", owner.address);

  console.log("Account balance: ", (await owner.getBalance()).toString());

  
  const registryFactory = await ethers.getContractFactory("InteractionsRegistry");
  const registryContract = await registryFactory.deploy( )

  await registryContract.deployed()
  console.log("InteractionsRegistry deployed at ", registryContract.address)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*
  https://testnet.bscscan.com/address/0x21F672dA9aef56b9B35f527a689960795bB6DDb3
*/