exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const visitorIP = data.ip || 'IP gönderilmedi';
      const extra = data.extra || {};

      const userAgent = event.headers['user-agent'] || 'Bilinmiyor';
      const browser = userAgent.match(/\((.*?)\)/)?.[1] || 'Bilinmiyor';
      const timezone = extra.timezone || 'Bilinmiyor';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'success',
          ipv4: visitorIP,
          ipv6: visitorIP.includes(':') ? visitorIP : 'IPv6 yok',
          timestamp: new Date().toISOString(),
          browser,
          timezone,
          rawData: data
        })
      };
    }
    else if (event.httpMethod === 'GET') {
      // GET ise sadece sabit veya test amaçlı veri dönelim (örnek)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'success',
          ipv4: 'Kullanıcı IP (GET ile alınamaz)',
          country: 'Bilinmiyor',
          timestamp: new Date().toISOString()
        })
      };
    }
    else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Yalnızca GET veya POST metoduna izin verilir' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'İşlem sırasında hata oluştu', message: e.message })
    };
  }
};
