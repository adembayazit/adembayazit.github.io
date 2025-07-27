const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const id = event.queryStringParameters.id;
    const filePath = path.resolve(__dirname, "likes.json");
    const file = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(file);
    const likes = data[id] || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ id, likes }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (error) {
    console.error("get-likes error:", error);
    return { statusCode: 500, body: "Server Error" };
  }
};
