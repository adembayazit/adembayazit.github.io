const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;
  const dbPath = path.join(__dirname, "likes.json");

  let db = {};
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath));
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ likes: db[id] || 0 })
  };
};
