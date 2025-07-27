const fs = require("fs");
const path = require("path");

const likesFilePath = path.resolve(__dirname, "likes.json");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Yalnızca POST istekleri kabul edilir." })
    };
  }

  const { id } = JSON.parse(event.body);

  let likes = {};
  if (fs.existsSync(likesFilePath)) {
    likes = JSON.parse(fs.readFileSync(likesFilePath));
  }

  likes[id] = (likes[id] || 0) + 1;

  fs.writeFileSync(likesFilePath, JSON.stringify(likes));

  return {
    statusCode: 200,
    body: JSON.stringify({ likes: likes[id] })
  };
};
