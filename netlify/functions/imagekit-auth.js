const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing ImageKit environment variables' })
      };
    }

    // Base64 decode private key
    const privateKeyDecoded = Buffer.from(IMAGEKIT_PRIVATE_KEY, 'base64').toString('utf-8');

    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: privateKeyDecoded,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT
    });

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
      body: JSON.stringify({ error: 'Authentication failed', message: error.message })
    };
  }
};