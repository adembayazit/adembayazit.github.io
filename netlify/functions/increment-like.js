const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const likesFilePath = path.resolve(__dirname, "likes.json");
  const { id } = JSON.parse(event.body);

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing ID" })
    };
  }

  try {
    const data = JSON.parse(fs.readFileSync(likesFilePath, "utf-8"));
    data[id] = (data[id] || 0) + 1;
    fs.writeFileSync(likesFilePath, JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ id, likes: data[id] })
    };
  } catch (err) {
    console.error("increment-like.js error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
