import { useEffect } from 'react';

interface TouristAttractionSchemaProps {
  name: string;
  description: string;
  image?: string;
  address?: {
    city: string;
    country: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  url?: string;
  attractions?: string[];
}

const TouristAttractionSchema = ({
  name,
  description,
  image,
  address,
  geo,
  url,
  attractions = []
}: TouristAttractionSchemaProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'tourist-attraction-schema';

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name,
      description,
      url: url || window.location.href,
    };

    if (image) {
      schema.image = image;
    }

    if (address) {
      schema.address = {
        '@type': 'PostalAddress',
        addressLocality: address.city,
        addressCountry: address.country,
      };
    }

    if (geo) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      };
    }

    if (attractions.length > 0) {
      schema.touristAttraction = attractions.map((attraction) => ({
        '@type': 'TouristAttraction',
        name: attraction,
      }));
    }

    script.textContent = JSON.stringify(schema);

    // Remove existing schema if present
    const existingScript = document.getElementById('tourist-attraction-schema');
    if (existingScript) {
      existingScript.remove();
    }

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('tourist-attraction-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [name, description, image, address, geo, url, attractions]);

  return null;
};

export default TouristAttractionSchema;
