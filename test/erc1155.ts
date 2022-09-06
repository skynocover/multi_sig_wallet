import { ethers } from "hardhat";

export const Erc1155 = [
  "function setApprovalForAll(address operator, bool approved)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)",
  "function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) ",
];

export const Erc1155Interface = new ethers.utils.Interface(Erc1155);

export const erc1155EncodeTransfer = (
  from: string,
  to: string,
  id: number,
  amount: number,
  data: any,
): string => {
  return Erc1155Interface.encodeFunctionData("safeTransferFrom", [from, to, id, amount, data]);
};

export const erc1155EncodeBatchTransfer = (
  from: string,
  to: string,
  ids: number[],
  amounts: number[],
  data: any,
) => {
  return Erc1155Interface.encodeFunctionData("safeBatchTransferFrom", [
    from,
    to,
    ids,
    amounts,
    data,
  ]);
};

export const erc1155EncodeApproval = (operator: string, approved: boolean): string => {
  return Erc1155Interface.encodeFunctionData("setApprovalForAll", [operator, approved]);
};
