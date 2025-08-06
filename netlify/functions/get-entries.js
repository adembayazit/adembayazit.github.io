const fetch = require("node-fetch");

exports.handler = async function () {
  const BIN_ID = "68933248ae596e708fc2fbbc"; // Entries bin
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      }
    });

    const text = await res.text();

    if (!text) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: "Boş yanıt alındı." })
      };
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: "JSON parse hatası", raw: text })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // CORS problemi çözülür
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json.record)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
