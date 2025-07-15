exports.handler = async (event) => {
  // 1. IPv4 adresini güvenli şekilde alma
  const getClientIPv4 = () => {
    const headers = event.headers;
    // Öncelik sırası: Cloudflare > Netlify > Diğer
    return headers['cf-connecting-ip']?.[0] || // Cloudflare
           headers['x-nf-client-connection-ip'] || // Netlify
           (headers['x-forwarded-for'] || '').split(',')[0].trim() || // İlk IP
           headers['client-ip'] || 
           'IP_BULUNAMADI';
  };

  // 2. IPv6'yi IPv4'e çevirme
  const cleanIPv4 = (ip) => {
    if (!ip) return null;
    // ::ffff:192.168.1.1 formatını düzelt
    return ip.replace(/^::ffff:/, '').split('%')[0];
  };

  const rawIp = getClientIPv4();
  const ipv4 = cleanIPv4(rawIp);

  // 3. Log objesi oluştur
  const logEntry = {
    ipv4: ipv4,
    timestamp: new Date().toISOString(),
    userAgent: event.headers['user-agent'],
    referer: event.headers['referer'] || 'Direkt Erişim'
  };

  // 4. Netlify Logs'a yazdır (Dashboard'da görünecek)
  console.log("🌐 IPv4 LOG:", logEntry);

  // 5. JSON dosyasına yaz (Kalıcı depolama için)
  const fs = require('fs');
  const path = '/tmp/ipv4-logs.json';
  
  let existingLogs = [];
  try {
    existingLogs = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (e) {
    console.log("Yeni log dosyası oluşturuluyor...");
  }

  existingLogs.push(logEntry);
  fs.writeFileSync(path, JSON.stringify(existingLogs, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ipv4: ipv4 }),
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  };
};
