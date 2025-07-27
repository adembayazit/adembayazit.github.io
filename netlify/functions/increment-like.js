const fs = require("fs");
const path = require("path");

const likesFile = path.resolve(__dirname, "../../likes.json");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // ✅ Preflight isteği
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { id } = JSON.parse(event.body);
    const data = fs.existsSync(likesFile)
      ? JSON.parse(fs.readFileSync(likesFile, "utf8"))
      : {};

    data[id] = (data[id] || 0) + 1;

    fs.writeFileSync(likesFile, JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ likes: data[id] }),
    };
  } catch (err) {
    console.error("increment-like.js error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
