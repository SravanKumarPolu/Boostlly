import React from "react";
import ReactDOM from "react-dom/client";
import { UnifiedApp } from "@boostlly/features";
import "../styles.css";

function Options() {
  return <UnifiedApp variant="web" />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
);
