const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'likes.json');

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  const db = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ likes: db[id] || 0 })
  };
};
