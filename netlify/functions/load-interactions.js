const fetch = require("node-fetch");

exports.handler = async function () {
  const BIN_ID = "68862fd97b4b8670d8a81945"; // İstersen env ile taşı: process.env.JSONBIN_BIN_ID
  const API_KEY = process.env.JSONBIN_API_KEY;

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
        'X-Bin-Meta': 'false',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch from JSONBin' })
      };
    }

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result.record)
    };
  } catch (error) {
    console.error("load-interactions error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: error.message })
    };
  }
};
