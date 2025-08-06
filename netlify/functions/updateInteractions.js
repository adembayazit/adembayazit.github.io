const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { updatedLikes, updatedPins } = JSON.parse(event.body);
    const response = await fetch('https://api.jsonbin.io/v3/b/YOUR_BIN_ID', {
      method: 'PUT',
      headers: {
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ likes: updatedLikes, pins: updatedPins })
    });
    return { statusCode: 200, body: JSON.stringify(await response.json()) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
