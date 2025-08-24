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
    console.log('=== IMAGEKIT AUTH WITH BASE64 COLON FIX ===');
    
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY; // Sonunda : OLMADAN
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    console.log('Public Key:', publicKey ? publicKey.substring(0, 15) + '...' : 'MISSING');
    console.log('Private Key:', privateKey ? privateKey.substring(0, 15) + '...' : 'MISSING');
    console.log('URL Endpoint:', urlEndpoint || 'MISSING');

    // 🔥 KRİTİK: Base64 encoding için privateKey + ":" kullan
    const privateKeyWithColon = privateKey + ":";
    const base64Encoded = Buffer.from(privateKeyWithColon).toString('base64');
    
    console.log('Base64 encoded with colon:', base64Encoded.substring(0, 20) + '...');

    // 1. YÖNTEM: Manuel signature oluşturma (ImageKit formatına göre)
    const timestamp = Math.floor(Date.now() / 1000);
    const expiry = timestamp + 3600;
    
    // 🔥 StringToSign: privateKey + expiry (COLON OLMADAN)
    const stringToSign = privateKey + expiry;
    
    const signature = crypto
      .createHmac('sha1', privateKey) // COLON OLMADAN
      .update(stringToSign)
      .digest('hex');

    // 2. YÖNTEM: ImageKit SDK ile (güncellenmiş)
    const imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey, // COLON OLMADAN - SDK içinde handle edilmeli
      urlEndpoint: urlEndpoint
    });

    const authParams = {
      signature: signature,
      expire: expiry,
      token: timestamp.toString(),
      apiKey: publicKey,
      urlEndpoint: urlEndpoint,
      // Authorization header için base64 encoded değer
      authorization: `Basic ${base64Encoded}`
    };

    console.log('Auth params generated with proper base64 encoding');
    console.log('Signature:', signature.substring(0, 20) + '...');
    console.log('Expire:', expiry);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authParams)
    };

  } catch (error) {
    console.error('Error with base64 colon fix:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Authentication Failed',
        message: error.message,
        details: 'Check base64 encoding with colon format'
      })
    };
  }
};
