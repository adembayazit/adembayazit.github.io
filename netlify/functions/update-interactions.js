const fetch = require("node-fetch");

exports.handler = async function (event) {
  const BIN_ID = "68862fd97b4b8670d8a81945";
  const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: "Only PUT allowed"
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
      body: JSON.stringify(json)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
