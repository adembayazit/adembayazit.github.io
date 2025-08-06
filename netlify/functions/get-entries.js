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

    if (!res.ok) {
      throw new Error(`JSONBin'den veri alınamadı. Status: ${res.status}`);
    }

    const json = await res.json();

    // Eğer json.record yoksa hata dön
    if (!json || !json.record) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Veri boş veya geçersiz." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(json.record)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
