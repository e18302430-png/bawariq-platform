import { createRoot } from "react-dom/client";

document.documentElement.setAttribute("dir", "rtl");
document.documentElement.setAttribute("lang", "ar");
import "@munasabati/ui/tokens.css";
import "./admin.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
