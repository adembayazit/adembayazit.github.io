const Mailjet = require('node-mailjet');

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const { emailData } = JSON.parse(event.body);

    // Validate required fields
    if (!emailData || !emailData.Messages || !emailData.Messages[0]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email data' })
      };
    }

    // Initialize Mailjet with environment variables
    const mailjet = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_SECRET_KEY
    });

    // Send email via Mailjet
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request(emailData);

    console.log('Email sent successfully:', result.body);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Email sent successfully',
        result: result.body 
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);

    // Handle specific Mailjet errors
    let errorMessage = 'Failed to send email';
    if (error.statusCode === 401) {
      errorMessage = 'Mailjet authentication failed - check API keys';
    } else if (error.statusCode === 400) {
      errorMessage = 'Invalid email data provided';
    } else if (error.response && error.response.body) {
      errorMessage = error.response.body.ErrorMessage || errorMessage;
    }

    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      })
    };
  }
};