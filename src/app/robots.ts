import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/api/", "/pay/", "/login", "/payment/"],
      },
    ],
    sitemap: "https://doge-consulting.com/sitemap.xml",
  };
}
