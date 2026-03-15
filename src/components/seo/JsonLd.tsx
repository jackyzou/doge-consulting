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
    potentialAction: {
      "@type": "SearchAction",
      target: "https://doge-consulting.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
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

// Service schema for /services page
export function serviceSchema(service: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      "@type": "Organization",
      name: "Doge Consulting Group Limited",
      url: "https://doge-consulting.com",
    },
    areaServed: service.areaServed || "US",
    serviceType: "Import/Export Logistics",
  };
}

// Breadcrumb schema — use on every page for SERP breadcrumbs
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Speakable schema for GEO/AEO — tells AI assistants which sections to cite
export function speakableSchema(url: string, cssSelectors: string[] = ["h1", "h2", ".prose p:first-of-type"]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

// HowTo schema for step-by-step processes
export function howToSchema(howTo: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
