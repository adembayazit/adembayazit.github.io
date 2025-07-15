exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Sadece POST isteği destekleniyor' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const ip = data.ip || 'IP bilinmiyor';
    const country = data.country || 'Ülke yok';
    const userAgent = event.headers['user-agent'] || 'Bilinmiyor';

    // Buraya log kaydı atabilirsin (veritabanı, webhook, Discord, e-posta vs.)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        status: 'success',
        receivedIP: ip,
        country,
        timestamp: new Date().toISOString(),
        browser: userAgent
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Veri çözümlenemedi', detail: err.message })
    };
  }
};
