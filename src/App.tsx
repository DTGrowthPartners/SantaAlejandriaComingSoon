import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./i18n/LanguageContext";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./pages/Index";
import Cartagena from "./pages/Cartagena";
import Medellin from "./pages/Medellin";
import Reglamento from "./pages/Reglamento";
import PoliticaDatos from "./pages/PoliticaDatos";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticaCookies from "./pages/PoliticaCookies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SESSION_KEY = "sa_loader_seen";

const App = () => {
  // Show loader only on first load per browser session
  const [showLoader, setShowLoader] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const handleLoaderFinish = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowLoader(false);
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            {showLoader && <LoadingScreen onFinish={handleLoaderFinish} />}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/cartagena" element={<Cartagena />} />
                <Route path="/medellin" element={<Medellin />} />
                <Route path="/reglamento" element={<Reglamento />} />
                <Route path="/politica-datos" element={<PoliticaDatos />} />
                <Route path="/terminos" element={<TerminosCondiciones />} />
                <Route path="/cookies" element={<PoliticaCookies />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
