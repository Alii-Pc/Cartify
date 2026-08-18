const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Load env vars from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#\s][^=]+)="?(.*?)"?$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;
  const products = await db.collection('products').find({}).toArray();
  
  console.log(`Found ${products.length} products.`);

  let totalUploaded = 0;

  for (const product of products) {
    let changed = false;
    const newImages = [];
    
    for (const img of product.images) {
      if (img.includes('res.cloudinary.com')) {
        newImages.push(img);
        continue;
      }
      
      console.log(`Uploading for product "${product.name}" -> ${img}`);
      try {
        const result = await cloudinary.uploader.upload(img, {
          folder: 'cartify/products',
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        console.log(` -> Success: ${result.secure_url}`);
        newImages.push(result.secure_url);
        changed = true;
        totalUploaded++;
      } catch (err) {
        console.error(` -> Failed to upload ${img}:`, err.message);
        newImages.push(img); // keep original on failure
      }
    }
    
    if (changed) {
      await db.collection('products').updateOne(
        { _id: product._id },
        { $set: { images: newImages } }
      );
      console.log(`Updated product ${product._id} in DB.`);
    }
  }

  console.log(`Migration complete. Successfully uploaded ${totalUploaded} images.`);
  process.exit(0);
}

run().catch(console.error);
