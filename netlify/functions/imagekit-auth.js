const ImageKit = require("imagekit");

// The fix: Add colon to private key before base64 encoding
const privateKeyWithColon = `${process.env.IMAGEKIT_PRIVATE_KEY}:`;
const encodedPrivateKey = Buffer.from(privateKeyWithColon).toString('base64');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

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

    // Get authentication parameters
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
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
