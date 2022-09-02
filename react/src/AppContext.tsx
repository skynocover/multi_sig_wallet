import React from "react";

// import contractData from "./artifacts/contracts/SimpleStorage.sol/SimpleStorage.json";

// for biconomy relay setting (Option)
// @ts-ignore
import { Biconomy } from "@biconomy/mexa";
import Web3 from "web3";
const apiKey = import.meta.env.VITE_BICONOMY_API_KEY;
// for biconomy relay setting (Option)

export interface AppContextProps {
  // contractData: any;
  contractABI: any[];
  biconomyContract: any;
}

const AppContext = React.createContext<AppContextProps>(undefined!);

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  /// //////////////////////////////////////////////////

  const [contractABI, setContractABI] = React.useState<any[]>([]);
  const [biconomyContract, setBiconomyContract] = React.useState<any>(undefined);

  const init = async () => {
    const contractName = import.meta.env.VITE_CONTRACT_NAME;
    const url = new URL(
      `./artifacts/contracts/${contractName}.sol/${contractName}.json`,
      import.meta.url,
    ).href;

    const res = await fetch(url);
    const data = JSON.parse(await res.text());
    setContractABI(data.abi);

    if (apiKey) {
      // @ts-ignore
      const biconomy = new Biconomy(window.ethereum, {
        apiKey: import.meta.env.VITE_BICONOMY_API_KEY,
      });

      biconomy
        .onEvent(biconomy.READY, async () => {
          const web3 = new Web3(biconomy);

          const contract = new web3.eth.Contract(data.abi, import.meta.env.VITE_CONTRACT_ADDRESS);

          setBiconomyContract(contract);

          console.log("initialized");
        })
        .onEvent(biconomy.ERROR, () => {
          // Handle error while initializing mexa
          console.error({
            message: "Biconomy Initialization Fail",
            description: "Biconomy has failed to initialized. Please try again later.",
          });
        });
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        contractABI,
        biconomyContract,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
