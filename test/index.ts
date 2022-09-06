import { expect } from "chai";
import { ethers } from "hardhat";

import { erc20EncodeApprove, erc20EncodeTransferFrom, erc20EncodeTransfer } from "./erc20";
import { erc721EncodeTransfer } from "./erc721";
import { erc1155EncodeTransfer, erc1155EncodeBatchTransfer } from "./erc1155";
import { BytesLike, BigNumber } from "ethers";

describe("multi sig wallet", () => {
  it("eth tx", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const wa = await multiSigWallet([owner.address, addr1.address], 1);
    {
      const tx = await owner.sendTransaction({
        to: wa.address,
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
    }
    expect(await contractBalance(wa.provider, wa.address)).to.eq("1.0");

    await txConfirm(wa, addr2.address, ethers.utils.parseEther("0.5"), [], 0);

    expect(await contractBalance(wa.provider, wa.address)).to.eq("0.5");
    expect(await signerBalance(addr2)).to.eq("10000.5");
  });

  it("ERC721a", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const ERC721 = await ethers.getContractFactory("MyMint");
    const erc721 = await ERC721.deploy("erc721", "ERC");
    await erc721.deployed();

    {
      const tx = await erc721.mint(1);
      await tx.wait();

      expect(await erc721.balanceOf(owner.address)).to.equal(1);
    }

    const wa = await multiSigWallet([owner.address, addr1.address], 1);

    {
      const tx = await erc721["safeTransferFrom(address,address,uint256)"](
        owner.address,
        wa.address,
        1,
      );
      await tx.wait();
      expect(await erc721.balanceOf(owner.address)).to.equal(0);
      expect(await erc721.balanceOf(wa.address)).to.equal(1);
    }

    await txConfirm(wa, erc721.address, 0, erc721EncodeTransfer(wa.address, addr2.address, "1"), 0);

    expect(await erc721.balanceOf(addr2.address)).to.equal(1);
    expect(await erc721.balanceOf(wa.address)).to.equal(0);
  });

  it("ERC20", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy();
    await erc20.deployed();

    const mint = 20;
    const approve = 10;
    const transfer = 5;

    {
      const tx = await erc20.mint(mint);
      await tx.wait();
      expect(await erc20.balanceOf(owner.address)).to.equal(mint);
    }

    const wa = await multiSigWallet([owner.address, addr1.address], 1);

    {
      const tx = await erc20.transfer(wa.address, approve);
      await tx.wait();
      expect(await erc20.balanceOf(owner.address)).to.equal(mint - approve);
      expect(await erc20.balanceOf(wa.address)).to.equal(approve);
    }

    await txConfirm(wa, erc20.address, 0, erc20EncodeApprove(wa.address, approve), 0);
    await txConfirm(
      wa,
      erc20.address,
      0,
      erc20EncodeTransferFrom(wa.address, addr1.address, approve),
      1,
    );
    expect(await erc20.balanceOf(wa.address)).to.equal(0);
    expect(await erc20.balanceOf(addr1.address)).to.equal(approve);

    {
      const tx = await erc20.transfer(wa.address, mint - approve);
      await tx.wait();
      expect(await erc20.balanceOf(owner.address)).to.equal(0);
      expect(await erc20.balanceOf(wa.address)).to.equal(mint - approve);
    }

    await txConfirm(wa, erc20.address, 0, erc20EncodeTransfer(addr2.address, transfer), 2);
    expect(await erc20.balanceOf(wa.address)).to.equal(mint - approve - transfer);
    expect(await erc20.balanceOf(addr2.address)).to.equal(transfer);
  });

  it("ERC1155", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const ERC1155 = await ethers.getContractFactory("ERC1155Token");
    const erc1155 = await ERC1155.deploy(
      "berserker",
      "https://localhost",
      ["BSK1", "BSK2", "BSK3", "BSK4"],
      [1, 2, 3, 4],
    );
    await erc1155.deployed();

    {
      const tx = await erc1155.mint(owner.address, 1, 100);
      await tx.wait();
      expect(await erc1155.balanceOf(owner.address, 1)).to.equal(100);
    }

    const wa = await multiSigWallet([owner.address, addr1.address], 1);

    {
      const tx = await erc1155.safeTransferFrom(owner.address, wa.address, 1, 50, []);
      await tx.wait();
      expect(await erc1155.balanceOf(owner.address, 1)).to.equal(50);
      expect(await erc1155.balanceOf(wa.address, 1)).to.equal(50);
    }

    await txConfirm(
      wa,
      erc1155.address,
      0,
      erc1155EncodeTransfer(wa.address, addr1.address, 1, 25, []),
      0,
    );
    expect(await erc1155.balanceOf(wa.address, 1)).to.equal(25);
    expect(await erc1155.balanceOf(addr1.address, 1)).to.equal(25);

    await txConfirm(
      wa,
      erc1155.address,
      0,
      erc1155EncodeBatchTransfer(wa.address, addr1.address, [1], [10], []),
      1,
    );
    expect(await erc1155.balanceOf(wa.address, 1)).to.equal(15);
    expect(await erc1155.balanceOf(addr1.address, 1)).to.equal(35);
  });

  it("confirm", async () => {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const wallet = await multiSigWallet([owner.address, addr1.address, addr2.address], 2);

    {
      const tx = await owner.sendTransaction({
        to: wallet.address,
        value: ethers.utils.parseEther("100"),
      });
      await tx.wait();
    }
    expect(await contractBalance(wallet.provider, wallet.address)).to.eq("100.0");

    const submit = await wallet.submitTransaction(addr3.address, ethers.utils.parseEther("50"), []);
    await submit.wait();

    expect(await wallet.getTransactionCount()).to.eq(1);

    {
      const { to, value, data, executed, numConfirmations } = await wallet.getTransaction(0);
      expect(to).to.eq(addr3.address);
      expect(value).to.eq(ethers.utils.parseEther("50"));
      expect(data).to.eq("0x");
      expect(executed).to.eq(false);
      expect(numConfirmations).to.eq(0);
    }

    try {
      await wallet.executeTransaction(0);
      expect(0).to.eq(1);
    } catch (error: any) {
      expect(error.message).to.eq(
        "VM Exception while processing transaction: reverted with reason string 'cannot execute tx'",
      );
    }

    const confirm = await wallet.confirmTransaction(0);
    await confirm.wait();
    {
      const { executed, numConfirmations } = await wallet.getTransaction(0);
      expect(executed).to.eq(false);
      expect(numConfirmations).to.eq(1);
    }

    try {
      await wallet.executeTransaction(0);
      expect(0).to.eq(1);
    } catch (error: any) {
      expect(error.message).to.eq(
        "VM Exception while processing transaction: reverted with reason string 'cannot execute tx'",
      );
    }

    try {
      await wallet.confirmTransaction(0);
    } catch (error: any) {
      expect(error.message).to.eq(
        "VM Exception while processing transaction: reverted with reason string 'tx already confirmed'",
      );
    }

    const confirm2 = await wallet.connect(addr1).confirmTransaction(0);
    await confirm2.wait();
    {
      const { executed, numConfirmations } = await wallet.getTransaction(0);
      expect(executed).to.eq(false);
      expect(numConfirmations).to.eq(2);
    }

    const exec = await wallet.executeTransaction(0);
    await exec.wait();

    expect(await signerBalance(addr3)).to.eq("10050.0");
    expect(await contractBalance(wallet.provider, wallet.address)).to.eq("50.0");

    const submit2 = await wallet.submitTransaction(
      addr3.address,
      ethers.utils.parseEther("50"),
      [],
    );
    await submit2.wait();

    const index = await wallet.getTransactionCount();

    try {
      await wallet.revokeConfirmation(index.toNumber() - 1);
    } catch (error: any) {
      expect(error.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'tx not confirmed'",
      );
    }

    {
      const confirm = await wallet.confirmTransaction(index.toNumber() - 1);
      await confirm.wait();
      const revoke = await wallet.revokeConfirmation(index.toNumber() - 1);
      await revoke.wait();

      const { executed, numConfirmations } = await wallet.getTransaction(index.toNumber() - 1);
      expect(executed).to.eq(false);
      expect(numConfirmations).to.eq(0);
    }

    {
      const confirm = await wallet.confirmTransaction(index.toNumber() - 1);
      await confirm.wait();
      const { executed, numConfirmations } = await wallet.getTransaction(index.toNumber() - 1);
      expect(executed).to.eq(false);
      expect(numConfirmations).to.eq(1);
    }

    {
      const confirm = await wallet.connect(addr1).confirmTransaction(index.toNumber() - 1);
      await confirm.wait();
      const { executed, numConfirmations } = await wallet.getTransaction(index.toNumber() - 1);
      expect(executed).to.eq(false);
      expect(numConfirmations).to.eq(2);
    }

    {
      const isConfirmed = await wallet.isConfirmed(index.toNumber() - 1, addr1.address);
      expect(isConfirmed).to.eq(true);
    }
  });

  it("event", async () => {
    const [owner, addr1] = await ethers.getSigners();
    const Wa = await ethers.getContractFactory("MultiSigWallet");
    const wa = await Wa.deploy([owner.address, addr1.address], 1);
    await wa.deployed();
    {
      const count = (await wa.getTransactionCount()).toNumber();
      for (let i = 0; i < count; i++) {
        // console.log(await wa.getTransaction(i));
      }
    }

    {
      const tx = await owner.sendTransaction({
        to: wa.address,
        value: ethers.utils.parseEther("0.5"),
      });
      await tx.wait();
    }

    // const eventFilter = wa.filters.Deposit();
    // const events = await wa.queryFilter(eventFilter);
  });
});

const contractBalance = async (p: any, address: string) => {
  return ethers.utils.formatEther(await p.getBalance(address));
};

const signerBalance = async (signer: any) => {
  return ethers.utils.formatEther(await signer.getBalance());
};

// 快速同意交易
const txConfirm = async (
  wallet: any,
  _to: string,
  _v: BigNumber | number,
  _data: BytesLike,
  index: number,
) => {
  const submit = await wallet.submitTransaction(_to, _v, _data);
  await submit.wait();

  const confirm = await wallet.confirmTransaction(index);
  await confirm.wait();

  const exec = await wallet.executeTransaction(index);
  await exec.wait();
};

// 製作新的多簽錢包
const multiSigWallet = async (_owner: string[], _confirm: number) => {
  const Wa = await ethers.getContractFactory("MultiSigWallet");
  const wa = await Wa.deploy(_owner, _confirm);
  await wa.deployed();
  return wa;
};
