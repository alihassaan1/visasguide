import { useEffect, type ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import StickyNewsletterCTA from "@/components/StickyNewsletterCTA";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";

const CONSENT_DEFAULTS = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var hasConsent = false;
try { hasConsent = localStorage.getItem('cookie_consent') === 'accepted'; } catch (e) {}
gtag('consent', 'default', {
  'ad_storage': hasConsent ? 'granted' : 'denied',
  'ad_user_data': hasConsent ? 'granted' : 'denied',
  'ad_personalization': hasConsent ? 'granted' : 'denied',
  'analytics_storage': 'granted',
  'wait_for_update': 500
});`;

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Visas.Guide",
  alternateName: "visas.guide",
  url: "https://visas.guide",
  logo: "https://visas.guide/favicon.png",
  sameAs: ["https://twitter.com/visasguide"],
  description:
    "Complete visa information and requirements for global travel - your trusted source for visa guides, requirements, and travel documentation.",
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Visas.Guide",
  url: "https://visas.guide",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://visas.guide/visa-search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Visas.Guide | Travel Visa Requirements & eVisa Info" },
      {
        name: "description",
        content:
          "Visa requirements, eVisa info, and processing times for 200+ countries. Trusted by travelers worldwide.",
      },
      { name: "author", content: "Visas Guide" },
      {
        name: "keywords",
        content:
          "visa guide, travel visa requirements, visa destinations, visa map, visa requirements by country, visa-free countries, evisa, global visa processing times, passport ranking, passport index, schengen visa, tourist visa, business visa, student visa",
      },
      { name: "google-adsense-account", content: "ca-pub-7190852118408617" },
      { name: "google-site-verification", content: "P6CgjHlfzm8TtyvyC-8rPjql3gm3YSKYKXazqAwT424" },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "googlebot",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "bingbot", content: "index, follow" },
      { property: "og:title", content: "Visas.Guide | Travel Visa Requirements" },
      {
        property: "og:description",
        content: "Visa requirements, eVisa info, and processing times for 200+ countries.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Visas.Guide" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@visasguide" },
      { name: "twitter:title", content: "Visas.Guide | Travel Visa Requirements" },
      {
        name: "twitter:description",
        content: "Visa requirements, eVisa info, and processing times for 200+ countries.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://www.googletagmanager.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://www.google-analytics.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap",
      },
      { rel: "preconnect", href: "https://images.unsplash.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://awiytryceqehqapytfgn.supabase.co" },
      { rel: "preconnect", href: "https://pagead2.googlesyndication.com", crossOrigin: "anonymous" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "alternate", type: "application/rss+xml", title: "Visas.Guide RSS Feed", href: "https://visas.guide/feed" },
      { rel: "alternate", type: "application/atom+xml", title: "Visas.Guide Atom Feed", href: "https://visas.guide/feed" },
    ],
    scripts: [
      { children: CONSENT_DEFAULTS },
      { type: "application/ld+json", children: JSON.stringify(ORGANIZATION_LD) },
      { type: "application/ld+json", children: JSON.stringify(WEBSITE_LD) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    // Auto ads may mutate the HTML before React hydrates, causing the entire
    // server-rendered page to be discarded. Keep AdSense enabled, but start it
    // after hydration; Google Analytics and consent configuration are unchanged.
    const src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7190852118408617";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollToTop />
        <GoogleAnalytics />
        <CookieConsentBanner />
        <StickyNewsletterCTA />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">This page didn't load</h1>
        <p className="text-muted-foreground mb-6">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <Link to="/" className="px-4 py-2 rounded-md border border-border text-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
