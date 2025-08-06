const fetch = require("node-fetch");

exports.handler = async () => {
  const BIN_ID = "68933248ae596e708fc2fbbc";
  const API_KEY = process.env.JSONBIN_MASTER_KEY;

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY,
        "X-Bin-Meta": "false",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data.record || [])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Entry fetch failed" })
    };
  }
};
