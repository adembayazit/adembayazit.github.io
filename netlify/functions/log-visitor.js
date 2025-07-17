exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // 1. CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // 2. Yalnızca POST izin ver
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Sadece POST isteği destekleniyor' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Eğer eventType varsa davranışsal log (ekran görüntüsü vb)
    if (data.eventType) {
      console.log(`--- Kullanıcı Davranışı Loglandı ---`);
      console.log(`Zaman: ${data.timestamp}`);
      console.log(`Olay Türü: ${data.eventType}`);
      console.log(`Detay: ${data.detail}`);
      console.log(`Tarayıcı: ${data.userAgent}`);
      console.log(`-------------------------------`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          message: 'Davranışsal veri başarıyla loglandı'
        })
      };
    }

    // Diğer durumda klasik ziyaretçi log'u
    const {
      ip, hostname, city, region, country,
      loc, org, postal, timezone, timestamp, userAgent
    } = data;

    console.log(`--- Yeni Ziyaretçi Loglandı ---`);
    console.log(`IP: ${ip}`);
    console.log(`Hostname: ${hostname}`);
    console.log(`Şehir: ${city}`);
    console.log(`Bölge: ${region}`);
    console.log(`Ülke: ${country}`);
    console.log(`Konum: ${loc}`);
    console.log(`Posta Kodu: ${postal}`);
    console.log(`Org: ${org}`);
    console.log(`Zaman Dilimi: ${timezone}`);
    console.log(`Ziyaret Zamanı: ${timestamp}`);
    console.log(`Tarayıcı: ${userAgent}`);
    console.log(`-------------------------------`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Ziyaretçi verisi başarıyla alındı',
        ip
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Veri ayrıştırılamadı',
        detay: err.message
      })
    };
  }
};
