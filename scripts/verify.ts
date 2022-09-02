// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";
import inquirer from "inquirer";

async function main() {
  const { address, argus } = await inquirer.prompt([
    {
      type: "input",
      name: "address",
      message: "Please Input Contract Address",
    },
    {
      type: "input",
      name: "argus",
      message: "Please Input Contract Deployed Argument",
    },
  ]);

  const constructorArguments = argus.split('"').filter((item: any) => !!item.trim());
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  console.table(constructorArguments);

  await hre.run("verify:verify", { address, constructorArguments });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
