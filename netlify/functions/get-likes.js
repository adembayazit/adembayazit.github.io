exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  // Preflight isteği
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const id = event.queryStringParameters.id;
    
    // JSONBin.io'dan veriyi çek
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest`, {
      headers: {
        'X-Master-Key': process.env.JSONBIN_API_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      }
    });

    if (!response.ok) throw new Error('JSONBin API error');

    const data = await response.json();
    const likes = data.likes?.[id] || 0; // JSONBin.io'daki likes objesinden al

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ likes }),
    };
  } catch (err) {
    console.error("get-likes.js error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal Server Error",
        message: err.message 
      }),
    };
  }
};
