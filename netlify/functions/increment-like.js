const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { id } = JSON.parse(event.body || '{}');
  if (!id) return { statusCode: 400, body: "Missing ID" };

  const filePath = path.resolve(__dirname, 'likes.json');

  try {
    let likesData = {};
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath);
      likesData = JSON.parse(raw);
    }

    likesData[id] = (likesData[id] || 0) + 1;
    fs.writeFileSync(filePath, JSON.stringify(likesData, null, 2));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ likes: likesData[id] })
    };
  } catch (err) {
    console.error("increment-like.js error:", err);
    return { statusCode: 500, body: "Error updating like count" };
  }
};