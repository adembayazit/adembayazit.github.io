const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "likes.json");

exports.handler = async function (event) {
  let body;

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const entryId = body.id;

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

  likesData[entryId] = (likesData[entryId] || 0) + 1;

  try {
    fs.writeFileSync(filePath, JSON.stringify(likesData, null, 2));
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "File write error" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ likes: likesData[entryId] }),
  };
};
