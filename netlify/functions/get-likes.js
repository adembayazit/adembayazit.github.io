const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  const likesFilePath = path.resolve(__dirname, "likes.json");

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing ID" })
    };
  }

  try {
    const data = JSON.parse(fs.readFileSync(likesFilePath, "utf-8"));
    const likes = data[id] || 0;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ id, likes })
    };
  } catch (err) {
    console.error("get-likes.js error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
