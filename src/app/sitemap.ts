import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = "https://doge-consulting.com";

// Supported languages — must match src/lib/i18n.tsx LOCALES
const LANGUAGES = {
  en: "en",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  es: "es",
  fr: "fr",
} as const;

type LangMap = Record<string, string>;

// Generate hreflang alternates for a given path
function withAlternates(path: string): { languages: LangMap } {
  const languages: LangMap = {};
  for (const [locale, hreflang] of Object.entries(LANGUAGES)) {
    // Since our site serves all languages on the same URL (client-side i18n),
    // we point all hreflang entries to the same URL. This tells Google that
    // the same URL serves multiple languages with client-side detection.
    languages[hreflang] = `${BASE_URL}${path}`;
  }
  // x-default for language/region-unspecified users
  languages["x-default"] = `${BASE_URL}${path}`;
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public pages with hreflang alternates
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0, alternates: withAlternates("") },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9, alternates: withAlternates("/services") },
    { url: `${BASE_URL}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: withAlternates("/catalog") },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/about") },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/contact") },
    { url: `${BASE_URL}/quote`, lastModified: now, changeFrequency: "monthly", priority: 0.9, alternates: withAlternates("/quote") },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: withAlternates("/faq") },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8, alternates: withAlternates("/blog") },
    { url: `${BASE_URL}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: withAlternates("/glossary") },
    { url: `${BASE_URL}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: withAlternates("/case-studies") },
    { url: `${BASE_URL}/whitepaper`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: withAlternates("/whitepaper") },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/shipping-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: withAlternates("/team") },
    { url: `${BASE_URL}/guide/shipping-from-china`, lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: withAlternates("/guide/shipping-from-china") },
    { url: `${BASE_URL}/track`, lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: withAlternates("/track") },
    // Tools index + individual tools — high SEO value
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/tools") },
    { url: `${BASE_URL}/tools/cbm-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/tools/cbm-calculator") },
    { url: `${BASE_URL}/tools/revenue-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/tools/revenue-calculator") },
    { url: `${BASE_URL}/tools/duty-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.8, alternates: withAlternates("/tools/duty-calculator") },
    { url: `${BASE_URL}/tools/shipping-tracker`, lastModified: now, changeFrequency: "daily", priority: 0.8, alternates: withAlternates("/tools/shipping-tracker") },
    { url: `${BASE_URL}/tools/vessel-tracker`, lastModified: now, changeFrequency: "daily", priority: 0.7, alternates: withAlternates("/tools/vessel-tracker") },
    { url: `${BASE_URL}/tools/3d-visualizer`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: withAlternates("/tools/3d-visualizer") },
  ];

  // Dynamic blog posts (all languages that have published posts)
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, language: true, updatedAt: true },
    });

    // Group by slug — each slug may have multiple language versions
    const slugMap = new Map<string, { updatedAt: Date; languages: string[] }>();
    for (const post of posts) {
      const existing = slugMap.get(post.slug);
      if (existing) {
        existing.languages.push(post.language);
        if (post.updatedAt > existing.updatedAt) existing.updatedAt = post.updatedAt;
      } else {
        slugMap.set(post.slug, { updatedAt: post.updatedAt, languages: [post.language] });
      }
    }

    blogPages = Array.from(slugMap.entries()).map(([slug, data]) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: data.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: withAlternates(`/blog/${slug}`),
    }));
  } catch {
    // DB might not be available during build
  }

  return [...staticPages, ...blogPages];
}
