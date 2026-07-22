import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./app/App.jsx";
import { hydrateAppData } from "./api/index.js";

/* Hydrate data stores from the API (when VITE_API_BASE is set) before first
   render; with no backend configured this resolves instantly on demo data. */
hydrateAppData().finally(() => {
  createRoot(document.getElementById("root")).render(<App/>);
});
