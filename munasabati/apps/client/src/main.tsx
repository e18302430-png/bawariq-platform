import { createRoot } from "react-dom/client";
import "@munasabati/ui/tokens.css";
import "./client.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
