const fetch = require("node-fetch");

exports.handler = async function (event) {
  const BIN_ID = "68862fd97b4b8670d8a81945";
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
  const ALLOWED_ORIGIN = "https://adembayazit.com";

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
  };

  // Preflight request handling
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Origin validation
  const requestOrigin = event.headers.origin || event.headers.Origin;
  if (requestOrigin !== ALLOWED_ORIGIN) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Origin not allowed' })
    };
  }

  // Main PUT request handling
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { likes, pins } = JSON.parse(event.body);

    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        'X-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ likes, pins })
    });

    if (!res.ok) throw new Error("Interaction güncellenemedi");

    const json = await res.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(json)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};