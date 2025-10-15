import ReactDOM from "react-dom/client";
import { UnifiedApp } from "@boostlly/features";
import "../styles.css";

function Popup() {
  return <UnifiedApp variant="popup" />;
}

// Test modification - Extension build test
console.log("Extension popup loaded - Build test successful!");

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);
