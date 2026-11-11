import React from "react";
import ReactDOM from "react-dom/client";
import { WispProvider } from "wispui";
import App from "./App";
import { DayProvider } from "./day";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WispProvider>
      <DayProvider>
        <App />
      </DayProvider>
    </WispProvider>
  </React.StrictMode>,
);
