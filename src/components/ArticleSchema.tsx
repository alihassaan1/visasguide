import { useEffect } from "react";

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  keywords?: string[];
  wordCount?: number;
}

const ArticleSchema = ({
  title,
  description,
  url,
  imageUrl = "https://visas.guide/hero-travel.jpg",
  datePublished,
  dateModified,
  authorName = "Visas.Guide Editorial Team",
  keywords = [],
  wordCount,
}: ArticleSchemaProps) => {
  useEffect(() => {
    // Remove any existing article schema
    const existingSchema = document.querySelector('script[data-schema="article"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title.substring(0, 110), // Google recommends max 110 chars
      "description": description.substring(0, 160),
      "image": imageUrl,
      "url": url,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "author": {
        "@type": "Organization",
        "name": authorName,
        "url": "https://visas.guide",
        "logo": {
          "@type": "ImageObject",
          "url": "https://visas.guide/favicon.png"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "Visas.Guide",
        "url": "https://visas.guide",
        "logo": {
          "@type": "ImageObject",
          "url": "https://visas.guide/favicon.png",
          "width": 512,
          "height": 512
        }
      },
      "datePublished": datePublished || new Date().toISOString(),
      "dateModified": dateModified || new Date().toISOString(),
      ...(keywords.length > 0 && { "keywords": keywords.join(", ") }),
      ...(wordCount && { "wordCount": wordCount }),
      "inLanguage": "en-US",
      "isAccessibleForFree": true
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'article');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.querySelector('script[data-schema="article"]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [title, description, url, imageUrl, datePublished, dateModified, authorName, keywords, wordCount]);

  return null;
};

export default ArticleSchema;
