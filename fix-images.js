const mongoose = require('mongoose');
const fs = require('fs');

async function fix() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let uri = '';
  for (const line of envFile.split('\n')) {
    if (line.startsWith('MONGODB_URI=')) {
      uri = line.substring(line.indexOf('=') + 1).trim();
      if (uri.startsWith('"') && uri.endsWith('"')) {
        uri = uri.slice(1, -1);
      }
      break;
    }
  }

  if (!uri) {
    console.log("No MONGODB_URI found");
    process.exit(1);
  }
  
  await mongoose.connect(uri);
  console.log("Connected to DB");

  // Fix Facial Oil by using its second working image
  await mongoose.connection.collection('products').updateOne(
    { slug: 'botanical-hydrating-facial-oil' },
    { $set: { images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"] } }
  );
  console.log("Fixed Facial Oil");

  // Fix Cutting Board using a known working kitchen image
  await mongoose.connection.collection('products').updateOne(
    { slug: 'walnut-end-grain-cutting-board' },
    { $set: { images: ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"] } }
  );
  console.log("Fixed Cutting Board");

  process.exit(0);
}
fix();
