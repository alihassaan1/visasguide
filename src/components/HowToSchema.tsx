import { useEffect } from "react";

interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration format, e.g., "P30D" for 30 days
  estimatedCost?: {
    currency: string;
    value: string;
  };
  supply?: string[];
  tool?: string[];
  steps: HowToStep[];
  image?: string;
}

const HowToSchema = ({
  name,
  description,
  totalTime,
  estimatedCost,
  supply = [],
  tool = [],
  steps,
  image,
}: HowToSchemaProps) => {
  useEffect(() => {
    const schemaId = "howto-schema";
    
    // Remove existing schema if present
    const existingSchema = document.getElementById(schemaId);
    if (existingSchema) {
      existingSchema.remove();
    }

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name,
      description,
      step: steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
        ...(step.url && { url: step.url }),
        ...(step.image && { image: step.image }),
      })),
    };

    if (totalTime) {
      schema.totalTime = totalTime;
    }

    if (estimatedCost) {
      schema.estimatedCost = {
        "@type": "MonetaryAmount",
        currency: estimatedCost.currency,
        value: estimatedCost.value,
      };
    }

    if (supply.length > 0) {
      schema.supply = supply.map((item) => ({
        "@type": "HowToSupply",
        name: item,
      }));
    }

    if (tool.length > 0) {
      schema.tool = tool.map((item) => ({
        "@type": "HowToTool",
        name: item,
      }));
    }

    if (image) {
      schema.image = image;
    }

    const script = document.createElement("script");
    script.id = schemaId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(schemaId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [name, description, totalTime, estimatedCost, supply, tool, steps, image]);

  return null;
};

export default HowToSchema;
