const fetch = require("node-fetch");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const BIN_ID = "68862fd97b4b8670d8a81945";
  const API_KEY = process.env.JSONBIN_API_KEY;

  try {
    const { entryId, newLikeCount, newPinCount } = JSON.parse(event.body);

    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
        'X-Bin-Meta': 'false',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current data');
    }

    const result = await response.json();
    const data = result;

    if (!data.likes) data.likes = {};
    if (!data.pins) data.pins = {};

    if (newLikeCount !== null) {
      data.likes[entryId] = newLikeCount;
    }

    if (newPinCount !== null) {
      data.pins[entryId] = newPinCount;
    }

    const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!putResponse.ok) {
      throw new Error('Failed to update JSONBin');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Update successful" }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
