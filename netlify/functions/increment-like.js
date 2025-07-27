const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "likes.json");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { id } = JSON.parse(event.body || '{}');

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing entry ID" }),
    };
  }

  let likesData = {};
  try {
    if (fs.existsSync(filePath)) {
      likesData = JSON.parse(fs.readFileSync(filePath));
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Read error" }),
    };
  }

  likesData[id] = (likesData[id] || 0) + 1;

  try {
    fs.writeFileSync(filePath, JSON.stringify(likesData, null, 2));
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Write error" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ likes: likesData[id] }),
  };
};
