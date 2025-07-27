const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'likes.json');

exports.handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  const id = body.id;
  const db = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
  db[id] = (db[id] || 0) + 1;
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ likes: db[id] })
  };
};
