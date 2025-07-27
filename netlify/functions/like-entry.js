const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "likes.json");

exports.handler = async function (event) {
  const entryId = event.httpMethod === "POST"
    ? JSON.parse(event.body)?.id
    : event.queryStringParameters?.id;

  if (!entryId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing entry ID" }) };
  }

  let db = {};
  if (fs.existsSync(filePath)) {
    db = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ likes: db[entryId] || 0 })
    };
  }

  if (event.httpMethod === "POST") {
    db[entryId] = (db[entryId] || 0) + 1;
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ likes: db[entryId] })
    };
  }

  return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
};
