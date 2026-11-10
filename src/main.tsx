import React from "react";
import ReactDOM from "react-dom/client";
import { WispProvider } from "wispui";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WispProvider>
      <App />
    </WispProvider>
  </React.StrictMode>,
);
