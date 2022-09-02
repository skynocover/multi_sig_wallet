import "./App.css";
import React from "react";
import { AppContext } from "./AppContext";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Button, ButtonGroup } from "@chakra-ui/react";
import { useMoralis, useWeb3Contract } from "react-moralis";

import Func from "./components/Func";

function App() {
  const appCtx = React.useContext(AppContext);
  const {
    authenticate,
    isAuthenticated,
    user,
    enableWeb3,
    logout,
    authError,
    userError,
    Moralis,
    web3,
  } = useMoralis();

  const [inputFuncs, setInputFuncs] = React.useState<any[]>([]);
  const [outputFuncs, setOutputFuncs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (appCtx.contractABI.length > 0) {
      enableWeb3();

      const input = appCtx.contractABI.filter(
        (item: any) => item.stateMutability === "view" && item.type === "function",
      );
      setInputFuncs(input);

      const output = appCtx.contractABI.filter(
        (item: any) => item.stateMutability !== "view" && item.type === "function",
      );
      setOutputFuncs(output);
    }
  }, [appCtx.contractABI]);

  return (
    <div className="App">
      <header className="App-header">
        {isAuthenticated ? (
          <>
            <h1>Welcome {user?.get("username")}</h1>
            <h3>Address: {user?.get("ethAddress")}</h3>
            <button onClick={() => logout()}>Logout</button>
          </>
        ) : (
          <Button onClick={() => authenticate()} colorScheme="blue">
            Connect
          </Button>
        )}

        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>Read</Tab>
            <Tab>Write</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {inputFuncs.map((item, index) => (
                <Func abi={item} key={index}></Func>
              ))}
            </TabPanel>
            <TabPanel>
              {outputFuncs.map((item, index) => (
                <Func abi={item} key={index}></Func>
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </header>
    </div>
  );
}

export default App;
