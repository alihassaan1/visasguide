import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import VisaSearch from "./pages/VisaSearch";
import ProcessingTimes from "./pages/ProcessingTimes";
import Requirements from "./pages/Requirements";
import VisaGuides from "./pages/VisaGuides";
import CountryGuide from "./pages/CountryGuide";
import VisaFreeCountries from "./pages/VisaFreeCountries";
import NewsPage from "./pages/NewsPage";
import NewsArticle from "./pages/NewsArticle";
import PassportRankings from "./pages/PassportRankings";
import TouristVisa from "./pages/visa-types/TouristVisa";
import BusinessVisa from "./pages/visa-types/BusinessVisa";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import ContentPage from "./pages/ContentPage";
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
          <Route path="/countries/:countryCode/visa-free" element={<VisaFreeCountries />} />
          <Route path="/visa-search" element={<VisaSearch />} />
          <Route path="/processing-times" element={<ProcessingTimes />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/guides" element={<VisaGuides />} />
          <Route path="/guides/:slug" element={<CountryGuide />} />
          <Route path="/visa-types/tourist-visa" element={<TouristVisa />} />
          <Route path="/visa-types/business-visa" element={<BusinessVisa />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/passport-rankings" element={<PassportRankings />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Evergreen Content Pages */}
          <Route path="/schengen-visa-guide" element={<ContentPage />} />
          <Route path="/us-visit-visa-guide" element={<ContentPage />} />
          <Route path="/dubai-visit-visa-guide" element={<ContentPage />} />
          <Route path="/uk-visit-visa-guide" element={<ContentPage />} />
          <Route path="/canada-visit-visa-guide" element={<ContentPage />} />
          <Route path="/:slug" element={<ContentPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
