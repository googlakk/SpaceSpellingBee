import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerSW";

// Register Service Worker for PWA
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
