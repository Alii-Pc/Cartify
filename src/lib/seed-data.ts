import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export const SEED_CATEGORIES = [
  {
    name: "Home & Living",
    slug: "home-living",
    emoji: "🪴",
    description: "Thoughtfully crafted accents, textiles, and decor for a calm, balanced living space.",
  },
  {
    name: "Apparel",
    slug: "apparel",
    emoji: "👕",
    description: "Timeless everyday essentials made from organic cotton, linen, and sustainable wool.",
  },
  {
    name: "Electronics",
    slug: "electronics",
    emoji: "🎧",
    description: "Minimalist desk accessories, audio gear, and functional tech built for focus and flow.",
  },
  {
    name: "Beauty",
    slug: "beauty",
    emoji: "🧴",
    description: "Clean, plant-based skincare and self-care formulas infused with natural botanical oils.",
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    emoji: "🍳",
    description: "Durable ceramic tableware, precision brewing tools, and chef-grade kitchen essentials.",
  },
  {
    name: "Outdoors",
    slug: "outdoors",
    emoji: "🥾",
    description: "Weather-resistant carry gear, insulated drinkware, and essentials for weekend excursions.",
  },
];

export const SEED_PRODUCTS = [
  // Home & Living
  {
    name: "Ceramic Pour-Over Coffee Set",
    slug: "ceramic-pour-over-set",
    description: "Hand-glazed stoneware dripper and matching carafe designed for optimal thermal retention and smooth extraction.",
    price: 38.00,
    compareAtPrice: 48.00,
    category: "home-living",
    images: [
      "/images/products/pourover_set.jpg"
    ],
    rating: 4.9,
    reviewCount: 42,
    stock: 24,
    featured: true,
    tag: "New",
    specifications: {
      "Material": "Stoneware Ceramic",
      "Capacity": "500 ml (2 cups)",
      "Care": "Dishwasher safe",
      "Origin": "Made in Portugal"
    }
  },
  {
    name: "Woven Desk Organizer Basket",
    slug: "woven-desk-organizer",
    description: "Hand-braided natural seagrass storage tray, perfect for keeping notebooks, pens, and desk clutter neatly tucked away.",
    price: 29.00,
    compareAtPrice: undefined,
    category: "home-living",
    images: [
      "/images/products/woven_basket.jpg",
    ],
    rating: 4.8,
    reviewCount: 19,
    stock: 35,
    featured: true,
    tag: "New",
    specifications: {
      "Material": "100% Natural Seagrass",
      "Dimensions": "26 cm x 18 cm x 8 cm",
      "Care": "Wipe clean with dry cloth"
    }
  },
  {
    name: "Linen Throw Cushion & Pillow Cover",
    slug: "belgian-linen-throw-cushion",
    description: "Stonewashed Belgian linen pillowcase featuring hidden brass zipper and plush feather-down interior insert.",
    price: 45.00,
    compareAtPrice: 55.00,
    category: "home-living",
    images: [
      "/images/products/throw_cushion.jpg",
    ],
    rating: 4.7,
    reviewCount: 31,
    stock: 18,
    featured: false,
    tag: "Sale",
    specifications: {
      "Material": "100% Belgian Linen",
      "Dimensions": "50 cm x 50 cm",
      "Care": "Machine wash cold on gentle cycle"
    }
  },
  {
    name: "Minimalist Ceramic Planter Pot",
    slug: "minimalist-ceramic-planter",
    description: "Matte textured terracotta pot with integrated drainage tray, engineered to keep indoor foliage healthy and thriving.",
    price: 34.00,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 56,
    stock: 40,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "Unglazed Terracotta & Ceramic",
      "Diameter": "18 cm",
      "Includes": "Matching saucer and drainage hole"
    }
  },

  // Apparel
  {
    name: "Linen Weekend Duffel Bag",
    slug: "linen-weekend-bag",
    description: "Spacious heavyweight canvas and washed linen travel holdall with vegetable-tanned leather handles and solid brass hardware.",
    price: 74.00,
    compareAtPrice: 95.00,
    category: "apparel",
    images: [
      "/images/products/duffel_bag.jpg",
    ],
    rating: 4.9,
    reviewCount: 88,
    stock: 15,
    featured: true,
    tag: "Sale",
    specifications: {
      "Material": "Heavyweight Cotton Canvas & Leather",
      "Dimensions": "52 cm x 30 cm x 24 cm",
      "Capacity": "38 Liters",
      "Strap": "Detachable adjustable shoulder strap"
    }
  },
  {
    name: "Organic Heavyweight Cotton Crewneck",
    slug: "organic-cotton-crewneck",
    description: "Garment-dyed French terry sweatshirt woven from GOTS-certified organic cotton. Relaxed, structured fit designed for daily wear.",
    price: 68.00,
    category: "apparel",
    images: [
      "/images/products/cotton_crewneck.jpg"
    ],
    rating: 4.8,
    reviewCount: 64,
    stock: 30,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "100% GOTS Certified Organic Cotton",
      "Weight": "420 GSM French Terry",
      "Fit": "Relaxed / Unisex",
      "Care": "Wash cold, tumble dry low"
    }
  },
  {
    name: "Merino Wool Ribbed Beanie",
    slug: "merino-wool-ribbed-beanie",
    description: "Ultra-soft extrafine Australian Merino wool watch cap. Naturally temperature-regulating, breathable, and itch-free.",
    price: 32.00,
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 27,
    stock: 45,
    featured: false,
    tag: null,
    specifications: {
      "Material": "100% Extrafine Australian Merino Wool",
      "Size": "One size fits most",
      "Care": "Hand wash flat to dry"
    }
  },
  {
    name: "Japanese Selvedge Denim Tote",
    slug: "japanese-selvedge-denim-tote",
    description: "Raw 13oz Kurabo Mills denim carry-all featuring reinforced webbing handles and internal zippered pocket for essentials.",
    price: 54.00,
    compareAtPrice: 64.00,
    category: "apparel",
    images: [
      "/images/products/denim_tote.jpg"
    ],
    rating: 4.7,
    reviewCount: 22,
    stock: 20,
    featured: false,
    tag: "New",
    specifications: {
      "Material": "13oz Raw Japanese Selvedge Denim",
      "Dimensions": "42 cm x 38 cm x 14 cm",
      "Origin": "Woven in Okayama, Japan"
    }
  },

  // Electronics
  {
    name: "Matte Aluminum Desk Stand for Laptop",
    slug: "aluminum-desk-stand",
    description: "Ergonomic elevated stand milled from solid anodized aluminum. Improves posture and maximizes airflow around your laptop.",
    price: 58.00,
    category: "electronics",
    images: [
      "/images/products/laptop_stand.jpg"
    ],
    rating: 4.9,
    reviewCount: 73,
    stock: 28,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "Anodized Space-Grade Aluminum",
      "Compatibility": "Fits laptops 11 to 16 inches",
      "Weight": "650 grams"
    }
  },
  {
    name: "Acoustic Noise-Isolating Headphones",
    slug: "acoustic-noise-isolating-headphones",
    description: "Premium over-ear wireless audio monitors featuring 40mm beryllium drivers, memory foam ear cushions, and 35-hour battery life.",
    price: 185.00,
    compareAtPrice: 220.00,
    category: "electronics",
    images: [
      "/images/products/headphones.jpg"
    ],
    rating: 4.9,
    reviewCount: 114,
    stock: 12,
    featured: true,
    tag: "Sale",
    specifications: {
      "Drivers": "40mm Custom Beryllium",
      "Battery Life": "35 Hours continuous playback",
      "Connectivity": "Bluetooth 5.3 & 3.5mm Aux",
      "Weight": "280 grams"
    }
  },
  {
    name: "Solid Walnut Mechanical Keyboard Case",
    slug: "walnut-mechanical-keyboard-case",
    description: "CNC-milled solid American walnut base frame for 65% mechanical keyboards. Includes dampening foam for rich acoustic typing sound.",
    price: 85.00,
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 39,
    stock: 16,
    featured: false,
    tag: "New",
    specifications: {
      "Material": "Solid American Black Walnut",
      "Layout": "Standard 65% Tray Mount",
      "Finish": "Natural Beeswax & Carnauba oil"
    }
  },
  {
    name: "Fast-Charge Wooden Wireless Charger Pad",
    slug: "wooden-wireless-charger-pad",
    description: "15W Qi-certified fast charging pad crafted from sustainable bamboo. Features non-slip silicone feet and LED status indicator.",
    price: 36.00,
    compareAtPrice: 45.00,
    category: "electronics",
    images: [
      "/images/products/wooden_charger.jpg"
    ],
    rating: 4.7,
    reviewCount: 51,
    stock: 32,
    featured: false,
    tag: null,
    specifications: {
      "Output": "15W Max Qi Wireless Charging",
      "Material": "Natural Bamboo & Aircraft Aluminum",
      "Cable": "Includes 1.5m braided USB-C cable"
    }
  },

  // Beauty
  {
    name: "Botanical Hydrating Facial Oil",
    slug: "botanical-hydrating-facial-oil",
    description: "Restorative face elixir blended with cold-pressed rosehip seed, jojoba, and blue tansy. Deeply nourishes and locks in vital moisture.",
    price: 42.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 95,
    stock: 30,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Volume": "30 ml (1.0 fl oz)",
      "Key Ingredients": "Rosehip, Jojoba, Squalane, Blue Tansy",
      "Formulation": "100% Vegan, Cruelty-Free, Paraben-Free"
    }
  },
  {
    name: "Exfoliating Sea Salt & Lavender Scrub",
    slug: "sea-salt-lavender-scrub",
    description: "Mineral-rich Pacific sea salt combined with French lavender essential oil and shea butter for gently buffing away dull skin.",
    price: 28.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 41,
    stock: 25,
    featured: false,
    tag: null,
    specifications: {
      "Weight": "250 grams (8.8 oz)",
      "Scent": "Organic French Lavender & Eucalyptus",
      "Care": "Store in cool dry place away from direct sunlight"
    }
  },
  {
    name: "Natural Jade Facial Roller & Gua Sha Set",
    slug: "jade-facial-roller-set",
    description: "Hand-carved authentic green Xiuyan jade sculpting tools designed to promote lymphatic drainage and relieve tension.",
    price: 34.00,
    compareAtPrice: 42.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 68,
    stock: 38,
    featured: false,
    tag: "Sale",
    specifications: {
      "Material": "100% Natural Xiuyan Jade",
      "Includes": "Dual-ended roller, Gua Sha stone, and velvet travel pouch"
    }
  },
  {
    name: "Nourishing Shea Butter Lip Balm Trio",
    slug: "shea-butter-lip-balm-trio",
    description: "Moisture-locking balm trio crafted with raw Ghanaian shea butter, organic beeswax, and cold-pressed peppermint oil.",
    price: 18.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewCount: 34,
    stock: 50,
    featured: false,
    tag: "New",
    specifications: {
      "Count": "Pack of 3 tubes (15g total)",
      "Flavors": "Peppermint, Honey Vanilla, Unscented Raw"
    }
  },

  // Kitchen
  {
    name: "Artisanal Cast Iron Skillet (10-Inch)",
    slug: "cast-iron-skillet-10-inch",
    description: "Pre-seasoned heirloom cast iron frying pan with ergonomic dual-pour spouts and stay-cool silicone handle sleeve.",
    price: 65.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 132,
    stock: 18,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Diameter": "10 inches (25.4 cm)",
      "Weight": "2.4 kg",
      "Compatibility": "Induction, Gas, Electric, Oven safe up to 500°F"
    }
  },
  {
    name: "Handmade Walnut End-Grain Cutting Board",
    slug: "walnut-end-grain-cutting-board",
    description: "Self-healing butcher block crafted from sustainably harvested end-grain American walnut. Features deep juice groove and side hand grips.",
    price: 92.00,
    compareAtPrice: 115.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 47,
    stock: 14,
    featured: true,
    tag: "Sale",
    specifications: {
      "Material": "100% Solid American Walnut",
      "Dimensions": "40 cm x 30 cm x 4 cm",
      "Care": "Hand wash only, condition with food-grade mineral oil"
    }
  },
  {
    name: "Japanese Chef Knife (Gyuto 210mm)",
    slug: "japanese-chef-knife-gyuto",
    description: "67-layer Damascus steel blade with VG-10 cutting core. Hand-sharpened to 15-degree edge with octagonal magnolia wood handle.",
    price: 145.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 81,
    stock: 10,
    featured: false,
    tag: "New",
    specifications: {
      "Blade Material": "67-Layer Damascus with VG-10 Core",
      "Blade Length": "210 mm (8.2 inches)",
      "Hardness": "60-62 HRC",
      "Handle": "Octagonal Magnolia & Water Buffalo Horn"
    }
  },
  {
    name: "Double-Wall Stainless Steel French Press",
    slug: "stainless-steel-french-press",
    description: "Vacuum-insulated 1-liter coffee plunger engineered to keep brew piping hot for hours while keeping outside wall cool to the touch.",
    price: 48.00,
    compareAtPrice: 58.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 63,
    stock: 26,
    featured: false,
    tag: null,
    specifications: {
      "Capacity": "1000 ml (34 oz / 8 cups)",
      "Material": "18/8 Food-Grade Stainless Steel",
      "Filtration": "3-stage micro mesh filter screen"
    }
  },

  // Outdoors
  {
    name: "Matte Steel Insulated Water Bottle (32oz)",
    slug: "matte-steel-water-bottle",
    description: "Double-walled copper-lined vacuum flask keeps water ice-cold for 24 hours or hot for 12. Includes leakproof flex strap cap.",
    price: 22.00,
    category: "outdoors",
    images: [
      "/images/products/steel_water_bottle.jpg"
    ],
    rating: 4.9,
    reviewCount: 146,
    stock: 45,
    featured: true,
    tag: "Bestseller",
    specifications: {
      "Capacity": "950 ml (32 oz)",
      "Material": "18/8 Pro-Grade Stainless Steel",
      "Insulation": "TempShield Double Wall Vacuum",
      "Care": "BPA-Free, Dishwasher safe"
    }
  },
  {
    name: "Ultralight Compact Camping Hammock",
    slug: "ultralight-camping-hammock",
    description: "Triple-stitched parachute 70D ripstop nylon hammock with heavy-duty carabiners and tree-friendly daisy-chain straps.",
    price: 49.00,
    compareAtPrice: 65.00,
    category: "outdoors",
    images: [
      "/images/products/camping_hammock.jpg"
    ],
    rating: 4.8,
    reviewCount: 59,
    stock: 22,
    featured: false,
    tag: "Sale",
    specifications: {
      "Weight Capacity": "500 lbs (226 kg)",
      "Total Weight": "580 grams (including straps)",
      "Dimensions": "300 cm x 200 cm (Double size)"
    }
  },
  {
    name: "Rechargeable LED Lantern & Power Bank",
    slug: "rechargeable-led-lantern",
    description: "Weatherproof IPX6 camp lantern providing 600 lumens of warm dimmable light, featuring built-in 10,000mAh USB phone charging port.",
    price: 52.00,
    category: "outdoors",
    images: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 77,
    stock: 20,
    featured: false,
    tag: "New",
    specifications: {
      "Brightness": "30 to 600 Lumens (Continuous dimming)",
      "Battery": "10,000 mAh Li-ion (Up to 120 hrs runtime on low)",
      "Water Resistance": "IPX6 Stormproof"
    }
  },
  {
    name: "Waxed Canvas & Leather Backpack",
    slug: "waxed-canvas-backpack",
    description: "Heavy-duty water-repellent 18oz waxed cotton rucksack with padded laptop compartment and antiqued brass buckles.",
    price: 118.00,
    compareAtPrice: 145.00,
    category: "outdoors",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 92,
    stock: 16,
    featured: false,
    tag: null,
    specifications: {
      "Material": "18oz Filtered Wax Canvas & Full Grain Leather",
      "Capacity": "28 Liters",
      "Laptop Sleeve": "Fits up to 16-inch MacBook Pro"
    }
  }
];

export async function seedDatabaseIfEmpty() {
  await connectDB();
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log("Database empty — auto-seeding categories and products...");
    await Category.deleteMany({});
    await Category.insertMany(SEED_CATEGORIES);
    await Product.deleteMany({});
    await Product.insertMany(SEED_PRODUCTS);
    console.log("Auto-seed completed successfully.");
    return true;
  }
  return false;
}
