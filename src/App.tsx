import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StickyNewsletterCTA from "@/components/StickyNewsletterCTA";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RedirectVisaFree, RedirectCity } from "@/components/LegacyRedirects";

import Index from "./pages/Index";
import Countries from "./pages/Countries";
import VisaSearch from "./pages/VisaSearch";
import ProcessingTimes from "./pages/ProcessingTimes";
import Requirements from "./pages/Requirements";
import VisaGuides from "./pages/VisaGuides";
import CountryGuide from "./pages/CountryGuide";
import CityPage from "./pages/CityPage";
import GuidePage from "./pages/GuidePage";
import ThingsToDo from "./pages/ThingsToDo";
import ThingsToDoIndex from "./pages/ThingsToDoIndex";

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
import ManualContentEditor from "./pages/admin/ManualContentEditor";

import VisaRequirementsContentUpdater from "./pages/admin/VisaRequirementsContentUpdater";
import ContentValidator from "./pages/admin/ContentValidator";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FreelancerDashboard from "./pages/admin/FreelancerDashboard";
import MonetizationSettings from "./pages/admin/MonetizationSettings";
import UserManagement from "./pages/admin/UserManagement";
import APISettings from "./pages/admin/APISettings";
import ContentManager from "./pages/admin/ContentManager";
import NewsletterManager from "./pages/admin/NewsletterManager";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import SEODashboard from "./pages/admin/SEODashboard";
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
import RSSFeedsHealth from "./pages/admin/RSSFeedsHealth";
import AuthorManager from "./pages/admin/AuthorManager";
import AffiliateManager from "./pages/admin/AffiliateManager";
import BannerSlotDebugger from "./pages/admin/BannerSlotDebugger";
import ImageGenerator from "./pages/admin/ImageGenerator";
import QuickWinsDashboard from "./pages/admin/QuickWinsDashboard";
import AdPerformanceDashboard from "./pages/admin/AdPerformanceDashboard";
import AuditLog from "./pages/admin/AuditLog";

import ContentPage from "./pages/ContentPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Contact from "./pages/Contact";
import RSSFeed from "./pages/RSSFeed";
import Feed from "./pages/Feed";
import SchengenVisaGuide from "./pages/SchengenVisaGuide";
import SchengenCalculator from "./pages/SchengenCalculator";
import AuthorPage from "./pages/AuthorPage";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import About from "./pages/About";
import EditorialPolicy from "./pages/EditorialPolicy";
import AffiliateDisclosure from "./pages/AffiliateDisclosure";
import PolicyUpdates from "./pages/PolicyUpdates";
import PolicyTracker from "./pages/admin/PolicyTracker";
import EtiasHub from "./pages/etias/EtiasHub";
import EtiasSubPage from "./pages/etias/EtiasSubPage";
import EtiasCountryPage from "./pages/etias/EtiasCountryPage";
import EtiasTimelinePage from "./pages/etias/EtiasTimelinePage";
import EtiasNewsHub from "./pages/etias/EtiasNewsHub";
import EtiasGenerator from "./pages/admin/EtiasGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <GoogleAnalytics />
        <CookieConsentBanner />
        <StickyNewsletterCTA />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:countrySlug" element={<CountryGuide />} />
          {/* Legacy redirects — must come before the generic /:country/:city catch-all */}
          <Route path="/countries/:countrySlug/visa-free" element={<RedirectVisaFree />} />
          <Route path="/countries/:countrySlug/:citySlug" element={<RedirectCity />} />
          
          <Route path="/:countrySlug/:citySlug" element={<CityPage />} />


          
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
          <Route path="/about" element={<About />} />
          <Route path="/editorial-policy" element={<EditorialPolicy />} />
          <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
          <Route path="/policy-updates" element={<PolicyUpdates />} />
          <Route path="/schengen-visa-guide" element={<SchengenVisaGuide />} />
          <Route path="/schengen-calculator" element={<SchengenCalculator />} />
          <Route path="/things-to-do" element={<ThingsToDoIndex />} />
          <Route path="/things-to-do/:countrySlug" element={<ThingsToDo />} />

          {/* ETIAS hub */}
          <Route path="/etias" element={<EtiasHub />} />
          <Route path="/etias/news" element={<EtiasNewsHub />} />
          <Route path="/etias/timeline" element={<EtiasTimelinePage />} />
          <Route path="/etias/for/:countrySlug" element={<EtiasCountryPage />} />
          <Route path="/etias/:slug" element={<EtiasSubPage />} />

          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/rss" element={<RSSFeed />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/author/:slug" element={<AuthorPage />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          
          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="legacy" element={<Admin />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="data" element={<DataManager />} />
            <Route path="visa-requirements" element={<VisaRequirementsManager />} />
            <Route path="data-import" element={<DataImporter />} />
            <Route path="ai-content-studio" element={<AIContentStudio />} />
            <Route path="manual-editor" element={<ManualContentEditor />} />
            
            <Route path="visa-requirements-content-updater" element={<VisaRequirementsContentUpdater />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="seo" element={<SEODashboard />} />
            <Route path="freelancer" element={<FreelancerDashboard />} />
            <Route path="monetization" element={<MonetizationSettings />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="api-settings" element={<APISettings />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="newsletter" element={<NewsletterManager />} />
            <Route path="content-agent-logs" element={<ContentAgentLogs />} />
            <Route path="agent-dashboard" element={<AgentDashboard />} />
            <Route path="agent" element={<AgentDashboard />} />
            <Route path="api-logs" element={<APILogs />} />
            <Route path="developer-agent" element={<DeveloperAgent />} />
            <Route path="developer-settings" element={<DeveloperAPISettings />} />
            <Route path="marketing/social" element={<SocialMediaDashboard />} />
            <Route path="marketing/posts" element={<SocialPostsList />} />
            <Route path="marketing/platforms" element={<PlatformSettings />} />
            <Route path="rss-feeds" element={<RSSFeedManager />} />
            <Route path="rss-monitoring" element={<RSSMonitoringDashboard />} />
            <Route path="rss-health" element={<RSSFeedsHealth />} />
            <Route path="authors" element={<AuthorManager />} />
            <Route path="affiliate-manager" element={<AffiliateManager />} />
            <Route path="banner-debug" element={<BannerSlotDebugger />} />
            <Route path="image-generator" element={<ImageGenerator />} />
            <Route path="quick-wins" element={<QuickWinsDashboard />} />
            <Route path="ad-performance" element={<AdPerformanceDashboard />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="policy-tracker" element={<PolicyTracker />} />
            <Route path="etias-generator" element={<EtiasGenerator />} />
            <Route path="content-validator" element={<ContentValidator />} />
            
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