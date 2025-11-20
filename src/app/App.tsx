import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ROUTES } from "@/shared/config/routes";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ThemeProvider } from "@/shared/lib/theme";

// Lazy load all pages for better performance on low-end devices
const HomePage = lazy(() => import("@/pages/home/ui/HomePage").then(m => ({ default: m.HomePage })));
const TrainingPage = lazy(() => import("@/pages/training/ui/TrainingPage").then(m => ({ default: m.TrainingPage })));
const PracticePage = lazy(() => import("@/pages/practice/ui/PracticePage").then(m => ({ default: m.PracticePage })));
const AdminLoginPage = lazy(() => import("@/pages/admin/ui/AdminLoginPage").then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("@/pages/admin/ui/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

// Simple loading fallback for better UX
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

const App = () => {
  useEffect(() => {
    // Apply Apple HIG minimal design to the entire app
    document.documentElement.classList.add('hig-design');

    // Clean up on unmount
    return () => {
      document.documentElement.classList.remove('hig-design');
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.TRAINING} element={<TrainingPage />} />
                <Route path={ROUTES.PRACTICE} element={<PracticePage />} />
                <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
                <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
