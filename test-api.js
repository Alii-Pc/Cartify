const test = async () => {
  const start = Date.now();
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
  console.log("Status:", res.status, "Time:", Date.now() - start, "ms");
  const text = await res.text();
  console.log("Response:", text);
};
test();
