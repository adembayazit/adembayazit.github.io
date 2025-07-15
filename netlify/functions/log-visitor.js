// netlify/functions/log-visitor.js
exports.handler = async (event) => {
  const clientIP = event.headers['x-nf-client-connection-ip'] || 
                  event.headers['client-ip'] || 
                  'IP alınamadı';
  
  // IPv6 adresinden IPv4 çıkarma (eğer varsa)
  const extractIPv4 = (ip) => {
    if (!ip.includes(':')) return ip;
    const ipv4Part = ip.split(':').find(part => part.includes('.'));
    return ipv4Part || 'IPv4 bulunamadı';
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: "success",
      ipv4: extractIPv4(clientIP),
      ipv6: clientIP.includes(':') ? clientIP : 'IPv6 yok',
      timestamp: new Date().toISOString(),
      browser: event.headers['user-agent']?.match(/\((.*?)\)/)?.[1] || 'Bilinmiyor',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      rawIP: clientIP
    })
  };
};
