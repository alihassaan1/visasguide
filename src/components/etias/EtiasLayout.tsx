import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EtiasNav from "./EtiasNav";
import EtiasScamWarning from "./EtiasScamWarning";
import NewsletterSignup from "@/components/NewsletterSignup";
import GetYourGuideWidget from "@/components/GetYourGuideWidget";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

interface EtiasLayoutProps {
  children: ReactNode;
  breadcrumbs?: { name: string; url: string }[];
}

const EtiasLayout = ({ children, breadcrumbs }: EtiasLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {breadcrumbs && <BreadcrumbSchema items={breadcrumbs} />}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <EtiasNav />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <article className="min-w-0 space-y-8">
            <EtiasScamWarning />
            {children}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-lg border bg-card p-5">
              <h3 className="font-semibold mb-2">Get ETIAS launch alerts</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We'll email you the moment ETIAS goes live and whenever rules change.
              </p>
              <NewsletterSignup variant="sidebar" />
            </div>
            <AffiliateBannerContainer position="sidebar" />
            <GetYourGuideWidget position="sidebar" />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EtiasLayout;
