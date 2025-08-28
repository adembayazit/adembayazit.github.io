const fs = require("fs");
const path = require("path");

const likesFile = path.resolve(__dirname, "../../likes.json");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://adembayazit.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  // ✅ Preflight isteği
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const id = event.queryStringParameters.id;
    const data = JSON.parse(fs.readFileSync(likesFile, "utf8"));
    const likes = data[id] || 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ likes }),
    };
  } catch (err) {
    console.error("get-likes.js error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
