import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StickyNewsletterCTA from "@/components/StickyNewsletterCTA";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import VisaSearch from "./pages/VisaSearch";
import ProcessingTimes from "./pages/ProcessingTimes";
import Requirements from "./pages/Requirements";
import VisaGuides from "./pages/VisaGuides";
import CountryGuide from "./pages/CountryGuide";
import GuidePage from "./pages/GuidePage";

import NewsPage from "./pages/NewsPage";
import NewsArticle from "./pages/NewsArticle";
import VisaRequirements from "./pages/VisaRequirements";
import PassportRankings from "./pages/PassportRankings";
import TouristVisa from "./pages/visa-types/TouristVisa";
import BusinessVisa from "./pages/visa-types/BusinessVisa";
import StudentVisa from "./pages/visa-types/StudentVisa";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import DataManager from "./pages/admin/DataManager";
import AIContentStudio from "./pages/admin/AIContentStudio";

import VisaRequirementsContentUpdater from "./pages/admin/VisaRequirementsContentUpdater";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FreelancerDashboard from "./pages/admin/FreelancerDashboard";
import MonetizationSettings from "./pages/admin/MonetizationSettings";
import UserManagement from "./pages/admin/UserManagement";
import APISettings from "./pages/admin/APISettings";
import ContentManager from "./pages/admin/ContentManager";
import NewsletterManager from "./pages/admin/NewsletterManager";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import VisaRequirementsManager from "./pages/admin/VisaRequirementsManager";
import DataImporter from "./pages/admin/DataImporter";
import SiteSettings from "./pages/admin/SiteSettings";
import MenuManager from "./pages/admin/MenuManager";
import ContentAgentLogs from "./pages/admin/ContentAgentLogs";
import AgentDashboard from "./pages/admin/AgentDashboard";
import APILogs from "./pages/admin/APILogs";
import DeveloperAgent from "./pages/admin/DeveloperAgent";
import DeveloperAPISettings from "./pages/admin/DeveloperAPISettings";
import SocialMediaDashboard from "./pages/admin/SocialMediaDashboard";
import SocialPostsList from "./pages/admin/SocialPostsList";
import PlatformSettings from "./pages/admin/PlatformSettings";
import RSSFeedManager from "./pages/admin/RSSFeedManager";
import RSSMonitoringDashboard from "./pages/admin/RSSMonitoringDashboard";
import AuthorManager from "./pages/admin/AuthorManager";
import ContentPage from "./pages/ContentPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Contact from "./pages/Contact";
import RSSFeed from "./pages/RSSFeed";
import Feed from "./pages/Feed";
import SchengenVisaGuide from "./pages/SchengenVisaGuide";
import AuthorPage from "./pages/AuthorPage";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <GoogleAnalytics />
        <StickyNewsletterCTA />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:countrySlug" element={<CountryGuide />} />
          
          <Route path="/visa-search" element={<VisaSearch />} />
          <Route path="/visa-requirements/:slug" element={<VisaRequirements />} />
          <Route path="/processing-times" element={<ProcessingTimes />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/guides" element={<VisaGuides />} />
          <Route path="/guides/:slug" element={<GuidePage />} />
          <Route path="/visa-types/tourist" element={<TouristVisa />} />
          <Route path="/visa-types/business" element={<BusinessVisa />} />
          <Route path="/visa-types/student" element={<StudentVisa />} />
          <Route path="/blog" element={<NewsPage />} />
          <Route path="/blog/:slug" element={<NewsArticle />} />
          <Route path="/passport-index" element={<PassportRankings />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/schengen-visa-guide" element={<SchengenVisaGuide />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/rss" element={<RSSFeed />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/author/:slug" element={<AuthorPage />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="data" element={<DataManager />} />
            <Route path="visa-requirements" element={<VisaRequirementsManager />} />
            <Route path="data-import" element={<DataImporter />} />
            <Route path="ai-content-studio" element={<AIContentStudio />} />
            
            <Route path="visa-requirements-content-updater" element={<VisaRequirementsContentUpdater />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="freelancer" element={<FreelancerDashboard />} />
            <Route path="monetization" element={<MonetizationSettings />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="api-settings" element={<APISettings />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="newsletter" element={<NewsletterManager />} />
            <Route path="content-agent-logs" element={<ContentAgentLogs />} />
            <Route path="agent-dashboard" element={<AgentDashboard />} />
            <Route path="api-logs" element={<APILogs />} />
            <Route path="developer-agent" element={<DeveloperAgent />} />
            <Route path="developer-settings" element={<DeveloperAPISettings />} />
            <Route path="marketing/social" element={<SocialMediaDashboard />} />
            <Route path="marketing/posts" element={<SocialPostsList />} />
            <Route path="marketing/platforms" element={<PlatformSettings />} />
            <Route path="rss-feeds" element={<RSSFeedManager />} />
            <Route path="rss-monitoring" element={<RSSMonitoringDashboard />} />
            <Route path="authors" element={<AuthorManager />} />
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