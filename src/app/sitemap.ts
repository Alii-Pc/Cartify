import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

const FALLBACK_CATEGORIES = [
  "home-living",
  "apparel",
  "electronics",
  "beauty",
  "kitchen",
  "outdoors",
];

const FALLBACK_PRODUCTS = [
  "minimalist-ambient-desk-lamp",
  "true-wireless-anc-studio-earbuds",
  "stoneware-espresso-cup-set",
  "organic-turkish-bath-towel-set",
  "alpine-trail-pack-35l",
  "botanical-radiance-serum",
  "cashmere-wool-knit-sweater",
  "barista-touch-pour-over-kettle",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/track`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    await connectDB();

    const [products, categories] = await Promise.all([
      Product.find({}, "slug updatedAt").lean(),
      Category.find({}, "slug updatedAt").lean(),
    ]);

    const productSlugs =
      products && products.length > 0
        ? products.map((p) => ({
            slug: p.slug,
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          }))
        : FALLBACK_PRODUCTS.map((slug) => ({
            slug,
            updatedAt: new Date(),
          }));

    const categorySlugs =
      categories && categories.length > 0
        ? categories.map((c) => ({
            slug: c.slug,
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          }))
        : FALLBACK_CATEGORIES.map((slug) => ({
            slug,
            updatedAt: new Date(),
          }));

    const productRoutes: MetadataRoute.Sitemap = productSlugs.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((c) => ({
      url: `${siteUrl}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap, using static fallbacks:", error);
    const fallbackCategoryRoutes: MetadataRoute.Sitemap = FALLBACK_CATEGORIES.map(
      (slug) => ({
        url: `${siteUrl}/categories/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );
    const fallbackProductRoutes: MetadataRoute.Sitemap = FALLBACK_PRODUCTS.map(
      (slug) => ({
        url: `${siteUrl}/products/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );
    return [
      ...staticRoutes,
      ...fallbackCategoryRoutes,
      ...fallbackProductRoutes,
    ];
  }
}
