import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HomePage } from "@/pages/home/ui/HomePage";
import { TrainingPage } from "@/pages/training/ui/TrainingPage";
import { PracticePage } from "@/pages/practice/ui/PracticePage";
import NotFound from "@/pages/NotFound";
import { ROUTES } from "@/shared/config/routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.TRAINING} element={<TrainingPage />} />
          <Route path={ROUTES.PRACTICE} element={<PracticePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
