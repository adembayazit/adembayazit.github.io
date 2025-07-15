exports.handler = async (event) => {
  // 1. OPTIONS isteğine cevap (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  // 2. POST dışı metod kontrolü
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Sadece POST isteği destekleniyor' })
    };
  }

  // 3. POST ise işlem yap
  try {
    const data = JSON.parse(event.body);
    console.log('Ziyaretçi verisi:', data);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'ok', message: 'Veri alındı' })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'JSON ayrıştırma hatası', detay: err.message })
    };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Sadece POST isteği destekleniyor' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    const {
      ip,
      hostname,
      city,
      region,
      country,
      loc,
      org,
      postal,
      timezone,
      timestamp,
      userAgent
    } = data;

    // Konsola loglama
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Ziyaretçi verisi başarıyla alındı',
        ip: ip
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Veri ayrıştırılamadı',
        detay: err.message
      })
    };
  }
};
