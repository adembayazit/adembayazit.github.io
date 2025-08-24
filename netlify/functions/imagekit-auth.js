const ImageKit = require("imagekit");
const crypto = require("crypto");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('=== IMAGEKIT AUTH WITH COLON FIX ===');
    
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    let privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    // 🔥 KRİTİK DÜZELTME: Private key sonuna iki nokta üst üste ekle
    if (privateKey && !privateKey.endsWith(':')) {
      privateKey = privateKey + ':';
      console.log('Added colon to private key');
    }

    console.log('Public Key:', publicKey ? publicKey.substring(0, 15) + '...' : 'MISSING');
    console.log('Private Key:', privateKey ? privateKey.substring(0, 15) + '...' : 'MISSING');
    console.log('URL Endpoint:', urlEndpoint || 'MISSING');

    // 1. YÖNTEM: ImageKit SDK ile (otomatik colon eklemeli)
    const imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey, // SDK otomatik colon eklemeli
      urlEndpoint: urlEndpoint
    });

    // 2. YÖNTEM: Manuel signature oluşturma (iki nokta ile)
    const timestamp = Math.floor(Date.now() / 1000);
    const expiry = timestamp + 3600;
    
    // 🔥 StringToSign oluştururken privateKey + expiry
    const stringToSign = privateKey + expiry;
    
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(stringToSign)
      .digest('hex');

    const authParams = {
      signature: signature,
      expire: expiry,
      token: timestamp.toString(),
      apiKey: publicKey,
      urlEndpoint: urlEndpoint
    };

    console.log('Auth params generated successfully');
    console.log('Signature starts with:', signature.substring(0, 20) + '...');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authParams)
    };

  } catch (error) {
    console.error('Error with colon fix:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Authentication Failed',
        message: error.message,
        details: 'Please check private key format with colon'
      })
    };
  }
};
