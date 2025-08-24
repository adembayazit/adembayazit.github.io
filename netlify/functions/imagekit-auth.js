const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
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
    console.log('=== IMAGEKIT AUTH DEBUG START ===');
    
    // Environment variables kontrolü
    const envVars = {
      IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
      IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
      IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT
    };

    console.log('Environment variables:', {
      PUBLIC_KEY_EXISTS: !!envVars.IMAGEKIT_PUBLIC_KEY,
      PRIVATE_KEY_EXISTS: !!envVars.IMAGEKIT_PRIVATE_KEY,
      URL_ENDPOINT_EXISTS: !!envVars.IMAGEKIT_URL_ENDPOINT,
      PUBLIC_KEY_LENGTH: envVars.IMAGEKIT_PUBLIC_KEY ? envVars.IMAGEKIT_PUBLIC_KEY.length : 0,
      PRIVATE_KEY_LENGTH: envVars.IMAGEKIT_PRIVATE_KEY ? envVars.IMAGEKIT_PRIVATE_KEY.length : 0
    });

    // Eksik environment variables kontrolü
    if (!envVars.IMAGEKIT_PUBLIC_KEY || !envVars.IMAGEKIT_PRIVATE_KEY || !envVars.IMAGEKIT_URL_ENDPOINT) {
      const errorMessage = 'Missing ImageKit environment variables';
      console.error(errorMessage, envVars);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuration Error',
          message: errorMessage,
          details: 'Please check your Netlify environment variables'
        })
      };
    }

    // Anahtar formatlarını kontrol et
    console.log('Key formats:', {
      PUBLIC_STARTS_WITH: envVars.IMAGEKIT_PUBLIC_KEY.substring(0, 7),
      PRIVATE_STARTS_WITH: envVars.IMAGEKIT_PRIVATE_KEY.substring(0, 8),
      URL_ENDPOINT: envVars.IMAGEKIT_URL_ENDPOINT
    });

    // ImageKit initialization
    try {
      const imagekit = new ImageKit({
        publicKey: envVars.IMAGEKIT_PUBLIC_KEY,
        privateKey: envVars.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: envVars.IMAGEKIT_URL_ENDPOINT
      });

      console.log('ImageKit initialized successfully');

      // Authentication parameters
      const authenticationParameters = imagekit.getAuthenticationParameters();
      
      console.log('Auth parameters generated successfully');
      console.log('Token length:', authenticationParameters.token ? authenticationParameters.token.length : 'null');
      console.log('Expire:', authenticationParameters.expire);
      console.log('Signature length:', authenticationParameters.signature ? authenticationParameters.signature.length : 'null');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(authenticationParameters)
      };

    } catch (initError) {
      console.error('ImageKit initialization error:', {
        message: initError.message,
        stack: initError.stack,
        name: initError.name
      });

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Initialization Failed',
          message: initError.message,
          details: 'Check your ImageKit credentials format'
        })
      };
    }

  } catch (error) {
    console.error('Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error.message
      })
    };
  }
};
