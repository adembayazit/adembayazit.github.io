exports.handler = async (event) => {
  // 1. IP'yi ve tarihi al
  const ip = event.headers['x-nf-client-connection-ip'] || 'IP_BULUNAMADI';
  const date = new Date().toISOString();

  // 2. Konsola yaz (Netlify Dashboard'da görünecek)
  console.log("🟢 YENİ ZİYARETÇİ", { ip, date });

  // 3. Yanıt dön
  return {
    statusCode: 200,
    body: JSON.stringify({ ip, date, status: "OK" }),
    headers: { 
      'Access-Control-Allow-Origin': '*' // CORS izni
    }
  };
};
