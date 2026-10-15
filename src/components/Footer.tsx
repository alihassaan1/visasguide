import { useSiteSettings } from "@/hooks/useSharedData";
import { Mail, Rss, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { CURRENT_YEAR } from "@/lib/constants";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";
import SeoLinksSection from "@/components/SeoLinksSection";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const footerLinks: any = settings?.footer_links || { popular_destinations: [], visa_types: [], resources: [] };
  const socialLinks: any = settings?.social_links || {};

  const withProtocol = (url?: string) => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
  };


  return (
    <>
      <SeoLinksSection />
      <footer className="bg-primary text-primary-foreground">
      {/* Horizontal Banner - site-wide */}
      <div className="container mx-auto px-4 pt-6">
        <AffiliateBannerContainer position="horizontal-banner" />
      </div>
      {/* Footer Banner */}
      <div className="container mx-auto px-4 pt-6">
        <AffiliateBannerContainer position="footer" />
      </div>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">V</span>
                </div>
                <h3 className="text-xl font-bold">Visas.Guide</h3>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Your trusted source for accurate visa information and travel documentation guidance for global travelers.
              </p>
              <div className="flex space-x-4">
                <a href="https://visas.guide/feed" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors" title="Subscribe to RSS Feed" aria-label="RSS Feed">
                  <Rss className="h-5 w-5" />
                </a>
                {socialLinks?.facebook && (
                  <a href={withProtocol(socialLinks.facebook)} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a href={withProtocol(socialLinks.twitter)} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a href={withProtocol(socialLinks.instagram)} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialLinks?.linkedin && (
                  <a href={withProtocol(socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks?.youtube && (
                  <a href={withProtocol(socialLinks.youtube)} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground/80 transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {!socialLinks?.facebook && !socialLinks?.twitter && !socialLinks?.instagram && (
                  <Mail className="h-5 w-5 text-primary-foreground/60" />
                )}
              </div>

            </div>

            {/* Popular Destinations */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-foreground">Popular Destinations</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks?.popular_destinations?.length > 0 ? (
                  footerLinks.popular_destinations.map((link: any, index: number) => (
                    <li key={index}>
                      <Link to={link.url} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link to="/countries/united-states" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">United States</Link></li>
                    <li><Link to="/countries/united-kingdom" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">United Kingdom</Link></li>
                    <li><Link to="/schengen-visa-guide" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Schengen Countries</Link></li>
                    <li><Link to="/countries/germany" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Germany</Link></li>
                    <li><Link to="/countries/united-arab-emirates" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">UAE</Link></li>
                    <li><Link to="/countries/canada" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Canada</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Visa Types */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-foreground">Visa Types</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks?.visa_types?.length > 0 ? (
                  footerLinks.visa_types.map((link: any, index: number) => (
                    <li key={index}>
                      <Link to={link.url} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link to="/visa-types/tourist" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Tourist Visa</Link></li>
                    <li><Link to="/visa-types/business" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Business Visa</Link></li>
                    <li><Link to="/visa-types/student" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Student Visa</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary-foreground">Resources</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks?.resources?.length > 0 ? (
                  footerLinks.resources.map((link: any, index: number) => (
                    <li key={index}>
                      <Link to={link.url} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link to="/requirements" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Visa Requirements</Link></li>
                    <li><Link to="/blog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Travel Blog</Link></li>
                    <li><Link to="/passport-index" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Passport Rankings</Link></li>
                    <li><a href="https://visas.guide/feed" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                      RSS Feed
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </a></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-primary-foreground/80">
              © {CURRENT_YEAR} Visas.Guide. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About Us</Link>
              <Link to="/editorial-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Editorial Policy</Link>
              <Link to="/affiliate-disclosure" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Affiliate Disclosure</Link>
              <Link to="/privacy-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</Link>
              <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;