const axios = require('axios');

exports.handler = async (event) => {
  // 1. TEMEL ZİYARETÇİ BİLGİLERİ
  const getVisitorIP = () => {
    return event.headers['x-nf-client-connection-ip'] || 
           event.headers['x-forwarded-for']?.split(',')[0].trim() || 
           'IP_BULUNAMADI';
  };

  // 2. IP'DEN KONUM BİLGİSİ ALMA (Ücretsiz IPAPI kullanımı)
  const getLocationData = async (ip) => {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
      return {
        postalCode: response.data.zip || 'Bilinmiyor',
        city: response.data.city || 'Bilinmiyor',
        country: response.data.country || 'Bilinmiyor',
        isp: response.data.isp || 'Bilinmiyor'
      };
    } catch (error) {
      console.error('Konum bilgisi alınamadı:', error);
      return {
        postalCode: 'ALINAMADI',
        city: 'ALINAMADI',
        country: 'ALINAMADI',
        isp: 'ALINAMADI'
      };
    }
  };

  // 3. VERİLERİ TOPLA
  const visitorIP = getVisitorIP();
  const location = await getLocationData(visitorIP.replace(/^::ffff:/, ''));
  
  const logEntry = {
    ip: visitorIP,
    timestamp: new Date().toLocaleString('tr-TR'),
    browser: (event.headers['user-agent'] || '').split('/')[0],
    page: event.headers['referer'] || 'Direkt Erişim',
    location: {
      postalCode: location.postalCode,
      city: location.city,
      country: location.country,
      isp: location.isp
    }
  };

  // 4. LOG FORMATI (4 Satır + Ek Bilgiler)
  const logText = `
IP: ${logEntry.ip}
Tarih: ${logEntry.timestamp}
Tarayıcı: ${logEntry.browser}
Posta Kodu: ${logEntry.location.postalCode}
Şehir: ${logEntry.location.city}
Ülke: ${logEntry.location.country}
ISP: ${logEntry.location.isp}
Sayfa: ${logEntry.page}
-----------------------`;

  // 5. KAYIT İŞLEMLERİ
  console.log(logText);
  require('fs').appendFileSync('/tmp/advanced-logs.txt', logText);

  return {
    statusCode: 200,
    body: JSON.stringify(logEntry),
    headers: { 
      'Access-Control-Allow-Origin': 'https://adembayazit.github.io',
      'Content-Type': 'application/json'
    }
  };
};
