const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "likes.json");

exports.handler = async function (event) {
  const entryId = event.httpMethod === "POST"
    ? JSON.parse(event.body)?.id
    : event.queryStringParameters?.id;

  if (!entryId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing entry ID" }),
    };
  }

  let likesData = {};
  if (fs.existsSync(filePath)) {
    likesData = JSON.parse(fs.readFileSync(filePath));
  }

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ likes: likesData[entryId] || 0 }),
    };
  }

  if (event.httpMethod === "POST") {
    likesData[entryId] = (likesData[entryId] || 0) + 1;
    fs.writeFileSync(filePath, JSON.stringify(likesData, null, 2));
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ likes: likesData[entryId] }),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: "Method Not Allowed" }),
  };
};
