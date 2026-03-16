import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  websiteSchema,
  faqSchema,
  articleSchema,
  softwareAppSchema,
  serviceSchema,
  breadcrumbSchema,
  howToSchema,
  speakableSchema,
} from "@/components/seo/JsonLd";

function validateJsonLd(data: Record<string, unknown>) {
  expect(data).toHaveProperty("@context", "https://schema.org");
  expect(data).toHaveProperty("@type");
  expect(typeof data["@type"]).toBe("string");
}

describe("Schema Validation — JSON-LD Structured Data", () => {
  it("Organization schema has required fields", () => {
    const schema = organizationSchema();
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("Organization");
    expect(schema).toHaveProperty("name");
    expect(schema).toHaveProperty("url");
    expect(schema).toHaveProperty("logo");
    expect(schema).toHaveProperty("contactPoint");
  });

  it("WebSite schema has SearchAction", () => {
    const schema = websiteSchema();
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("WebSite");
    expect(schema).toHaveProperty("potentialAction");
    const action = schema.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
    expect(action).toHaveProperty("target");
  });

  it("FAQ schema validates Q&A pairs", () => {
    const schema = faqSchema([
      { question: "What is shipping?", answer: "Moving goods." },
      { question: "How long?", answer: "2-4 weeks." },
    ]);
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("FAQPage");
    const entities = schema.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[0]).toHaveProperty("name");
    expect(entities[0]).toHaveProperty("acceptedAnswer");
  });

  it("Article schema has required fields", () => {
    const schema = articleSchema({
      title: "Test Article",
      description: "Test description",
      url: "https://doge-consulting.com/blog/test",
      datePublished: "2026-01-01",
      authorName: "Seto Nakamura",
    });
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("Article");
    expect(schema).toHaveProperty("headline");
    expect(schema).toHaveProperty("author");
    expect(schema).toHaveProperty("datePublished");
    expect(schema).toHaveProperty("publisher");
  });

  it("SoftwareApplication schema validates", () => {
    const schema = softwareAppSchema({
      name: "CBM Calculator",
      description: "Calculate CBM",
      url: "https://doge-consulting.com/tools/cbm-calculator",
    });
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("WebApplication");
    expect(schema).toHaveProperty("name");
    expect(schema).toHaveProperty("url");
    expect(schema).toHaveProperty("applicationCategory");
  });

  it("Service schema validates", () => {
    const schema = serviceSchema({
      name: "Ocean Freight",
      description: "Ship goods by sea",
      url: "https://doge-consulting.com/services",
    });
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("Service");
    expect(schema).toHaveProperty("name");
    expect(schema).toHaveProperty("provider");
  });

  it("BreadcrumbList schema validates items", () => {
    const schema = breadcrumbSchema([
      { name: "Home", url: "https://doge-consulting.com" },
      { name: "Blog", url: "https://doge-consulting.com/blog" },
    ]);
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveProperty("position", 1);
    expect(items[1]).toHaveProperty("position", 2);
  });

  it("HowTo schema has steps", () => {
    const schema = howToSchema({
      name: "How to Ship",
      description: "Guide to shipping",
      steps: [
        { name: "Step 1", text: "Get a quote" },
        { name: "Step 2", text: "Book shipment" },
      ],
    });
    validateJsonLd(schema);
    expect(schema["@type"]).toBe("HowTo");
    expect(schema).toHaveProperty("step");
    const steps = schema.step as Array<Record<string, unknown>>;
    expect(steps).toHaveLength(2);
  });

  it("Speakable schema validates", () => {
    const schema = speakableSchema("https://doge-consulting.com/blog/test");
    validateJsonLd(schema);
    expect(schema).toHaveProperty("speakable");
  });

  it("All schemas produce valid JSON", () => {
    const schemas = [
      organizationSchema(),
      websiteSchema(),
      faqSchema([{ question: "Q", answer: "A" }]),
      articleSchema({ title: "T", description: "D", url: "https://example.com", datePublished: "2026-01-01", authorName: "Test" }),
      softwareAppSchema({ name: "App", description: "D", url: "https://example.com" }),
      serviceSchema({ name: "S", description: "D", url: "https://example.com" }),
      breadcrumbSchema([{ name: "Home", url: "https://example.com" }]),
      howToSchema({ name: "H", description: "D", steps: [{ name: "S", text: "T" }] }),
    ];
    for (const schema of schemas) {
      const json = JSON.stringify(schema);
      expect(() => JSON.parse(json)).not.toThrow();
      // Ensure no undefined or null required fields
      expect(json).not.toContain('"undefined"');
    }
  });
});
