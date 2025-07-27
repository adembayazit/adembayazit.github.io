const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const filePath = path.resolve(__dirname, 'likes.json');
  const likesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(likesData),
  };
};
