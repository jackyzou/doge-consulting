// JSON-LD structured data component for SEO
// Usage: <JsonLd data={structuredData} />

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Pre-built structured data generators

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doge Consulting Group Limited",
    alternateName: "Doge Consulting",
    url: "https://doge-consulting.com",
    logo: "https://doge-consulting.com/doge-logo.png",
    description: "AI-powered product sourcing and shipping from China to the USA. Factory-direct pricing, full customs clearance, and door-to-door delivery.",
    foundingDate: "2024",
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-425-223-0449",
        contactType: "customer service",
        areaServed: "US",
        availableLanguage: ["English", "Chinese"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+852-6151-3289",
        contactType: "customer service",
        areaServed: ["HK", "CN"],
        availableLanguage: ["English", "Chinese"],
      },
    ],
    address: [
      {
        "@type": "PostalAddress",
        addressLocality: "Wan Chai",
        addressRegion: "Hong Kong",
        addressCountry: "HK",
        streetAddress: "Rm 5, 27/F, China Resources Bldg, 26 Harbour Rd",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "Seattle",
        addressRegion: "WA",
        addressCountry: "US",
      },
      {
        "@type": "PostalAddress",
        addressLocality: "Shenzhen",
        addressRegion: "Guangdong",
        addressCountry: "CN",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doge Consulting",
    url: "https://doge-consulting.com",
    description: "AI-powered product sourcing and shipping from China to the USA.",
    publisher: {
      "@type": "Organization",
      name: "Doge Consulting Group Limited",
      logo: {
        "@type": "ImageObject",
        url: "https://doge-consulting.com/doge-logo.png",
      },
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.imageUrl || "https://doge-consulting.com/doge-logo.png",
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Organization",
      name: article.authorName,
      url: "https://doge-consulting.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Doge Consulting Group Limited",
      logo: {
        "@type": "ImageObject",
        url: "https://doge-consulting.com/doge-logo.png",
      },
    },
  };
}

export function softwareAppSchema(tool: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Doge Consulting Group Limited",
    },
  };
}
