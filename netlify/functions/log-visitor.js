exports.handler = async (event) => {
  // 1. DOĞRU IP ALMA (WhatIsMyIP uyumlu)
  const getTrueIPv4 = () => {
    const headers = event.headers;
    
    // Cloudflare desteği
    if (headers['cf-connecting-ip']) {
      return headers['cf-connecting-ip'];
    }
    
    // Netlify IPv4 header'ı
    const netlifyIp = headers['x-nf-client-connection-ip'];
    
    // X-Forwarded-For'dan temiz IPv4 çekme
    const xForwarded = (headers['x-forwarded-for'] || '')
      .split(',')
      .map(ip => ip.trim().replace(/^::ffff:/, ''))
      .find(ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip));
    
    return xForwarded || netlifyIp || 'IP_ALINAMADI';
  };

  // 2. TARİH FORMATLAMA (TR saat dilimi)
  const formatDate = () => {
    return new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\s/g, '');
  };

  // 3. BROWSER BİLGİSİNİ TEMİZLE
  const getCleanBrowser = (userAgent) => {
    if (!userAgent) return 'Belirsiz';
    return userAgent.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  };

  // 4. VERİLERİ TOPLA
  const ipv4 = getTrueIPv4();
  const logData = {
    ip: ipv4,
    date: formatDate(),
    browser: getCleanBrowser(event.headers['user-agent']),
    site: 'adembayazit.github.io'
  };

  // 5. 4 SATIRLIK LOG FORMATI
  const logText = `
IP: ${logData.ip}
Tarih: ${logData.date}
Browser: ${logData.browser}
Site: ${logData.site}
-----------------------`;

  // 6. LOGLAMA
  console.log(logText);
  require('fs').appendFileSync('/tmp/github-logs.txt', logText);

  return {
    statusCode: 200,
    body: JSON.stringify(logData),
    headers: { 
      'Access-Control-Allow-Origin': 'https://adembayazit.github.io',
      'Content-Type': 'application/json'
    }
  };
};
