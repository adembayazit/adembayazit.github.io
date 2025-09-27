const Mailjet = require('node-mailjet');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://adembayazit.com',
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
    console.log('Received email request');
    
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log('Parsed request body');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    const { emailData } = requestBody;
    
    // Validate required fields
    if (!emailData) {
      console.error('Missing emailData');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing emailData parameter' })
      };
    }

    // Use environment variables for Mailjet credentials
    const apiKey = process.env.MAILJET_API_KEY;
    const secretKey = process.env.MAILJET_SECRET_KEY;

    console.log('Mailjet API Key present:', !!apiKey);
    console.log('Mailjet Secret Key present:', !!secretKey);

    if (!apiKey || !secretKey) {
      console.error('Mailjet credentials missing from environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service configuration error - check environment variables' })
      };
    }

    console.log('Connecting to Mailjet');
    const mailjet = Mailjet.apiConnect(apiKey, secretKey);
    
    console.log('Sending email to:', emailData.Messages[0].To.length, 'recipients');
    
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request(emailData);
    
    console.log('Email sent successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Email sent successfully to ${emailData.Messages[0].To.length} recipients`,
        result: result.body 
      })
    };
  } catch (error) {
    console.error('Email sending error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
