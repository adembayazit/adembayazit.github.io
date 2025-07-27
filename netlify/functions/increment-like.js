const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  // ✅ CORS preflight için
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // ❌ GET isteği kabul edilmez
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST',
        'Access-Control-Allow-Origin': '*',
      },
      body: 'Method Not Allowed',
    };
  }

  try {
    const filePath = path.resolve(__dirname, 'likes.json');
    const likesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const { entryId } = JSON.parse(event.body);

    if (!entryId) {
      throw new Error('Missing entryId');
    }

    likesData[entryId] = (likesData[entryId] || 0) + 1;

    fs.writeFileSync(filePath, JSON.stringify(likesData, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, likes: likesData[entryId] }),
    };
  } catch (err) {
    console.error("increment-like error:", err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
