const fetch = require("node-fetch");

exports.handler = async function () {
  const BIN_ID = "68862fd97b4b8670d8a81945"; // Likes & Pins bin
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      }
    });

    if (!res.ok) throw new Error("JSONBin'den interaction verisi alınamadı");

    const json = await res.json();
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
