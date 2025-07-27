const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const id = event.queryStringParameters.id;
  const filePath = path.resolve(__dirname, 'likes.json');

  try {
    let likesData = {};
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath);
      likesData = JSON.parse(raw);
    }

    const likeCount = likesData[id] || 0;

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ likes: likeCount })
    };
  } catch (err) {
    console.error("get-likes.js error:", err);
    return { statusCode: 500, body: "Error reading like count" };
  }
};