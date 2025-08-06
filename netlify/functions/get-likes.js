exports.handler = async (event) => {
  // Ortak yanıt başlıkları
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Preflight isteği işleme
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  // Sadece GET metoduna izin ver
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: "Method Not Allowed",
        message: "Only GET requests are accepted"
      }),
    };
  }

  try {
    // ID parametresini al
    const { id } = event.queryStringParameters;
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: "Bad Request",
          message: "Missing 'id' parameter"
        }),
      };
    }

    // JSONBin.io'dan veriyi çek
    const binId = "68862fd97b4b8670d8a81945"; // Bin ID'sini sabit olarak tanımla
    const apiUrl = `https://api.jsonbin.io/v3/b/${binId}/latest`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-Master-Key': process.env.JSONBIN_API_KEY,
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      timeout: 5000 // 5 saniye timeout
    });

    // HTTP hatalarını kontrol et
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `JSONBin API error: ${response.status} ${response.statusText} - ${errorData.message || 'No additional info'}`
      );
    }

    const data = await response.json();
    
    // Veri yapısını kontrol et
    if (!data || typeof data !== 'object') {
      throw new Error("Invalid data format received from JSONBin");
    }

    // Likes verisini al (default 0)
    const likes = data.likes?.[id] || 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        likes,
        success: true
      }),
    };
  } catch (err) {
    console.error("get-likes.js error:", err);
    
    // Hata türüne göre özel mesajlar
    const errorMessage = err.message.includes('JSONBin API error')
      ? "Could not retrieve likes data from external service"
      : "Internal Server Error";

    return {
      statusCode: err.message.includes('JSONBin API error') ? 502 : 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        message: err.message,
        success: false
      }),
    };
  }
};
