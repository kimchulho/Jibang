console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("API_KEY:", process.env.API_KEY);
console.log("ALL_KEYS:", Object.keys(process.env).filter(k => k.includes('KEY')));
