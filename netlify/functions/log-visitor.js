exports.handler = async (event) => {
  // 1. GERÇEK IPv4 ADRESİNİ ALMA FONKSİYONU
  const getStrictIPv4 = () => {
    const headers = event.headers;
    
    // Cloudflare kullanıyorsanız (en güvenilir)
    if (headers['cf-connecting-ip']) {
      return headers['cf-connecting-ip'];
    }
    
    // Netlify'in sağladığı IP
    const netlifyIp = headers['x-nf-client-connection-ip'];
    
    // X-Forwarded-For'dan IPv4 filtreleme
    const xForwardedIps = (headers['x-forwarded-for'] || '')
      .split(',')
      .map(ip => ip.trim())
      .filter(ip => {
        // Sadece IPv4 formatını kabul et (192.168.1.1 gibi)
        const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipv4Pattern.test(ip.replace(/^::ffff:/, ''));
      });
    
    // IPv6 içermeyen ilk IPv4'yü seç
    return xForwardedIps[0] || netlifyIp || 'IP_BULUNAMADI';
  };

  // 2. KESİNLİKLE IPv4 TEMİZLEME
  const strictIPv4 = (ip) => {
    if (!ip) return null;
    
    // ::ffff:192.168.1.1 formatını temizle
    ip = ip.replace(/^::ffff:/, '');
    
    // IPv4 format kontrolü
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Pattern.test(ip) ? ip : null;
  };

  // 3. IP ALMA İŞLEMLERİ
  const rawIp = getStrictIPv4();
  const ipv4 = strictIPv4(rawIp) || 'IPV4_BULUNAMADI';

  // 4. LOG KAYDI OLUŞTUR
  const logEntry = {
    ipv4: ipv4,
    originalIp: rawIp, // Orijinal IP'yi de kaydet (debug için)
    timestamp: new Date().toISOString(),
    userAgent: event.headers['user-agent'] || 'Belirsiz',
    referer: event.headers['referer'] || 'Direkt Erişim',
    headers: event.headers // Tüm header'ları kaydet (opsiyonel)
  };

  // 5. LOGLAMA İŞLEMLERİ
  console.log("🔴 IPv4 LOG:", JSON.stringify(logEntry, null, 2));
  
  // 6. DOSYAYA YAZ (Opsiyonel)
  const fs = require('fs');
  fs.appendFileSync('/tmp/ipv4-logs.txt', `${JSON.stringify(logEntry)}\n`);

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      status: "success",
      your_ipv4: ipv4,
      debug_info: {
        original_ip: rawIp,
        is_ipv4: ipv4 !== 'IPV4_BULUNAMADI'
      }
    }),
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  };
};
