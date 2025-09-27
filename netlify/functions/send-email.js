const Mailjet = require('node-mailjet');

exports.handler = async (event, context) => {
    console.log('Fonksiyon çağrıldı. HTTP Method:', event.httpMethod);
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        console.log('OPTIONS preflight işleniyor');
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        console.log('Method not allowed:', event.httpMethod);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                error: 'Method Not Allowed',
                received: event.httpMethod,
                expected: 'POST'
            })
        };
    }

    try {
        console.log('POST request işleniyor');
        console.log('Request body:', event.body);

        if (!event.body) {
            throw new Error('Request body is empty');
        }

        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
            console.log('Request body parsed successfully');
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid JSON in request body',
                    details: parseError.message
                })
            };
        }
        
        const { emailData } = requestBody;
        
        console.log('emailData:', emailData);

        // Validate required fields
        if (!emailData) {
            console.error('Missing emailData');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing emailData parameter',
                    received: requestBody
                })
            };
        }

        // Use environment variables for Mailjet credentials
        const apiKey = process.env.MAILJET_API_KEY;
        const secretKey = process.env.MAILJET_SECRET_KEY;

        console.log('Environment variables - API Key exists:', !!apiKey);
        console.log('Environment variables - Secret Key exists:', !!secretKey);

        if (!apiKey || !secretKey) {
            console.error('Mailjet credentials missing');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Email service configuration error',
                    details: 'MAILJET_API_KEY or MAILJET_SECRET_KEY environment variables are not set'
                })
            };
        }

        console.log('Mailjet bağlantısı kuruluyor...');
        const mailjet = Mailjet.apiConnect(apiKey, secretKey);
        
        console.log('E-posta gönderiliyor...');
        console.log('Alıcı sayısı:', emailData.Messages[0].To.length);
        console.log('Konu:', emailData.Messages[0].Subject);
        
        const result = await mailjet
            .post('send', { version: 'v3.1' })
            .request(emailData);
        
        console.log('E-posta başarıyla gönderildi');
        console.log('Mailjet response:', JSON.stringify(result.body, null, 2));
        
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: `E-posta başarıyla ${emailData.Messages[0].To.length} alıcıya gönderildi`,
                result: result.body 
            })
        };
    } catch (error) {
        console.error('E-posta gönderim hatası:', error);
        
        // Mailjet specific error handling
        if (error.statusCode) {
            console.error('Mailjet status code:', error.statusCode);
        }
        if (error.response) {
            console.error('Mailjet response:', error.response);
        }
        
        return {
            statusCode: 500,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'E-posta gönderilemedi',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
