// netlify/functions/jsonbin-proxy.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { path, method, body } = JSON.parse(event.body);
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
  
  try {
    const response = await fetch(`https://api.jsonbin.io/v3${path}`, {
      method,
      headers: {
        'X-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
