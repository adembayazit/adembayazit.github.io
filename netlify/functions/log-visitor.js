exports.handler = async (event) => {
  console.log("🔄 Fonksiyon çağrıldı"); // TEST 1
  
  const ip = event.headers['x-nf-client-connection-ip'] || 'IP_BULUNAMADI';
  const userAgent = event.headers['user-agent'];
  
  console.log("📌 Detaylı Log:", { 
    ip, 
    userAgent,
    time: new Date().toISOString() 
  }); // TEST 2

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success" }),
    headers: { 'Access-Control-Allow-Origin': '*' }
  };
};
