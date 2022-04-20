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

      // console.log("Balance before addCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      let res = await registryContract.getCreditInfo(accountList[0].address);
      await expect(res.ethAmount).to.equal(ethers.utils.parseEther("0"));
      await registryContract.connect(accountList[0]).addCredit(ethers.utils.parseEther("1.5"), { value: ethers.utils.parseEther("1.5")});
      // console.log("Balance after addCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));

      res = await registryContract.getCreditInfo(accountList[0].address);
      await expect(res.ethAmount).to.equal(ethers.utils.parseEther("1.5"));
    })

    it("Remove credit", async () => {
      // Credit must be bigger than 0
      await expect(registryContract.removeCredit(0)).to.be.rejectedWith("Value must be bigger than 0");

      // Not enough credit to remove
      await expect(registryContract.connect(accountList[0]).removeCredit(ethers.utils.parseEther("1.6"))).to.be.rejectedWith("Not enough credit to remove");

      // console.log("Balance before removeCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      await registryContract.connect(accountList[0]).removeCredit(ethers.utils.parseEther("0.3"));
      // console.log("Balance after removeCredit : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      let res = await registryContract.getCreditInfo(accountList[0].address);
      await expect(res.ethAmount).to.equal(ethers.utils.parseEther("1.2"));
    })

    it("Submit Interaction", async () => {
      // Insufficient funds
      await expect(registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address)).to.be. rejectedWith("Insufficient funds");

      await expect(registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, { value: ethers.utils.parseEther("0.3")})).to.be. rejectedWith("Insufficient funds");

      // console.log("Balance before sumbitInteraction : ", ethers.utils.formatEther(await accountList[0].getBalance()));
      let res = await registryContract.getCreditInfo(accountList[0].address);
      await registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, {value: PRICE_PER_TRANSACTION});
      // await expect(owner.getBalance()).to.equal(ethers.utils.parseEther("10000.025"));
      res = await registryContract.getCreditInfo(accountList[0].address);
      expect(res.ethAmount).to.equal(ethers.utils.parseEther("0.7"));
      expect(await accountList[1].getBalance()).to.equal(ethers.utils.parseEther("10000.2375"));
      expect(await accountList[2].getBalance()).to.equal(ethers.utils.parseEther("10000.11875"));
      expect(await accountList[3].getBalance()).to.equal(ethers.utils.parseEther("10000.11875"));
      
      // Insufficient credit
      await expect(registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, { value: ethers.utils.parseEther("1.5")})).to.be. rejectedWith("Insufficient credit");

      await registryContract.connect(accountList[0]).submitInteraction(accountList[0].address, accountList[1].address, accountList[2].address, accountList[3].address, {value: ethers.utils.parseEther("0.6")});
      res = await registryContract.getCreditInfo(accountList[0].address);
      expect(res.ethAmount).to.equal(ethers.utils.parseEther("0.1"));
      expect(await accountList[1].getBalance()).to.equal(ethers.utils.parseEther("10000.5225"));
      expect(await accountList[2].getBalance()).to.equal(ethers.utils.parseEther("10000.26125"));
      expect(await accountList[3].getBalance()).to.equal(ethers.utils.parseEther("10000.26125"));
    })
  })
})