const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400'
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
    // Doğrudan anahtarları burada tanımlayın (test için)
    const IMAGEKIT_PUBLIC_KEY = "public_EMs+xIzB1E/RR1lTEYSeBEntBLU=";
    const IMAGEKIT_PRIVATE_KEY = "private_Nw0S************************";
    const IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/adembayazit";

    // Anahtarların boş olup olmadığını kontrol edin
    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Authentication failed',
          message: 'ImageKit keys are not set. Please replace the placeholder values with your actual keys.'
        })
      };
    }

    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    console.log('Auth parameters generated successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authenticationParameters)
    };
  } catch (error) {
    console.error('ImageKit auth error:', error);
    
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
