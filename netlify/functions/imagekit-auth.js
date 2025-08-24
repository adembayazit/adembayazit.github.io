const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
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
      throw new Error('ImageKit environment variables are not set');
    }

    // Private key format kontrolü
    if (!IMAGEKIT_PRIVATE_KEY.startsWith('private_')) {
      throw new Error('Invalid private key format. Should start with "private_"');
    }

    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT
    });
     const privateKeyWithColon = `${process.env.IMAGEKIT_PRIVATE_KEY}:`;
     const encodedPrivateKey = Buffer.from(privateKeyWithColon).toString('base64');
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
