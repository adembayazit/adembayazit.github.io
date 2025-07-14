headers: { 
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
}
exports.handler = async (event) => {
  // IP ve tarih bilgisini al
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'];
  const date = new Date().toISOString();
  
  // Logu konsola yazdır (Netlify Dashboard'da görülebilir)
  console.log("Yeni ziyaretçi:", { ip, date });

  // Başarılı yanıt dön
  return {
    statusCode: 200,
    body: JSON.stringify({ ip, date }),
  };
};
