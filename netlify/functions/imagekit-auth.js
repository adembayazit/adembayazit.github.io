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
            hasEndpoint: !!IMAGEKIT_URL_ENDPOINT,
            privateKeyStart: IMAGEKIT_PRIVATE_KEY ? IMAGEKIT_PRIVATE_KEY.substring(0, 10) + '...' : 'MISSING'
        });

        if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
            throw new Error('Missing ImageKit environment variables');
        }

        // ÖNEMLİ: Private key'e iki nokta üst üste ekleyip base64 encode et
        const privateKeyWithColon = `${IMAGEKIT_PRIVATE_KEY}:`;
        const encodedPrivateKey = Buffer.from(privateKeyWithColon).toString('base64');
        
        console.log('Encoding details:', {
            originalPrivateKey: IMAGEKIT_PRIVATE_KEY,
            withColon: privateKeyWithColon,
            encoded: encodedPrivateKey
        });

        // ImageKit instance'ını doğru şekilde oluştur
        const imagekit = new ImageKit({
            publicKey: IMAGEKIT_PUBLIC_KEY,
            privateKey: encodedPrivateKey, // ENCODE EDİLMİŞ private key
            urlEndpoint: IMAGEKIT_URL_ENDPOINT
        });

        const authParams = imagekit.getAuthenticationParameters();
        authParams.publicKey = IMAGEKIT_PUBLIC_KEY;

        console.log('Authentication parameters generated successfully');

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
                details: 'Check private key encoding with colon suffix'
            })
        };
    }
};
