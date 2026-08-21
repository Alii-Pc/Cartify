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
  // ── 8 New Curated Products for Home & Featured Showcase ──
  {
    name: "Minimalist Ambient Desk Lamp",
    slug: "minimalist-ambient-desk-lamp",
    description: "Architectural touch-sensitive LED desk lamp with solid brass stem and natural white oak base. Features continuous warm dimming (2700K–3200K) and glare-free directional illumination.",
    price: 68.00,
    compareAtPrice: 85.00,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      "/images/products/table_lamp.jpg"
    ],
    rating: 4.9,
    reviewCount: 38,
    stock: 25,
    featured: true,
    tag: "New",
    specifications: {
      "Material": "Solid Anodized Brass & American White Oak",
      "Bulb": "Integrated warm LED (50,000 hour lifespan)",
      "Control": "Capacitive touch dimming on base",
      "Power": "USB-C Powered with 2m braided cable"
    }
  },
  {
    name: "True Wireless ANC Studio Earbuds",
    slug: "true-wireless-anc-studio-earbuds",
    description: "Next-generation studio wireless in-ear monitors equipped with hybrid Active Noise Cancellation, custom 11mm graphene drivers, and transparent audio pass-through mode.",
    price: 129.00,
    compareAtPrice: 159.00,
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      "/images/products/earbuds.jpg"
    ],
    rating: 4.9,
    reviewCount: 84,
    stock: 30,
    featured: true,
    tag: "Bestseller",
    specifications: {
      "Drivers": "11mm Custom Graphene Dynamic Drivers",
      "Battery Life": "8h (earbuds) + 24h (wireless Qi charging case)",
      "Noise Cancellation": "Hybrid ANC up to -38dB reduction",
      "Water Resistance": "IPX5 Sweat and Rain Resistant"
    }
  },
  {
    name: "Handcrafted Stoneware Espresso Cup Set",
    slug: "stoneware-espresso-cup-set",
    description: "Set of four hand-thrown ceramic demitasse cups coated in matte earth reactive glaze. Thick thermal walls retain crema and temperature for the perfect morning shot.",
    price: 32.00,
    compareAtPrice: 40.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 29,
    stock: 40,
    featured: true,
    tag: "New",
    specifications: {
      "Includes": "4 espresso cups (80 ml / 2.7 oz each)",
      "Material": "Lead-free high-fire stoneware",
      "Care": "Dishwasher, microwave, and oven safe",
      "Finish": "Reactive matte glaze (each piece unique)"
    }
  },
  {
    name: "Plush Organic Turkish Bath Towel Set",
    slug: "organic-turkish-bath-towel-set",
    description: "Loomed from 100% certified organic Aegean long-staple cotton at an ultra-dense 700 GSM. Features double-stitched hems for cloud-like softness and rapid absorption.",
    price: 58.00,
    compareAtPrice: 72.00,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
      "/images/products/bamboo_towels.jpg"
    ],
    rating: 4.9,
    reviewCount: 65,
    stock: 22,
    featured: true,
    tag: "Bestseller",
    specifications: {
      "Material": "100% Certified Organic Turkish Cotton",
      "Density": "700 GSM Ultra-Heavyweight",
      "Includes": "2 Full Bath Towels (75x140cm) + 2 Hand Towels (40x70cm)",
      "Certifications": "GOTS & OEKO-TEX Standard 100"
    }
  },
  {
    name: "All-Weather Alpine Trail Pack 35L",
    slug: "alpine-trail-pack-35l",
    description: "Rugged technical daypack engineered from weatherproof 420D Cordura ripstop. Features ergonomic ventilated back panel, hydration bladder sleeve, and quick-access roll-top closure.",
    price: 135.00,
    compareAtPrice: 165.00,
    category: "outdoors",
    images: [
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 52,
    stock: 18,
    featured: true,
    tag: "New",
    specifications: {
      "Capacity": "35 Liters",
      "Material": "420D Weatherproof Cordura Ripstop",
      "Hydration": "Compatible with bladders up to 3L",
      "Weight": "920 grams"
    }
  },
  {
    name: "Radiance Vitamin C & Hyaluronic Serum",
    slug: "radiance-vitamin-c-hyaluronic-serum",
    description: "Concentrated antioxidant facial serum blending 15% pure L-Ascorbic Acid, multi-molecular Hyaluronic Acid, and botanical Ferulic Acid to brighten skin and boost elasticity.",
    price: 38.00,
    compareAtPrice: 48.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1608248597359-07f240e4f0ad?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 76,
    stock: 35,
    featured: true,
    tag: "Sale",
    specifications: {
      "Volume": "30 ml (1.0 fl oz)",
      "Key Actives": "15% Vitamin C, 2% Hyaluronic Acid, 0.5% Ferulic Acid",
      "Formulation": "Fragrance-Free, Non-Comedogenic, Cruelty-Free",
      "Origin": "Made in USA"
    }
  },
  {
    name: "Heavyweight Washed Linen Overshirt",
    slug: "heavyweight-washed-linen-overshirt",
    description: "Tailored utility overshirt cut from 240 GSM washed French flax linen. Features dual chest flap pockets, natural corozo nut buttons, and a relaxed unstructured drape.",
    price: 84.00,
    compareAtPrice: 105.00,
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 43,
    stock: 20,
    featured: true,
    tag: "New",
    specifications: {
      "Fabric": "100% Normandy Heavyweight Flax Linen (240 GSM)",
      "Buttons": "Natural Sustainable Corozo Nut",
      "Fit": "Relaxed Tailored Fit",
      "Care": "Cold machine wash, air dry"
    }
  },
  {
    name: "Precision Temperature Gooseneck Kettle",
    slug: "precision-temperature-gooseneck-kettle",
    description: "Barista-grade electric pour-over kettle with 1200W rapid boil base, to-the-degree digital temperature dial (104°F–212°F), built-in brew stopwatch, and 60-minute heat hold.",
    price: 95.00,
    compareAtPrice: 120.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 91,
    stock: 15,
    featured: true,
    tag: "Sale",
    specifications: {
      "Capacity": "0.9 Liters (30 oz)",
      "Power": "1200W Rapid Heating Element (120V)",
      "Temperature Range": "104°F to 212°F (40°C to 100°C)",
      "Material": "304 Food-Grade Stainless Steel with Matte Finish"
    }
  },

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
      "/images/products/lip_balm.jpg"
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
      "/images/products/french_press.jpg"
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
  },

  // ── Additional Products: Apparel ──
  {
    name: "Linen Wrap Dress",
    slug: "linen-wrap-dress",
    description: "Effortlessly elegant wrap dress cut from lightweight French linen. Features adjustable waist tie, side pockets, and a relaxed midi silhouette.",
    price: 78.00,
    compareAtPrice: 95.00,
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 47,
    stock: 22,
    featured: false,
    tag: "New",
    specifications: {
      "Material": "100% French Linen",
      "Fit": "Relaxed Midi",
      "Sizes": "XS – XL",
      "Care": "Machine wash cold, hang dry"
    }
  },
  {
    name: "Cashmere Blend Sweater",
    slug: "cashmere-blend-sweater",
    description: "Ultra-soft crew-neck sweater knitted from a premium cashmere-merino blend. Ribbed cuffs and hem provide a structured yet cozy fit.",
    price: 89.00,
    category: "apparel",
    images: [
      "/images/products/cashmere_sweater.jpg"
    ],
    rating: 4.9,
    reviewCount: 62,
    stock: 18,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "70% Merino Wool, 30% Cashmere",
      "Weight": "280 GSM",
      "Fit": "Regular / Unisex",
      "Care": "Hand wash cold, lay flat to dry"
    }
  },
  {
    name: "Cotton Canvas Apron",
    slug: "cotton-canvas-apron",
    description: "Heavy-duty 12oz cotton canvas apron with adjustable cross-back straps and reinforced pockets. Built for the kitchen, workshop, or garden.",
    price: 38.00,
    category: "apparel",
    images: [
      "/images/products/canvas_apron.jpg"
    ],
    rating: 4.7,
    reviewCount: 33,
    stock: 40,
    featured: false,
    tag: null,
    specifications: {
      "Material": "12oz Washed Cotton Canvas",
      "Straps": "Adjustable cross-back leather straps",
      "Pockets": "3 front pockets with tool loop"
    }
  },
  {
    name: "Polarized Sunglasses",
    slug: "polarized-sunglasses",
    description: "Handcrafted acetate frame sunglasses with CR-39 polarized lenses offering 100% UV400 protection. Lightweight and built for all-day comfort.",
    price: 65.00,
    compareAtPrice: 80.00,
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.6,
    reviewCount: 54,
    stock: 35,
    featured: false,
    tag: "Sale",
    specifications: {
      "Frame": "Italian Mazzucchelli Acetate",
      "Lenses": "CR-39 Polarized, UV400",
      "Weight": "28 grams",
      "Includes": "Hardshell case & microfiber cloth"
    }
  },

  // ── Additional Products: Home & Living ──
  {
    name: "Bamboo Bath Towel Set",
    slug: "bamboo-bath-towel-set",
    description: "Plush 600 GSM towel trio woven from organic bamboo viscose. Naturally antibacterial, hypoallergenic, and incredibly absorbent.",
    price: 52.00,
    category: "home-living",
    images: [
      "/images/products/bamboo_towels.jpg"
    ],
    rating: 4.8,
    reviewCount: 38,
    stock: 28,
    featured: false,
    tag: "New",
    specifications: {
      "Material": "100% Organic Bamboo Viscose",
      "Weight": "600 GSM",
      "Set Includes": "1 Bath, 1 Hand, 1 Face towel",
      "Care": "Machine wash warm, tumble dry low"
    }
  },
  {
    name: "Modern Table Lamp",
    slug: "modern-table-lamp",
    description: "Sculptural bedside lamp with a linen drum shade and solid oak base. Three-way touch dimmer lets you set the perfect ambient glow.",
    price: 68.00,
    category: "home-living",
    images: [
      "/images/products/table_lamp.jpg"
    ],
    rating: 4.7,
    reviewCount: 45,
    stock: 15,
    featured: false,
    tag: null,
    specifications: {
      "Base": "Solid American White Oak",
      "Shade": "Natural Linen Drum, 30 cm",
      "Bulb": "E26 LED included (warm 2700K)",
      "Features": "3-way touch dimmer"
    }
  },
  {
    name: "Minimalist Wall Clock",
    slug: "minimalist-wall-clock",
    description: "Silent sweep quartz wall clock crafted from solid beechwood. Clean numberless dial brings calm Scandinavian style to any room.",
    price: 45.00,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 29,
    stock: 20,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "Solid European Beechwood",
      "Diameter": "30 cm (12 inches)",
      "Movement": "Silent sweep quartz (AA battery)",
      "Finish": "Natural oil & beeswax"
    }
  },
  {
    name: "Insulated Lunch Box",
    slug: "insulated-lunch-box",
    description: "Double-wall vacuum insulated stainless steel bento box keeping food hot for 6 hours or cold for 12. Leak-proof dual compartment design.",
    price: 36.00,
    category: "home-living",
    images: [
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.6,
    reviewCount: 57,
    stock: 42,
    featured: false,
    tag: null,
    specifications: {
      "Material": "18/8 Stainless Steel, BPA-Free",
      "Capacity": "1.2 Liters (dual compartment)",
      "Insulation": "Hot 6 hrs / Cold 12 hrs",
      "Weight": "480 grams"
    }
  },

  // ── Additional Products: Kitchen ──
  {
    name: "Handcrafted Wooden Spatula Set",
    slug: "handcrafted-wooden-spatula-set",
    description: "Three-piece set of hand-carved teak cooking utensils finished with food-safe mineral oil. Gentle on non-stick surfaces.",
    price: 28.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 41,
    stock: 50,
    featured: false,
    tag: null,
    specifications: {
      "Material": "Sustainably Harvested Teak",
      "Set Includes": "Spatula, Slotted spoon, Stirring paddle",
      "Finish": "Food-safe mineral oil",
      "Care": "Hand wash only, oil periodically"
    }
  },
  {
    name: "AeroPress Coffee Maker",
    slug: "aeropress-coffee-maker",
    description: "Portable immersion brewer producing smooth, rich coffee in under 2 minutes. Ideal for home, office, or travel with included filter set.",
    price: 35.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 128,
    stock: 60,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "BPA-Free Polypropylene",
      "Brew Time": "1-2 minutes",
      "Capacity": "1-3 cups per press",
      "Includes": "350 micro-filters, scoop, stirrer"
    }
  },
  {
    name: "Stainless Steel French Press",
    slug: "double-wall-stainless-french-press",
    description: "Double-wall insulated French press with precision four-level filtration system. Keeps coffee hot for 60 minutes without a heating element.",
    price: 48.00,
    compareAtPrice: 58.00,
    category: "kitchen",
    images: [
      "/images/products/french_press.jpg"
    ],
    rating: 4.7,
    reviewCount: 76,
    stock: 25,
    featured: false,
    tag: "Sale",
    specifications: {
      "Material": "18/10 Stainless Steel, Double-Wall",
      "Capacity": "1 Liter (8 cups)",
      "Filter": "4-level stainless micro-mesh",
      "Care": "Dishwasher safe (all parts)"
    }
  },
  {
    name: "Ceramic Matcha Bowl",
    slug: "ceramic-matcha-bowl",
    description: "Traditional Japanese chawan handmade from Mino-yaki stoneware. Wide shape allows proper whisking for a frothy, ceremonial-grade matcha.",
    price: 32.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 23,
    stock: 30,
    featured: false,
    tag: "New",
    specifications: {
      "Material": "Mino-yaki Stoneware",
      "Diameter": "12 cm",
      "Origin": "Gifu Prefecture, Japan",
      "Care": "Hand wash recommended"
    }
  },
  {
    name: "Organic Green Tea Leaves",
    slug: "organic-green-tea-leaves",
    description: "Single-origin first-flush Sencha loose leaf green tea from Uji, Kyoto. Shade-grown for deep umami flavor and vibrant emerald color.",
    price: 22.00,
    category: "kitchen",
    images: [
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 63,
    stock: 55,
    featured: false,
    tag: null,
    specifications: {
      "Type": "First-Flush Sencha",
      "Origin": "Uji, Kyoto, Japan",
      "Weight": "100g resealable pouch",
      "Certification": "JAS Organic, USDA Organic"
    }
  },
  {
    name: "Reusable Silicone Food Bags",
    slug: "reusable-silicone-food-bags",
    description: "Airtight, leak-proof platinum silicone storage bags rated for freezer, microwave, and dishwasher. Replace hundreds of single-use plastic bags.",
    price: 24.00,
    category: "kitchen",
    images: [
      "/images/products/silicone_bags.jpg"
    ],
    rating: 4.6,
    reviewCount: 48,
    stock: 65,
    featured: false,
    tag: null,
    specifications: {
      "Material": "100% Platinum Food-Grade Silicone",
      "Set": "4 bags (2 medium, 2 large)",
      "Temp Range": "-40°C to 230°C",
      "Care": "Dishwasher safe, boil to sterilize"
    }
  },

  // ── Additional Products: Beauty ──
  {
    name: "Natural Sea Sponge",
    slug: "natural-sea-sponge",
    description: "Sustainably harvested Mediterranean silk sea sponge. Naturally hypoallergenic, self-cleaning, and lasts 6–8 months with proper care.",
    price: 18.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewCount: 30,
    stock: 40,
    featured: false,
    tag: null,
    specifications: {
      "Type": "Silk Sea Sponge (Hippiospongia)",
      "Size": "10–12 cm diameter",
      "Origin": "Mediterranean, sustainably harvested",
      "Care": "Rinse and air dry between uses"
    }
  },
  {
    name: "Vitamin C Brightening Serum",
    slug: "vitamin-c-brightening-serum",
    description: "Potent 20% L-Ascorbic acid serum stabilized with Vitamin E and ferulic acid. Targets dark spots, evens skin tone, and boosts radiance.",
    price: 38.00,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewCount: 87,
    stock: 35,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Volume": "30 ml (1.0 fl oz)",
      "Active": "20% L-Ascorbic Acid, Vitamin E, Ferulic Acid",
      "Skin Type": "All skin types",
      "Formulation": "Vegan, Cruelty-Free, Fragrance-Free"
    }
  },
  {
    name: "Beard Grooming Kit",
    slug: "beard-grooming-kit",
    description: "Complete beard care set featuring cold-pressed jojoba oil, boar bristle brush, sandalwood comb, and stainless steel scissors in a canvas roll.",
    price: 42.00,
    compareAtPrice: 55.00,
    category: "beauty",
    images: [
      "/images/products/beard_kit.jpg"
    ],
    rating: 4.8,
    reviewCount: 44,
    stock: 20,
    featured: false,
    tag: "Sale",
    specifications: {
      "Kit Includes": "Beard oil, brush, comb, scissors, balm",
      "Oil Blend": "Jojoba, Argan, Cedarwood Essential Oil",
      "Brush": "Natural Boar Bristle with Bamboo Handle",
      "Packaging": "Waxed canvas travel roll"
    }
  },

  // ── Additional Products: Electronics ──
  {
    name: "Wireless Noise Cancelling Earbuds",
    slug: "wireless-noise-cancelling-earbuds",
    description: "True wireless earbuds with hybrid active noise cancellation, 10mm graphene drivers, and 30-hour total battery life with charging case.",
    price: 95.00,
    compareAtPrice: 120.00,
    category: "electronics",
    images: [
      "/images/products/earbuds.jpg"
    ],
    rating: 4.8,
    reviewCount: 91,
    stock: 25,
    featured: false,
    tag: "Sale",
    specifications: {
      "Drivers": "10mm Graphene-coated",
      "ANC": "Hybrid Active Noise Cancellation",
      "Battery": "8 hrs (buds) + 22 hrs (case)",
      "Connectivity": "Bluetooth 5.3, Multipoint"
    }
  },
  {
    name: "Wireless Charging Mouse Pad",
    slug: "wireless-charging-mouse-pad",
    description: "Extra-large desk mat with built-in 15W Qi wireless charging zone. Vegan leather surface with non-slip rubber base for precision tracking.",
    price: 45.00,
    category: "electronics",
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.6,
    reviewCount: 37,
    stock: 30,
    featured: false,
    tag: "New",
    specifications: {
      "Dimensions": "80 cm x 30 cm x 0.4 cm",
      "Charging": "15W Qi Wireless (phone zone)",
      "Surface": "Vegan PU Leather, water-resistant",
      "Cable": "Includes 1.8m braided USB-C cable"
    }
  },
  {
    name: "Bluetooth Smart Scale",
    slug: "bluetooth-smart-scale",
    description: "Precision body composition scale tracking 13 metrics via Bluetooth app sync. Tempered glass platform with backlit LED display.",
    price: 42.00,
    category: "electronics",
    images: [
      "/images/products/smart_scale.jpg"
    ],
    rating: 4.5,
    reviewCount: 53,
    stock: 35,
    featured: false,
    tag: null,
    specifications: {
      "Metrics": "Weight, BMI, Body Fat, Muscle Mass + 9 more",
      "Connectivity": "Bluetooth 5.0, iOS & Android app",
      "Platform": "Tempered glass, 30 cm x 30 cm",
      "Power": "4 x AAA batteries (included)"
    }
  },

  // ── Additional Products: Outdoors ──
  {
    name: "Travel Yoga Mat",
    slug: "travel-yoga-mat",
    description: "Ultra-thin 1.5mm natural rubber travel mat that folds flat into your bag. Sweat-absorbing microsuede top layer with alignment guide markings.",
    price: 55.00,
    category: "outdoors",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewCount: 36,
    stock: 28,
    featured: false,
    tag: null,
    specifications: {
      "Material": "Natural Tree Rubber + Microsuede",
      "Thickness": "1.5 mm (foldable)",
      "Dimensions": "183 cm x 68 cm",
      "Weight": "1 kg (includes carry strap)"
    }
  },
  {
    name: "Copper Water Bottle",
    slug: "copper-water-bottle",
    description: "Handcrafted pure copper bottle with leak-proof silicone seal. Ayurvedic tradition meets modern design for naturally alkaline water.",
    price: 34.00,
    category: "outdoors",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewCount: 60,
    stock: 32,
    featured: false,
    tag: "Bestseller",
    specifications: {
      "Material": "99.7% Pure Copper, food-safe lacquer interior",
      "Capacity": "950 ml",
      "Weight": "280 grams",
      "Care": "Hand wash with lemon & salt"
    }
  },
  {
    name: "Memory Foam Travel Pillow",
    slug: "memory-foam-travel-pillow",
    description: "Ergonomic U-shaped neck pillow with premium memory foam core and breathable bamboo jersey cover. Compresses to half-size for packing.",
    price: 29.00,
    category: "outdoors",
    images: [
      "/images/products/travel_pillow.jpg"
    ],
    rating: 4.5,
    reviewCount: 81,
    stock: 45,
    featured: false,
    tag: "New",
    specifications: {
      "Fill": "Slow-rebound memory foam",
      "Cover": "Bamboo jersey, removable & washable",
      "Features": "Snap closure, compression bag included",
      "Weight": "320 grams"
    }
  },
  {
    name: "Ergonomic Office Chair Cushion",
    slug: "ergonomic-office-chair-cushion",
    description: "Pressure-relieving gel-infused memory foam seat cushion with non-slip base. Improves posture and reduces tailbone strain during long hours.",
    price: 40.00,
    category: "outdoors",
    images: [
      "/images/products/chair_cushion.jpg"
    ],
    rating: 4.6,
    reviewCount: 67,
    stock: 38,
    featured: false,
    tag: null,
    specifications: {
      "Fill": "Gel-infused Memory Foam",
      "Cover": "Breathable mesh, removable & washable",
      "Dimensions": "45 cm x 35 cm x 7 cm",
      "Base": "Non-slip silicone dots"
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
