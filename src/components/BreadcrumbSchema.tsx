import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  showVisual?: boolean;
}

const BreadcrumbSchema = ({ items, showVisual = true }: BreadcrumbSchemaProps) => {
  useEffect(() => {
    if (!items || items.length === 0) return;

    // Remove any existing breadcrumb schema
    const existingSchema = document.querySelector('script[data-schema="breadcrumb"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url.startsWith("http") ? item.url : `https://visas.guide${item.url}`
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'breadcrumb');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.querySelector('script[data-schema="breadcrumb"]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [items]);

  if (!showVisual || !items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
        <li className="flex items-center">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium truncate max-w-[200px]" title={item.name}>
                {item.name}
              </span>
            ) : (
              <Link 
                to={item.url} 
                className="hover:text-primary transition-colors truncate max-w-[150px]"
                title={item.name}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbSchema;
