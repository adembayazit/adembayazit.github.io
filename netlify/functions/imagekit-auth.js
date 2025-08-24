// .netlify/functions/imagekit-auth/imagekit-auth.js
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
        const { 
            IMAGEKIT_PUBLIC_KEY, 
            IMAGEKIT_PRIVATE_KEY, 
            IMAGEKIT_URL_ENDPOINT 
        } = process.env;

        console.log('Environment Variables Check:', {
            hasPublicKey: !!IMAGEKIT_PUBLIC_KEY,
            hasPrivateKey: !!IMAGEKIT_PRIVATE_KEY,
            hasEndpoint: !!IMAGEKIT_URL_ENDPOINT,
            privateKeyStart: IMAGEKIT_PRIVATE_KEY ? IMAGEKIT_PRIVATE_KEY.substring(0, 10) + '...' : 'MISSING'
        });

        if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
            throw new Error('Missing ImageKit environment variables');
        }

        // MANUEL SIGNATURE OLUŞTURMA
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = crypto.randomBytes(16).toString('hex');
        const data = timestamp + nonce;

        console.log('Signature Generation Details:', {
            timestamp: timestamp,
            nonce: nonce,
            data: data,
            privateKey: IMAGEKIT_PRIVATE_KEY.substring(0, 10) + '...' // Güvenlik için sadece ilk 10 karakter
        });

        // HMAC-SHA1 signature oluştur
        const signature = crypto
            .createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
            .update(data)
            .digest('hex');

        console.log('Generated Signature:', {
            signature: signature,
            signatureLength: signature.length,
            signatureType: typeof signature
        });

        const authParams = {
            token: nonce, // nonce'u token olarak kullan
            expire: timestamp + 3300, // 55 dakika
            signature: signature,
            publicKey: IMAGEKIT_PUBLIC_KEY
        };

        console.log('Final Auth Parameters:', authParams);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(authParams)
        };

    } catch (error) {
        console.error('Error in ImageKit function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Authentication failed',
                message: error.message,
                details: 'Check private key and signature generation'
            })
        };
    }
};
