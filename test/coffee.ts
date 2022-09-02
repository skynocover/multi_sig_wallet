import { ethers, waffle } from "hardhat";

async function getBalance(address: string) {
  const balanceBigInt = await waffle.provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses: string[]) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos: any[]) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    console.table([owner.address, addr1.address, addr2.address]);

    const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
    const buyMeACoffee = await BuyMeACoffee.deploy();
    await buyMeACoffee.deployed();
    console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);

    const addresses = [owner.address, addr1.address, buyMeACoffee.address];

    // Buy the owner a few coffees.
    const tip = { value: ethers.utils.parseEther("1") };
    console.log(tip);
    await buyMeACoffee.connect(addr1).buyCoffee("Carolina", "You're the best!", tip);
    await buyMeACoffee.connect(addr2).buyCoffee("Vitto", "Amazing teacher", tip);
    await buyMeACoffee.connect(addr3).buyCoffee("Kay", "I love my Proof of Knowledge", tip);

    // Check balances after the coffee purchase.
    console.log("== bought coffee ==");
    await printBalances(addresses);

    // Withdraw.
    await buyMeACoffee.connect(addr1).withdrawTips();

    // Check balances after withdrawal.
    console.log("== withdrawTips ==");
    await printBalances(addresses);

    // Check out the memos.
    console.log("== memos ==");
    const memos = await buyMeACoffee.getMemos();
    printMemos(memos);
  });
});
