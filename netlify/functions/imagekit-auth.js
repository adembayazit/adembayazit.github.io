const ImageKit = require("imagekit");
const crypto = require("crypto");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const {
      IMAGEKIT_PUBLIC_KEY,
      IMAGEKIT_PRIVATE_KEY,
      IMAGEKIT_URL_ENDPOINT
    } = process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      throw new Error('Missing ImageKit environment variables');
    }

    // The fix: Add colon to private key before base64 encoding
    const privateKeyWithColon = `${IMAGEKIT_PRIVATE_KEY}:`;
    
    // Manuel authentication parametreleri oluştur
    const token = crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 3600; // 1 saat
    const signature = crypto
      .createHmac('sha1', privateKeyWithColon)
      .update(token + expire)
      .digest('hex');

    const authenticationParameters = {
      token: token,
      expire: expire,
      signature: signature
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authenticationParameters)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Authentication failed',
        message: error.message
      })
    };
  }
};
