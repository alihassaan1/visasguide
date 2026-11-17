
interface FAQ {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQ[];
  pageUrl?: string;
  visible?: boolean;
}

const FAQSchema = ({ faqs, pageUrl, visible = false }: FAQSchemaProps) => {
  if (!visible || !faqs?.length) return null;
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", ...(pageUrl ? { url: pageUrl } : {}), mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <script type="application/ld+json" data-schema="faq" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
};

export default FAQSchema;
