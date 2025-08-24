// .netlify/functions/imagekit-auth/imagekit-auth.js
const ImageKit = require("imagekit");

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        const { 
            IMAGEKIT_PUBLIC_KEY, 
            IMAGEKIT_PRIVATE_KEY, 
            IMAGEKIT_URL_ENDPOINT 
        } = process.env;

        // Environment variable kontrolü
        if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
            throw new Error('Missing ImageKit environment variables');
        }

        // Private key'e ":" eklenmesi GEREKMİYOR - ImageKit SDK bunu otomatik yapar
        const imagekit = new ImageKit({
            publicKey: IMAGEKIT_PUBLIC_KEY,
            privateKey: IMAGEKIT_PRIVATE_KEY, // Doğrudan private key kullanılır
            urlEndpoint: IMAGEKIT_URL_ENDPOINT
        });

        // Authentication parametrelerini al
        const authenticationParameters = imagekit.getAuthenticationParameters();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(authenticationParameters)
        };
    } catch (error) {
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
