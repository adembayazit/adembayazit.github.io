const Mailjet = require('node-mailjet');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { emailData, apiKey, secretKey } = JSON.parse(event.body);
        
        // Initialize Mailjet
        const mailjet = Mailjet.apiConnect(apiKey, secretKey);
        
        // Send email
        const result = await mailjet
            .post('send', { version: 'v3.1' })
            .request(emailData);
            
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Email sent successfully',
                result: result.body
            })
        };
    } catch (error) {
        console.error('Mailjet error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                error: 'Failed to send email',
                details: error.message
            })
        };
    }
};
