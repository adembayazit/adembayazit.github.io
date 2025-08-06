console.log("MASTER_KEY:", MASTER_KEY ? "Var" : "Yok veya boş");

const fetch = require("node-fetch");

exports.handler = async function () {
  const BIN_ID = "68933248ae596e708fc2fbbc";
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
        "Access-Control-Allow-Origin": "*",          // <--- CORS için
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(json.record)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",          // <--- Hata durumunda da ekle
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
