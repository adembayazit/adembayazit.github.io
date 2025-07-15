exports.handler = async (event) => {
  const headers = event.headers;

  // Tüm olası IP başlıklarını kontrol et
  const possibleIPs = [
    headers['x-nf-client-connection-ip'],
    headers['client-ip'],
    headers['x-forwarded-for'],
    headers['x-real-ip'],
    headers['cf-connecting-ip'], // Cloudflare kullanılıyorsa
    event.requestContext?.identity?.sourceIp, // fallback AWS Gateway (bazı Netlify env'lerinde olur)
  ];

  // İlk bulunan geçerli IP'yi al
  const rawIP = possibleIPs.find(ip => ip && ip.trim()) || 'IP alınamadı';

  // IPv4'ü çıkarmak için fonksiyon
  const extractIPv4 = (ip) => {
    if (!ip) return 'IPv4 bulunamadı';
    if (ip.includes(',')) ip = ip.split(',')[0]; // x-forwarded-for birden fazla IP içerir
    const ipv4Match = ip.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
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
      browser: headers['user-agent']?.match(/\((.*?)\)/)?.[1] || 'Bilinmiyor',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      rawIP: rawIP
    })
  };
};
