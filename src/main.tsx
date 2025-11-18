import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerSW";
import { applyPerformanceClass } from "./shared/lib/performance";

// Apply performance optimizations based on device
applyPerformanceClass();

// Register Service Worker for PWA
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
