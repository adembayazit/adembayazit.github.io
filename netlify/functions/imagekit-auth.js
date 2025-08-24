// .netlify/functions/imagekit-auth/imagekit-auth.js
const ImageKit = require("imagekit");

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
            hasEndpoint: !!IMAGEKIT_URL_ENDPOINT
        });

        if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
            throw new Error('Missing ImageKit environment variables');
        }

        const imagekit = new ImageKit({
            publicKey: IMAGEKIT_PUBLIC_KEY,
            privateKey: IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: IMAGEKIT_URL_ENDPOINT
        });

        const authParams = imagekit.getAuthenticationParameters();
        
        // ÖNEMLİ: publicKey'i response'a ekle
        authParams.publicKey = IMAGEKIT_PUBLIC_KEY;

        console.log('Generated Auth Parameters:', {
            token: authParams.token,
            expire: authParams.expire,
            signature: authParams.signature,
            publicKey: authParams.publicKey
        });

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
                message: error.message
            })
        };
    }
};
