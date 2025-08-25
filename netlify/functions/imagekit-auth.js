// netlify/functions/imagekit-auth.js
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
            IMAGEKIT_PRIVATE_KEY
        } = process.env;

        if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY) {
            throw new Error("Missing ImageKit environment variables");
        }

        // Benzersiz token (nonce)
        const token = crypto.randomBytes(16).toString("hex");

        // Geçerlilik süresi (örn. 1 dakika sonrası)
        const expire = Math.floor(Date.now() / 1000) + 60;

        // Doğru signature = HMAC-SHA1(privateKey, token+expire)
        const signature = crypto
            .createHmac("sha1", IMAGEKIT_PRIVATE_KEY)
            .update(token + expire)
            .digest("hex");

        const authParams = {
            token,
            expire,
            signature,
            publicKey: IMAGEKIT_PUBLIC_KEY
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(authParams)
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Authentication failed",
                message: error.message
            })
        };
    }
};