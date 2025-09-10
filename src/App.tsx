import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Requirements from "./pages/Requirements";
import VisaGuides from "./pages/VisaGuides";
import Countries from "./pages/Countries";
import ProcessingTimes from "./pages/ProcessingTimes";
import VisaFinder from "./pages/VisaFinder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/guides" element={<VisaGuides />} />
          <Route path="/guides/:slug" element={<VisaGuides />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:country" element={<Countries />} />
          <Route path="/processing-times" element={<ProcessingTimes />} />
          <Route path="/visa-finder" element={<VisaFinder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
