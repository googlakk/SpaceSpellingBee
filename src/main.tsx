import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";
import { registerServiceWorker } from "./registerSW";
import { applyPerformanceClass, applyConnectionOptimizations } from "./shared/lib/performance";

// Apply performance optimizations based on device
applyPerformanceClass();

// Apply connection-aware optimizations
applyConnectionOptimizations();

// Register Service Worker for PWA
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
