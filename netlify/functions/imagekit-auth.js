const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { 
      IMAGEKIT_PUBLIC_KEY, 
      IMAGEKIT_PRIVATE_KEY, 
      IMAGEKIT_URL_ENDPOINT 
    } = process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit environment variables are not properly configured');
    }

    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authenticationParameters)
    };
  } catch (error) {
    console.error('ImageKit Auth Error:', error);
    
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
