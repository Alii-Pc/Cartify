import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { JsonLd } from "@/components/seo/JsonLd";
import { CategoryDetailsClient } from "@/components/categories/CategoryDetailsClient";
import type { SafeCategory, SafeProduct } from "@/types";

interface CategoryPageProps {
  params: { slug: string };
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

async function getCategoryData(slug: string) {
  try {
    await connectDB();
    const cleanSlug = slug.toLowerCase();
    const categoryDb = await Category.findOne({ slug: cleanSlug }).lean();

    if (!categoryDb) {
      return null;
    }

    const productsDb = await Product.find({ category: cleanSlug })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedCategory: SafeCategory = {
      _id: categoryDb._id.toString(),
      name: categoryDb.name,
      slug: categoryDb.slug,
      emoji: categoryDb.emoji,
      description: categoryDb.description,
    };

    const formattedProducts: SafeProduct[] = productsDb.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: p.category,
      images: p.images,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      featured: p.featured,
      tag: p.tag,
      specifications: p.specifications,
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return {
      category: formattedCategory,
      products: formattedProducts,
    };
  } catch (error) {
    console.error("Error fetching category server data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const data = await getCategoryData(params.slug);

  if (!data || !data.category) {
    const formattedName = params.slug.replace("-", " ");
    return {
      title: `${formattedName.charAt(0).toUpperCase() + formattedName.slice(1)} | Cartify`,
      description: `Explore our curated selection of ${formattedName} products at Cartify.`,
    };
  }

  const { category } = data;
  const pageTitle = `${category.name} Collection | Cartify`;
  const pageDescription =
    category.description?.length > 155
      ? `${category.description.slice(0, 152)}...`
      : category.description ||
        `Shop high-quality ${category.name} products at Cartify. Honest prices and free shipping over $50.`;
  const canonicalUrl = `/categories/${category.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
      siteName: "Cartify",
      images: [
        {
          url: "/images/products/table_lamp.jpg",
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: ["/images/products/table_lamp.jpg"],
    },
  };
}

export default async function CategoryDetailsPage({
  params,
}: CategoryPageProps) {
  const data = await getCategoryData(params.slug);

  if (!data || !data.category) {
    notFound();
  }

  const { category, products } = data;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${siteUrl}/categories`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${siteUrl}/categories/${category.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <CategoryDetailsClient
        slug={params.slug}
        initialCategory={category}
        initialProducts={products}
      />
    </>
  );
}
