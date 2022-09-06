import { ethers } from "hardhat";

export const Erc721 = [
  "function transferFrom(address from,address to,uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool _approved) ",
];

export const Erc721Interface = new ethers.utils.Interface(Erc721);

export const erc721EncodeTransfer = (from: string, to: string, tokenId: string): string => {
  return Erc721Interface.encodeFunctionData("transferFrom", [from, to, tokenId]);
};
