import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/api/auth/me",       // needed for client-side rendering (Header auth check)
          "/api/auth/providers", // needed for login page rendering
          "/api/blog",          // needed for blog listing
          "/api/blog/",         // needed for individual blog posts
          "/api/catalog",       // needed for catalog page
          "/api/health",        // health endpoint (public)
        ],
        disallow: ["/admin/", "/account/", "/api/", "/pay/", "/login", "/payment/"],
      },
    ],
    sitemap: "https://doge-consulting.com/sitemap.xml",
  };
}
