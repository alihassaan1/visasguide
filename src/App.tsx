import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import VisaFinder from "./pages/VisaFinder";
import ProcessingTimes from "./pages/ProcessingTimes";
import Requirements from "./pages/Requirements";
import VisaGuides from "./pages/VisaGuides";
import CountryGuide from "./pages/CountryGuide";
import NewsPage from "./pages/NewsPage";
import NewsArticle from "./pages/NewsArticle";
import PassportRankings from "./pages/PassportRankings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:countryCode" element={<CountryGuide />} />
          <Route path="/visa-finder" element={<VisaFinder />} />
          <Route path="/processing-times" element={<ProcessingTimes />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/guides" element={<VisaGuides />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/passport-rankings" element={<PassportRankings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
