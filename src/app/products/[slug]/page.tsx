import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetailsClient } from "@/components/products/ProductDetailsClient";
import type { SafeProduct, SafeCategory } from "@/types";

interface ProductPageProps {
  params: { slug: string };
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cartify.com";

async function getProductData(slug: string) {
  try {
    await connectDB();
    const identifier = slug.toLowerCase();
    let productDb = await Product.findOne({ slug: identifier }).lean();

    if (!productDb && mongoose.isValidObjectId(slug)) {
      productDb = await Product.findById(slug).lean();
    }

    if (!productDb) {
      return null;
    }

    const [relatedProductsDb, categoryDb] = await Promise.all([
      Product.find({
        category: productDb.category,
        _id: { $ne: productDb._id },
      })
        .limit(4)
        .lean(),
      Category.findOne({ slug: productDb.category }).lean(),
    ]);

    const formattedProduct: SafeProduct = {
      _id: productDb._id.toString(),
      name: productDb.name,
      slug: productDb.slug,
      description: productDb.description,
      price: productDb.price,
      compareAtPrice: productDb.compareAtPrice,
      category: productDb.category,
      images: productDb.images,
      rating: productDb.rating,
      reviewCount: productDb.reviewCount,
      stock: productDb.stock,
      featured: productDb.featured,
      tag: productDb.tag,
      specifications: productDb.specifications,
      createdAt: productDb.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: productDb.updatedAt?.toISOString() || new Date().toISOString(),
    };

    const formattedRelated: SafeProduct[] = relatedProductsDb.map((p) => ({
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

    const formattedCategory: SafeCategory | null = categoryDb
      ? {
          _id: categoryDb._id.toString(),
          name: categoryDb.name,
          slug: categoryDb.slug,
          emoji: categoryDb.emoji,
          description: categoryDb.description,
        }
      : null;

    return {
      product: formattedProduct,
      relatedProducts: formattedRelated,
      category: formattedCategory,
    };
  } catch (error) {
    console.error("Error loading product data for server page:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const data = await getProductData(params.slug);

  if (!data || !data.product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const { product } = data;
  const pageTitle = `${product.name} | Cartify`;
  const pageDescription =
    product.description?.length > 155
      ? `${product.description.slice(0, 152)}...`
      : product.description ||
        `Buy ${product.name} with free shipping and 30-day returns at Cartify.`;
  const canonicalUrl = `/products/${product.slug}`;
  const ogImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => ({
          url: img,
          alt: product.name,
        }))
      : [{ url: "/images/products/table_lamp.jpg", alt: product.name }];

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
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductPageProps) {
  const data = await getProductData(params.slug);

  if (!data || !data.product) {
    notFound();
  }

  const { product, relatedProducts, category } = data;

  const validUntilDate = new Date();
  validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Cartify",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      priceValidUntil: validUntilDate.toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Cartify",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 4.8,
      reviewCount: product.reviewCount || 1,
      bestRating: "5",
      worstRating: "1",
    },
  };

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
        name: "Products",
        item: `${siteUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category?.name || product.category.replace("-", " "),
        item: `${siteUrl}/products?category=${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      <ProductDetailsClient
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
        initialCategory={category}
      />
    </>
  );
}
