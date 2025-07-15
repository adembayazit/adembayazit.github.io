// netlify/functions/log-visitor.js
exports.handler = async (event) => {
  const rawIP = event.headers['x-nf-client-connection-ip'] || 
               event.headers['client-ip'] || 
               'IP alınamadı';

  // IPv6'dan IPv4 çıkarma (örnek: "::ffff:1.2.3.4" durumu için)
  const extractIPv4 = (ip) => {
    if (ip.includes('.')) return ip; // Zaten IPv4
    const ipv4Match = ip.match(/(\d+\.\d+\.\d+\.\d+)$/);
    return ipv4Match ? ipv4Match[0] : 'IPv4 bulunamadı';
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: "success",
      ipv4: extractIPv4(rawIP),
      ipv6: rawIP.includes(':') ? rawIP : 'IPv6 yok',
      timestamp: new Date().toISOString(),
      browser: event.headers['user-agent']?.match(/\((.*?)\)/)?.[1] || 'Bilinmiyor',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      rawIP: rawIP
    })
  };
};
