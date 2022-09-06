import { ethers } from "hardhat";

export const Erc20 = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from,address to,uint256 amount) external returns (bool)",
];

export const Erc20Interface = new ethers.utils.Interface(Erc20);

export const erc20EncodeTransfer = (to: string, amount: number): string => {
  return Erc20Interface.encodeFunctionData("transfer", [to, amount]);
};

export const erc20EncodeTransferFrom = (from: string, to: string, amount: number): string => {
  return Erc20Interface.encodeFunctionData("transferFrom", [from, to, amount]);
};

export const erc20EncodeApprove = (spender: string, amount: number): string => {
  return Erc20Interface.encodeFunctionData("approve", [spender, amount]);
};
