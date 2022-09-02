//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Greeter {
  string private greeting;

  event TestEvent(address from, string str);

  constructor(string memory _greeting) {
    console.log("Deploying a Greeter with greeting:", _greeting);
    greeting = _greeting;
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public returns (string memory) {
    console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
    emit TestEvent(msg.sender, _greeting);
    greeting = _greeting;
    return greeting;
  }
}
