const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "likes.json");

exports.handler = async function (event) {
  const entryId = event.queryStringParameters.id;

  if (!entryId) {
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
      body: JSON.stringify({ error: "File read error" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ likes: likesData[entryId] || 0 }),
  };
};
