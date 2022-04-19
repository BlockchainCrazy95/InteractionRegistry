import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from 'ethereum-waffle'
import { expect } from "chai"
import hre, { ethers } from "hardhat"

import { InteractionsRegistry } from "../build/typechain/InteractionsRegistry"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

chai.use(solidity)
chai.use(chaiAsPromised)

const PRICE_PER_TRANSACTION = ethers.utils.parseEther("0.5");

describe ("Token Contract", () => {
  let registryFactory
  let registryContract : InteractionsRegistry
  
  let owner: SignerWithAddress;
  let accountList: SignerWithAddress[];

  before(async () => {
    [owner, ...accountList] = await hre.ethers.getSigners();
    
    // Contract Deployment
    registryFactory = await ethers.getContractFactory("InteractionsRegistry");
    registryContract = await registryFactory.deploy() as InteractionsRegistry
    await registryContract.deployed()

    console.log("InteractionsRegistry deployed at ", registryContract.address);

  })

  describe("InteractionsRegistry", async() => {
    it("Add credit", async () => {
      // Insufficient funds to add credit
      await expect(registryContract.addCredit(ethers.utils.parseEther("0.1"))).to.be.rejectedWith("Insufficient funds to add credit");

      await expect(registryContract.addCredit(ethers.utils.parseEther("0.2"), {value: ethers.utils.parseEther("0.1")})).to.be.rejectedWith("Insufficient funds to add credit");

      console.log("Balance before addCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      await registryContract.connect(accountList[0]).addCredit(ethers.utils.parseEther("1.5"), { value: ethers.utils.parseEther("1.5")});
      console.log("Balance after addCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));

      const res = await registryContract.getCreditInfo(accountList[0].address);
      console.log("Res:", res);
    })

    it("Remove credit", async () => {
      // Credit must be bigger than 0
      await expect(registryContract.removeCredit(0)).to.be.rejectedWith("Value must be bigger than 0");

      // Not enough credit to remove
      await expect(registryContract.connect(accountList[0]).removeCredit(ethers.utils.parseEther("1.6"))).to.be.rejectedWith("Not enough credit to remove");

      console.log("Balance before removeCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      await registryContract.connect(accountList[0]).removeCredit(ethers.utils.parseEther("0.3"));
      console.log("Balance after removeCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));
    })

    it("Submit Interaction", async () => {
      // Insufficient funds
      await expect(registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address)).to.be. rejectedWith("Insufficient funds");

      await expect(registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, { value: ethers.utils.parseEther("0.3")})).to.be. rejectedWith("Insufficient funds");

      console.log("Balance before sumbitInteraction : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      await registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, {value: PRICE_PER_TRANSACTION});
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[1].getBalance()));
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[2].getBalance()));
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[3].getBalance()));

      // Insufficient credit
      await expect(registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, { value: ethers.utils.parseEther("1.5")})).to.be. rejectedWith("Insufficient credit");

      console.log("Balance before sumbitInteraction : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      await registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, {value: ethers.utils.parseEther("0.6")});
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[1].getBalance()));
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[2].getBalance()));
      console.log("Balance after sumbitInteraction : ", ethers.utils.formatEther(await accountList[3].getBalance()));
    })
  })
})