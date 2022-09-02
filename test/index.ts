import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    console.table([owner.address, addr1.address, addr2.address]);

    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    // 加上connect 可以指定帳號
    // const greeter = await Greeter.connect(addr1).deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter
      .connect(addr1)
      .setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
