const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const response = await fetch('https://api.jsonbin.io/v3/b/YOUR_BIN_ID/latest', {
      headers: {
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
        'Content-Type': 'application/json'
      }
    });
    return { statusCode: 200, body: JSON.stringify(await response.json()) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
