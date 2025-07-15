exports.handler = async (event) => {
  // 1. TEMEL BİLGİLERİ TOPLA
  const ip = event.headers['x-nf-client-connection-ip'] || 'IP_BULUNAMADI';
  const browser = event.headers['user-agent'] || 'Belirsiz Tarayıcı';
  const siteAdi = 'adembayazit.github.io'; // Sitenizin adını buraya yazın
  
  // 2. TARİH/SAAT FORMATI (Türkiye saat dilimi)
  const tarih = new Date().toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // 3. LOG KAYDI
  const logKaydi = `
IP: ${ip}
Tarih: ${tarih}
Browser: ${browser.split(' ')[0]}
Site: ${siteAdi}
-----------------------`;

  // 4. KONSOLA VE DOSYAYA YAZ
  console.log(logKaydi);
  require('fs').appendFileSync('/tmp/basit-logs.txt', logKaydi);

  // 5. YANIT OLUŞTUR (Yeşil yuvarlak için)
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      ip: ip,
      tarih: tarih,
      browser: browser,
      site: siteAdi,
      indicator: "🟢"
    }),
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  };
};
