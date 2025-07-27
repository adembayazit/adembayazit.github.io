const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { id } = JSON.parse(event.body);
    const filePath = path.resolve(__dirname, "likes.json");

    let data = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    data[id] = (data[id] || 0) + 1;

    fs.writeFileSync(filePath, JSON.stringify(data));

    return {
      statusCode: 200,
      body: JSON.stringify({ id, likes: data[id] }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (error) {
    console.error("increment-like error:", error);
    return { statusCode: 500, body: "Server Error" };
  }
};
