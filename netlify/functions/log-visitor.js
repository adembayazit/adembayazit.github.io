const axios = require('axios');

exports.handler = async (event) => {
  // 1. YÖNETİCİ IP DOĞRULAMA (Sizin için özel kontrol)
  const ADMIN_IP = 'SIZIN_GERCEK_IP'; // WhatIsMyIP'den alınan IP
  const isAdminRequest = event.headers['client-ip'] === ADMIN_IP;

  // 2. IP ALMA FONKSİYONU (Nat sorunları için güncellendi)
  const getTrueIP = () => {
    // Özel admin kontrolü
    if (isAdminRequest) return ADMIN_IP;

    // GitHub Pages özel header'ı
    if (event.headers['x-github-ip']) {
      return event.headers['x-github-ip'];
    }

    // Diğer kaynaklar için standart IP alma
    return event.headers['x-nf-client-connection-ip'] || 
           event.headers['x-forwarded-for']?.split(',')[0].trim() || 
           'IP_BULUNAMADI';
  };

  // 3. WHATISMYIP API İLE DOĞRULAMA (Sadece admin için)
  const verifyWithExternalAPI = async (ip) => {
    if (!isAdminRequest) return null;
    
    try {
      const response = await axios.get(`https://api.ipify.org?format=json&ip=${ip}`);
      return {
        realIp: response.data.ip,
        isMatch: response.data.ip === ip
      };
    } catch (error) {
      console.error('IP doğrulama hatası:', error);
      return null;
    }
  };

  // 4. VERİ TOPLAMA
  const rawIp = getTrueIP();
  const ipVerification = await verifyWithExternalAPI(rawIp);
  const ip = ipVerification?.realIp || rawIp;

  const logData = {
    ip: ip,
    isAdmin: isAdminRequest,
    ipVerified: ipVerification?.isMatch || false,
    timestamp: new Date().toLocaleString('tr-TR'),
    browser: (event.headers['user-agent'] || '').split('/')[0],
    referer: event.headers['referer'] || 'Direkt Erişim',
    source: event.headers['x-github-event'] ? 'GitHub Pages' : 'Diğer'
  };

  // 5. LOG FORMATI
  const logText = `
IP: ${logData.ip} ${logData.isAdmin ? '(YÖNETİCİ)' : ''}
Tarih: ${logData.timestamp}
Tarayıcı: ${logData.browser}
Kaynak: ${logData.source}
Doğrulandı: ${logData.ipVerified ? '✅' : '❌'}
Sayfa: ${logData.referer}
-----------------------`;

  // 6. KAYIT İŞLEMLERİ
  console.log(logText);
  require('fs').appendFileSync('/tmp/verified-logs.txt', logText);

  return {
    statusCode: 200,
    body: JSON.stringify(logData, null, 2),
    headers: { 
      'Access-Control-Allow-Origin': 'https://adembayazit.github.io',
      'Content-Type': 'application/json'
    }
  };
};
