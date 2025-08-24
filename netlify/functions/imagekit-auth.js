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

    // Manuel olarak authentication parametreleri oluştur
    const token = Math.random().toString(36).substring(2);
    const expire = Math.floor(Date.now() / 1000) + (60 * 60); // 1 saat
    const privateKeyWithColon = IMAGEKIT_PRIVATE_KEY.endsWith(':') 
      ? IMAGEKIT_PRIVATE_KEY 
      : IMAGEKIT_PRIVATE_KEY + ':';
    
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
