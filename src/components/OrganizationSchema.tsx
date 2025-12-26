import { useEffect } from "react";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  foundingDate?: string;
  sameAs?: string[];
  contactPoint?: {
    type: string;
    telephone?: string;
    email?: string;
    contactType: string;
    areaServed?: string;
    availableLanguage?: string[];
  };
}

const OrganizationSchema = ({
  name = "Visas Guide",
  url = "https://visas.guide",
  logo = "https://visas.guide/favicon.png",
  description = "The world's leading visa information platform providing up-to-date visa requirements, eVisa details, and travel documentation guides for 200+ countries.",
  foundingDate = "2024",
  sameAs = [
    "https://twitter.com/visasguide",
    "https://facebook.com/visasguide",
    "https://linkedin.com/company/visasguide"
  ],
  contactPoint = {
    type: "ContactPoint",
    email: "contact@visas.guide",
    contactType: "customer service",
    areaServed: "Worldwide",
    availableLanguage: ["English"]
  }
}: OrganizationSchemaProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "organization-schema";
    
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": name,
      "url": url,
      "logo": {
        "@type": "ImageObject",
        "url": logo
      },
      "description": description,
      "foundingDate": foundingDate,
      "sameAs": sameAs,
      "contactPoint": {
        "@type": contactPoint.type,
        ...(contactPoint.telephone && { "telephone": contactPoint.telephone }),
        ...(contactPoint.email && { "email": contactPoint.email }),
        "contactType": contactPoint.contactType,
        ...(contactPoint.areaServed && { "areaServed": contactPoint.areaServed }),
        ...(contactPoint.availableLanguage && { "availableLanguage": contactPoint.availableLanguage })
      },
      "knowsAbout": [
        "Visa Requirements",
        "eVisa Applications",
        "Travel Documentation",
        "Passport Information",
        "Immigration Policies",
        "Visa-free Travel"
      ],
      "slogan": "Your Trusted Source for Global Visa Information"
    };
    
    script.innerHTML = JSON.stringify(schemaData);
    
    // Remove any existing organization schema
    const existingScript = document.getElementById("organization-schema");
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.getElementById("organization-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [name, url, logo, description, foundingDate, sameAs, contactPoint]);

  return null;
};

export default OrganizationSchema;
