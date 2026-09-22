import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/categories",
          "/categories/*",
          "/about",
          "/contact",
          "/track",
          "/images/*",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/orders",
          "/orders/*",
          "/cart",
          "/reset-password",
          "/verify-email",
          "/forgot-password",
          "/login",
          "/signup",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/categories",
          "/categories/*",
          "/images/*",
        ],
        disallow: [
          "/admin/*",
          "/api/*",
          "/checkout/*",
          "/orders/*",
          "/cart",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/categories",
          "/categories/*",
          "/images/*",
        ],
        disallow: [
          "/admin/*",
          "/api/*",
          "/checkout/*",
          "/orders/*",
          "/cart",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
