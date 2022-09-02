# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# EX

## network

```js
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: { // 設定新的network
      url: process.env.MUMBAI_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
      // 指定polygonScan的api key
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};
```

## script

```js
"compile": "npx hardhat compile" // 編譯合約
"test": "npx hardhat test" // 在記憶體內執行測試
"h-node": "npx hardhat node" //啟動hardhat的node
"local-test": "npx hardhat --network localhost test" // 在localhost執行測試,測試前需要啟動hardhat的node
"ganache-test": "npx hardhat --network ganache test" // 使用內建的ganache網路測試,不必啟動node
"deploy": "npx hardhat run scripts/deploy.js" // 使用 --network <network-name> 指定要部署的位置, 部署前要拿掉合約內的console
"dev-deploy": "npx hardhat run scripts/deploy.ts --network localhost", // 部署在本地的node上
"verify": "npx hardhat verify" //--network <network-name> 指定要部署的位置
```

## Env

- [AlchemyURL](https://www.alchemy.com/)
- [Etherscan API KEY](https://etherscan.io/myapikey)
- [Polygon API KEY](https://docs.polygonscan.com/getting-started/viewing-api-usage-statistics)
- [private key](https://www.cool3c.com/article/162754)