import { useEffect } from "react";

interface NavigationItem {
  name: string;
  url: string;
}

interface SiteNavigationSchemaProps {
  items?: NavigationItem[];
  siteName?: string;
  siteUrl?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  { name: "Home", url: "https://visas.guide/" },
  { name: "Visa Finder", url: "https://visas.guide/visa-finder" },
  { name: "Countries", url: "https://visas.guide/countries" },
  { name: "Visa Search", url: "https://visas.guide/visa-search" },
  { name: "Visa Guides", url: "https://visas.guide/visa-guides" },
  { name: "News", url: "https://visas.guide/news" },
  { name: "Passport Rankings", url: "https://visas.guide/passport-rankings" },
  { name: "Schengen Visa Guide", url: "https://visas.guide/schengen-visa-guide" },
  { name: "Tourist Visa", url: "https://visas.guide/tourist-visa" },
  { name: "Business Visa", url: "https://visas.guide/business-visa" },
  { name: "Student Visa", url: "https://visas.guide/student-visa" },
  { name: "About Us", url: "https://visas.guide/about" },
  { name: "Contact", url: "https://visas.guide/contact" }
];

const SiteNavigationSchema = ({
  items = defaultNavigationItems,
  siteName = "Visas Guide",
  siteUrl = "https://visas.guide"
}: SiteNavigationSchemaProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "site-navigation-schema";
    
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      "name": siteName,
      "url": siteUrl,
      "potentialAction": items.map(item => ({
        "@type": "ViewAction",
        "name": item.name,
        "target": item.url
      }))
    };
    
    script.innerHTML = JSON.stringify(schemaData);
    
    // Remove any existing navigation schema
    const existingScript = document.getElementById("site-navigation-schema");
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.getElementById("site-navigation-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items, siteName, siteUrl]);

  // Also add ItemList schema for better sitelinks
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "item-list-schema";
    
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${siteName} Navigation`,
      "itemListElement": items.map((item, index) => ({
        "@type": "SiteNavigationElement",
        "position": index + 1,
        "name": item.name,
        "url": item.url
      }))
    };
    
    script.innerHTML = JSON.stringify(schemaData);
    
    const existingScript = document.getElementById("item-list-schema");
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.getElementById("item-list-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items, siteName]);

  return null;
};

export default SiteNavigationSchema;
