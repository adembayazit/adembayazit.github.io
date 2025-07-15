// netlify/functions/log-visitor.js
exports.handler = async (event) => {
  const ip = event.headers['x-nf-client-connection-ip'] || 'IP alınamadı';
  const userAgent = event.headers['user-agent'] || 'Tarayıcı bilgisi yok';
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: "success",
      ipv4: ip.includes(':') ? ip.split(':')[0] : ip, // IPv6 gelirse ilk kısmı al
      timestamp: new Date().toISOString(),
      browser: userAgent.split('(')[1].split(')')[0] || userAgent,
      fullInfo: {
        ip: ip,
        userAgent: userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  };
};
