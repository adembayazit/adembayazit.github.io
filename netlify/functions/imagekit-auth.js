const crypto = require('crypto');

exports.handler = async (event) => {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    // 1. Expire parametresi (30 dakika)
    const timestamp = Math.floor(Date.now() / 1000);
    const expiry = timestamp + 1800;

    // 2. Signature oluşturma (ImageKit formatı)
    const stringToSign = privateKey + expiry;
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(stringToSign)
      .digest('hex');

    // 3. Basic auth için base64 encoding
    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        signature,
        expire: expiry,
        token: timestamp,
        apiKey: publicKey,
        urlEndpoint: urlEndpoint,
        authorization: authHeader
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
