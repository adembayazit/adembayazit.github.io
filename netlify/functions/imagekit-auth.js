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
    console.log('=== IMAGEKIT AUTH WITH EXPIRE FIX ===');
    
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    // 🔥 KRİTİK DÜZELTME: Expire parametresi 1 saatten AZ olmalı
    const timestamp = Math.floor(Date.now() / 1000);
    const expiry = timestamp + 1800; // 30 dakika = 1800 saniye (1 saatten az)
    
    console.log('Timestamp:', timestamp);
    console.log('Expiry (30 min):', expiry);
    console.log('Time difference (seconds):', expiry - timestamp);
    console.log('Time difference (minutes):', (expiry - timestamp) / 60);

    // 🔥 ImageKit SDK initialization
    const imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey,
      urlEndpoint: urlEndpoint
    });

    // 🔥 StringToSign oluşturma (privateKey + expiry)
    const stringToSign = privateKey + expiry;
    
    // 🔥 Signature oluşturma
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(stringToSign)
      .digest('hex');

    // 🔥 Base64 encoding with colon for Authorization
    const base64Encoded = Buffer.from(privateKey + ':').toString('base64');

    const authParams = {
      signature: signature,
      expire: expiry, // 30 dakika sonra
      token: timestamp.toString(),
      apiKey: publicKey,
      urlEndpoint: urlEndpoint,
      authorization: `Basic ${base64Encoded}`
    };

    console.log('Auth params generated successfully');
    console.log('Signature starts with:', signature.substring(0, 20) + '...');
    console.log('Expire timestamp:', expiry);
    console.log('Expire human readable:', new Date(expiry * 1000).toISOString());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(authParams)
    };

  } catch (error) {
    console.error('Error with expire fix:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Authentication Failed',
        message: error.message,
        details: 'Check expire parameter format'
      })
    };
  }
};
