const fetch = require("node-fetch");

exports.handler = async function () {
  const BIN_ID = "68933248ae596e708fc2fbbc";
  const API_KEY = process.env.JSONBIN_MASTER_KEY;

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'JSONBin fetch failed' })
      };
    }

    const json = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(json.record) // sadece "record" kısmını al
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
