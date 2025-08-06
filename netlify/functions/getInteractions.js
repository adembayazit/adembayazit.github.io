const fetch = require('node-fetch');

exports.handler = async () => {
  try {
    const response = await fetch('https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest', {
      headers: {
        'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      }
    });
    
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Veri alınamadı" }) };
  }
};
