const fs = require('fs').promises; // Promise tabanlı FS kullanımı
const path = require('path');

const likesFile = path.resolve(__dirname, '../../likes.json');

// Global cache for better performance
let likesCache = null;
let lastModified = 0;

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // ✅ Preflight isteği
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers 
    };
  }

  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method Not Allowed',
        message: 'Only POST requests are accepted'
      })
    };
  }

  try {
    // Input validation
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'Request body is missing'
        })
      };
    }

    const { id } = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'Missing "id" parameter'
        })
      };
    }

    // Cache kontrolü
    const stats = await fs.stat(likesFile).catch(() => null);
    
    if (!likesCache || !stats || stats.mtimeMs > lastModified) {
      try {
        const data = await fs.readFile(likesFile, 'utf8');
        likesCache = JSON.parse(data);
        lastModified = stats?.mtimeMs || Date.now();
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Dosya yoksa boş bir obje oluştur
          likesCache = {};
        } else {
          throw err;
        }
      }
    }

    // Beğeni sayısını artır
    likesCache[id] = (likesCache[id] || 0) + 1;

    // Dosyaya yaz
    await fs.writeFile(
      likesFile, 
      JSON.stringify(likesCache, null, 2),
      'utf8'
    );

    // Başarılı yanıt
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        likes: likesCache[id],
        message: 'Like incremented successfully'
      })
    };

  } catch (err) {
    console.error('increment-like.js error:', err);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      })
    };
  }
};
