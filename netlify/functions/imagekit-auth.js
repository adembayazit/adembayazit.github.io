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

    // DEBUG: Anahtar formatlarını kontrol et (ilk birkaç karakter)
    console.log('Public key starts with:', IMAGEKIT_PUBLIC_KEY.substring(0, 10));
    console.log('Private key starts with:', IMAGEKIT_PRIVATE_KEY.substring(0, 10));
    console.log('URL Endpoint:', IMAGEKIT_URL_ENDPOINT);

    // ImageKit initialization - support önerilerine göre
    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT
    });

    // Alternative authentication method deneyelim
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = imagekit.getAuthenticationParameters(timestamp);
    
    const authenticationParameters = {
      token: signature.token,
      expire: signature.expire,
      signature: signature.signature
    };

    console.log('Auth parameters generated successfully:', {
      token: authenticationParameters.token.substring(0, 20) + '...',
      expire: authenticationParameters.expire,
      signature: authenticationParameters.signature.substring(0, 20) + '...'
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authenticationParameters)
    };
  } catch (error) {
    console.error('ImageKit auth error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Authentication failed',
        message: 'Please check your ImageKit credentials',
        details: 'Ensure your keys are correct and account is active'
      })
    };
  }
};
