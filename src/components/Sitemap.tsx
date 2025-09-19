import { useEffect } from "react";

const Sitemap = () => {
  useEffect(() => {
    // Generate sitemap XML content
    const sitemapUrls = [
      // Main pages
      { url: "https://visas.guide/", priority: "1.0", changefreq: "daily" },
      { url: "https://visas.guide/countries", priority: "0.9", changefreq: "daily" },
      { url: "https://visas.guide/visa-search", priority: "0.9", changefreq: "daily" },
      { url: "https://visas.guide/guides", priority: "0.8", changefreq: "daily" },
      { url: "https://visas.guide/news", priority: "0.7", changefreq: "hourly" },
      { url: "https://visas.guide/passport-rankings", priority: "0.7", changefreq: "weekly" },
      { url: "https://visas.guide/processing-times", priority: "0.6", changefreq: "weekly" },
      { url: "https://visas.guide/requirements", priority: "0.6", changefreq: "weekly" },
      
      // Visa type pages
      { url: "https://visas.guide/visa-types/tourist-visa", priority: "0.8", changefreq: "weekly" },
      { url: "https://visas.guide/visa-types/business-visa", priority: "0.8", changefreq: "weekly" },
      { url: "https://visas.guide/visa-types/student-visa", priority: "0.7", changefreq: "weekly" },
      { url: "https://visas.guide/visa-types/work-visa", priority: "0.7", changefreq: "weekly" },
      { url: "https://visas.guide/visa-types/transit-visa", priority: "0.6", changefreq: "weekly" },
      
      // Popular countries  
      { url: "https://visas.guide/countries/united-states", priority: "0.9", changefreq: "daily" },
      { url: "https://visas.guide/countries/united-kingdom", priority: "0.8", changefreq: "daily" },
      { url: "https://visas.guide/countries/germany", priority: "0.8", changefreq: "daily" },
      { url: "https://visas.guide/countries/france", priority: "0.7", changefreq: "daily" },
      { url: "https://visas.guide/countries/canada", priority: "0.7", changefreq: "daily" },
      { url: "https://visas.guide/countries/australia", priority: "0.7", changefreq: "daily" },
      { url: "https://visas.guide/countries/japan", priority: "0.6", changefreq: "daily" },
      { url: "https://visas.guide/countries/singapore", priority: "0.6", changefreq: "daily" },
      
      // Guide pages
      { url: "https://visas.guide/guides/us-esta-application-guide", priority: "0.8", changefreq: "monthly" },
      { url: "https://visas.guide/guides/schengen-visa-requirements", priority: "0.8", changefreq: "monthly" },
      { url: "https://visas.guide/guides/uk-visitor-visa-guide", priority: "0.7", changefreq: "monthly" },
      { url: "https://visas.guide/guides/canada-eta-vs-visitor-visa", priority: "0.6", changefreq: "monthly" },
      { url: "https://visas.guide/guides/australia-eta-application", priority: "0.6", changefreq: "monthly" },
      { url: "https://visas.guide/guides/japan-tourist-visa-guide", priority: "0.6", changefreq: "monthly" },
      { url: "https://visas.guide/guides/visa-rejection-reasons", priority: "0.5", changefreq: "monthly" },
      { url: "https://visas.guide/guides/travel-insurance-requirements", priority: "0.5", changefreq: "monthly" },
    ];

    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Create and download sitemap
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Sitemap generated successfully');
  }, []);

  return null;
};

export default Sitemap;