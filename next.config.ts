import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only in Docker builds (Windows has filename issues with standalone)
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  async headers() {
    return [
      {
        // Allow AI crawlers and search engines to index efficiently
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        ],
      },
      {
        // Prerender hint for key pages — helps Googlebot and AI crawlers
        source: "/(|services|about|contact|quote|faq|blog|glossary|case-studies|team|guide/shipping-from-china|tools|tools/:tool*)",
        headers: [
          { key: "Link", value: '<https://doge-consulting.com/feed.xml>; rel="alternate"; type="application/rss+xml"; title="Doge Consulting Blog"' },
        ],
      },
    ];
  },
};

export default nextConfig;
