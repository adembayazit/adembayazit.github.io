const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const { id } = JSON.parse(event.body);
  const dbPath = path.join(__dirname, "likes.json");

  let db = {};
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath));
  }

  db[id] = (db[id] || 0) + 1;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ likes: db[id] })
  };
};
