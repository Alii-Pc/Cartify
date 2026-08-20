const https = require('https');

function searchUnsplash(query) {
  return new Promise((resolve) => {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = json.results.map(r => ({
            id: r.id,
            desc: r.alt_description || r.description,
            url: r.urls.raw + '&auto=format&fit=crop&w=800&q=80'
          }));
          resolve(results);
        } catch (e) {
          resolve({ error: e.message, data: data.slice(0, 100) });
        }
      });
    }).on('error', e => resolve({ error: e.message }));
  });
}

async function run() {
  const tests = [
    "bamboo bath towel",
    "french press coffee maker",
    "reusable silicone food bag",
    "travel neck pillow",
    "digital bathroom scale",
    "table lamp",
    "lip balm cosmetic"
  ];
  for (const t of tests) {
    const res = await searchUnsplash(t);
    console.log(`\nQuery: ${t}`);
    console.log(res);
  }
}

run();
