import { useEffect } from "react";
import { cleanMetaText } from "@/lib/public-seo";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  keywords?: string[];
  author?: string;
  noIndex?: boolean;
  seoIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = "https://cdn.visas.guide/site/og-image.jpg",
  ogType = "website",
  articlePublishedTime,
  articleModifiedTime,
  author = "Visas.Guide Editorial Team",
  seoIndex = true,
  noIndex = false
}: SEOHeadProps) => {
  // Titles use pipes as separators, never long dashes
  const cleanTitle = cleanMetaText(title || "Visa Requirements and Travel Guides | visas.guide");
  const cleanDescription = cleanMetaText(description);
  useEffect(() => {
    // Public leaf routes own metadata in SSR and on navigation. Never overwrite
    // their tags with a late effect (or with a generic default share image).
    if (document.querySelector('meta[name="visas:route-head"]')) return;
    // Update document title
    document.title = cleanTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', cleanDescription);
    document.querySelectorAll('meta[name="keywords"]').forEach(tag => tag.remove());
    
    // Author meta tag (E-E-A-T signal)
    updateMetaTag('author', author);
    
    // Robots meta tag
    if (noIndex || !seoIndex) {
      updateMetaTag('robots', 'noindex, follow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph tags
    updateMetaTag('og:title', cleanTitle, true);
    updateMetaTag('og:description', cleanDescription, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', ogImage, true);
    
    if (canonical) {
      updateMetaTag('og:url', canonical, true);
    }

    if (ogType === 'article') {
      if (articlePublishedTime) {
        updateMetaTag('article:published_time', articlePublishedTime, true);
      }
      if (articleModifiedTime) {
        updateMetaTag('article:modified_time', articleModifiedTime, true);
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', cleanTitle);
    updateMetaTag('twitter:description', cleanDescription);
    updateMetaTag('twitter:image', ogImage);

    // Canonical link - always set to prevent duplicate content issues
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', canonical);
    } else if (canonicalTag) {
      // Remove stale canonical from previous page
      canonicalTag.remove();
    }

    // Cleanup: remove stale meta tags when component unmounts
    return () => {
      // Reset title to default when navigating away
      // (Next page's SEOHead will set its own)
    };
  }, [title, description, canonical, ogImage, ogType, articlePublishedTime, articleModifiedTime, author, noIndex, seoIndex]);

  return null;
};

export default SEOHead;
