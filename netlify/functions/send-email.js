const Mailjet = require('node-mailjet');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { emailData, apiKey, secretKey } = JSON.parse(event.body);
        
        const mailjet = Mailjet.apiConnect(apiKey, secretKey);
        
        const result = await mailjet
            .post('send', { version: 'v3.1' })
            .request(emailData);
            
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, result: result.body })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
