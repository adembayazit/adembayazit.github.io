exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://adembayazit.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Sadece POST destekleniyor
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Sadece POST isteği destekleniyor' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    const {
      ip, hostname, city, region, country,
      loc, org, postal, timezone, timestamp,
      userAgent, eventType, detail
    } = data;

    // Olay başlığı
    const title = eventType ? `📸 [${eventType.toUpperCase()}] Ekran Görüntüsü veya Davranış` : `👤 Yeni Ziyaretçi`;

    // Genel log çıktısı
    console.log(`--- ${title} ---`);
    console.log(`Zaman: ${timestamp}`);
    if (eventType) {
      console.log(`Davranış Türü: ${eventType}`);
      console.log(`Detay: ${detail}`);
    }
    console.log(`IP: ${ip}`);
    console.log(`Hostname: ${hostname}`);
    console.log(`Şehir: ${city}`);
    console.log(`Bölge: ${region}`);
    console.log(`Ülke: ${country}`);
    console.log(`Konum: ${loc}`);
    console.log(`Posta Kodu: ${postal}`);
    console.log(`Org: ${org}`);
    console.log(`Zaman Dilimi: ${timezone}`);
    console.log(`Tarayıcı: ${userAgent}`);
    console.log(`-------------------------------`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: eventType ? 'Davranış + ziyaretçi bilgisi loglandı' : 'Ziyaretçi bilgisi loglandı',
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
