import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-cosmic stars-bg px-4">
      <div className="text-center glass-card rounded-2xl md:rounded-3xl p-6 md:p-12 max-w-md border-2 border-error/30">
        <h1 className="mb-3 md:mb-4 text-5xl md:text-7xl font-bold text-glow-pink font-display">404</h1>
        <p className="mb-4 md:mb-6 text-base md:text-xl text-muted-foreground">Oops! Page not found</p>
        <a
          href="/"
          className="inline-block px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all text-white font-medium"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
