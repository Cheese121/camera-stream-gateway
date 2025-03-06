
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CameraProvider } from "@/context/CameraContext";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import CameraManager from "@/pages/CameraManager";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CameraProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cameras" element={<CameraManager />} />
              {/* Placeholder routes - these would be implemented in future versions */}
              <Route path="/analytics" element={<div className="p-6">Analytics Coming Soon</div>} />
              <Route path="/settings" element={<div className="p-6">Settings Coming Soon</div>} />
              <Route path="/integrations" element={<div className="p-6">Integrations Coming Soon</div>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CameraProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
