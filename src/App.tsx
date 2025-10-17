import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StickyNewsletterCTA from "@/components/StickyNewsletterCTA";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import StudentVisa from "./pages/visa-types/StudentVisa";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import DataManager from "./pages/admin/DataManager";
import AIContentStudio from "./pages/admin/AIContentStudio";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FreelancerDashboard from "./pages/admin/FreelancerDashboard";
import MonetizationSettings from "./pages/admin/MonetizationSettings";
import UserManagement from "./pages/admin/UserManagement";
import APISettings from "./pages/admin/APISettings";
import ContentManager from "./pages/admin/ContentManager";
import NewsletterManager from "./pages/admin/NewsletterManager";
import ContentPage from "./pages/ContentPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StickyNewsletterCTA />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:countrySlug" element={<CountryGuide />} />
          <Route path="/countries/:countrySlug/visa-free" element={<VisaFreeCountries />} />
          <Route path="/visa-search" element={<VisaSearch />} />
          <Route path="/processing-times" element={<ProcessingTimes />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/guides" element={<VisaGuides />} />
          <Route path="/guides/:slug" element={<CountryGuide />} />
          <Route path="/visa-types/tourist" element={<TouristVisa />} />
          <Route path="/visa-types/business" element={<BusinessVisa />} />
          <Route path="/visa-types/student" element={<StudentVisa />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/passport-rankings" element={<PassportRankings />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="data" element={<DataManager />} />
            <Route path="ai-studio" element={<AIContentStudio />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="freelancer" element={<FreelancerDashboard />} />
            <Route path="monetization" element={<MonetizationSettings />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="api-settings" element={<APISettings />} />
            <Route path="newsletter" element={<NewsletterManager />} />
          </Route>
          
          {/* Catch-all for content pages - must be last */}
          <Route path="/:slug" element={<ContentPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
