import { createRoot } from "react-dom/client";

// الاتجاه من اليمين لليسار دائماً، حتى لو فُتحت الصفحة داخل إطار لا يحمل dir
document.documentElement.setAttribute("dir", "rtl");
document.documentElement.setAttribute("lang", "ar");
import "@munasabati/ui/tokens.css";
import "./web.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
