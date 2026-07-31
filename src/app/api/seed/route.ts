import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    
    // Seed a category first
    let category = await Category.findOne({ name: "Premium Essentials" });
    if (!category) {
      category = await Category.create({
        name: "Premium Essentials",
        slug: "premium-essentials",
        description: "Curated premium items for everyday life.",
        image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=1000",
        isActive: true
      });
    }

    // Check if products exist
    const count = await Product.countDocuments();
    if (count > 0) {
      // Just make sure at least 4 products are featured
      const featuredCount = await Product.countDocuments({ featured: true });
      if (featuredCount === 0) {
        await Product.updateMany({}, { $set: { featured: true } });
        return NextResponse.json({ success: true, message: "Existing products marked as featured!" });
      }
      return NextResponse.json({ success: true, message: "Products already exist and are featured!" });
    }

    // Seed beautiful products
    const dummyProducts = [
      {
        name: "Artisan Ceramic Mug",
        slug: "artisan-ceramic-mug",
        description: "Handcrafted ceramic mug with a beautiful matte glaze. Perfect for your morning coffee or evening tea.",
        price: 24.99,
        compareAtPrice: 32.00,
        costPerItem: 10.00,
        images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800"],
        category: category._id,
        stock: 50,
        status: "active",
        featured: true,
        tag: "Bestseller",
        rating: 4.9,
        reviewCount: 128
      },
      {
        name: "Minimalist Leather Wallet",
        slug: "minimalist-leather-wallet",
        description: "Slim, full-grain leather wallet designed to hold your essentials without the bulk.",
        price: 45.00,
        compareAtPrice: 60.00,
        costPerItem: 15.00,
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800"],
        category: category._id,
        stock: 120,
        status: "active",
        featured: true,
        tag: "New",
        rating: 4.8,
        reviewCount: 84
      },
      {
        name: "Organic Cotton Throw Blanket",
        slug: "organic-cotton-throw",
        description: "Ultra-soft, breathable organic cotton throw blanket. Ideal for cozy evenings on the sofa.",
        price: 89.99,
        costPerItem: 30.00,
        images: ["https://images.unsplash.com/photo-1580828369019-2228f42df5ce?auto=format&fit=crop&q=80&w=800"],
        category: category._id,
        stock: 35,
        status: "active",
        featured: true,
        tag: "Sale",
        rating: 5.0,
        reviewCount: 42
      },
      {
        name: "Aromatherapy Soy Candle",
        slug: "aromatherapy-soy-candle",
        description: "Hand-poured soy candle infused with natural essential oils. 40-hour burn time.",
        price: 32.50,
        compareAtPrice: 40.00,
        costPerItem: 12.00,
        images: ["https://images.unsplash.com/photo-1602874801007-bd458cb6c975?auto=format&fit=crop&q=80&w=800"],
        category: category._id,
        stock: 200,
        status: "active",
        featured: true,
        tag: "Staff Pick",
        rating: 4.7,
        reviewCount: 215
      }
    ];

    await Product.insertMany(dummyProducts);
    
    return NextResponse.json({ success: true, message: "Successfully seeded beautiful featured products!" });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
