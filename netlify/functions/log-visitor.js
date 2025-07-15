// Netlify Function: log-visitor.js

const fetch = require('node-fetch'); // Netlify'de fetch zaten desteklenir

exports.handler = async () => {
  try {
    // IP adresini ve konum verilerini almak için ipinfo.io kullanıyoruz
    const response = await fetch('https://ipinfo.io/json?token=68a1229187303a'); // Token isteğe bağlıdır ama rate limit olmaması için tavsiye edilir
    const ipData = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'success',
        ip: ipData.ip,
        ipv6: ipData.ip.includes(':') ? ipData.ip : 'IPv6 yok',
        city: ipData.city,
        region: ipData.region,
        country: ipData.country,
        loc: ipData.loc, // "latitude,longitude"
        timezone: ipData.timezone,
        org: ipData.org, // internet servis sağlayıcısı
        browser: '', // kullanıcı tarayıcı bilgisi istersen ayrıca bakarız
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'IP verisi alınamadı', message: error.message })
    };
  }
};
