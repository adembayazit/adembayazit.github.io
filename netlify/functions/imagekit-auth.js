const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
  // CORS headers - daha kapsamlı
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
    console.log('Environment variables check:');
    console.log('PUBLIC_KEY exists:', !!process.env.IMAGEKIT_PUBLIC_KEY);
    console.log('PRIVATE_KEY exists:', !!process.env.IMAGEKIT_PRIVATE_KEY);
    console.log('URL_ENDPOINT exists:', !!process.env.IMAGEKIT_URL_ENDPOINT);

    const { 
      IMAGEKIT_PUBLIC_KEY, 
      IMAGEKIT_PRIVATE_KEY, 
      IMAGEKIT_URL_ENDPOINT 
    } = process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      console.error('Missing ImageKit environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Authentication failed',
          message: 'ImageKit environment variables are not set'
        })
      };
    }

    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY
      privateKey: IMAGEKIT_PRIVATE_KEY
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
        message: error.message,
        details: 'Check console for more information'
      })
    };
  }
};
