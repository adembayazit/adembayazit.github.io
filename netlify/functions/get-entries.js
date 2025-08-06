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

    if (!res.ok) throw new Error("JSONBin'den veri alınamadı");

    const json = await res.json();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // İstersen sadece adembayazit.com yazabilirsin
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: JSON.stringify(json.record)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Hata durumunda bile CORS header verilmeli
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
