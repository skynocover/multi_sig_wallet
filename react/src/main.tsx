import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "./AppContext";

import { ChakraProvider } from "@chakra-ui/react";
import { MoralisProvider } from "react-moralis";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MoralisProvider
      appId={import.meta.env.VITE_APP_ID}
      serverUrl={import.meta.env.VITE_SERVER_URL}
    >
      <AppProvider>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </AppProvider>
    </MoralisProvider>
  </React.StrictMode>,
);
