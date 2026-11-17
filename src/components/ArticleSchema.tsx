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
  imageUrl = "https://cdn.visas.guide/site/og-image.jpg",
  datePublished,
  dateModified,
  authorName,
  keywords = [],
  wordCount,
}: ArticleSchemaProps) => {
  useEffect(() => {
    if (document.querySelector('meta[name="visas:route-head"]')) return;
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
      ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
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
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
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
