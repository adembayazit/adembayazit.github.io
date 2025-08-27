// 1. GLOBAL DEĞİŞKENLER
const likesCache = {
  data: {},
  lastUpdated: 0,
  isUpdating: false
};

const pinsCache = {
  data: {},
  lastUpdated: 0,
  isUpdating: false
};

let allEntries = [];

// 2. PROXY HELPER FONKSİYONU
async function fetchViaProxy(path, method = 'GET', body = null) {
  const proxyUrl = 'https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy';
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path, method, body })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Proxy error:', error);
    throw error;
  }
}

// 3. TEMEL FONKSİYONLAR
async function loadInteractions() {
  try {
    const result = await fetchViaProxy('/b/68862fd97b4b8670d8a81945/latest');
    likesCache.data = result.likes || {};
    pinsCache.data = result.pins || {};
    likesCache.lastUpdated = pinsCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('loadInteractions error:', error);
    try {
      const localLikes = localStorage.getItem('entryLikes') || '{}';
      const localPins = localStorage.getItem('entryPins') || '{}';
      likesCache.data = JSON.parse(localLikes);
      pinsCache.data = JSON.parse(localPins);
    } catch (parseError) {
      console.error('Local storage parse error:', parseError);
    }
  }
}

// HTML içeriğini düzgün işlemek için yardımcı fonksiyon
function formatContent(content, isPreview = false) {
  content = content.replace(/<br\s*\/?>/gi, '<br>');
  content = content.replace(/<p>\s*<\/p>/gi, '');
  
  // Önizleme modunda içeriği kısalt
  if (isPreview) {
    // Tüm HTML taglerini kaldır ve kısalt
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length > 150) {
      content = plainText.substring(0, 150) + '...';
    } else {
      content = plainText;
    }
  }
  
  return content;
}

// İlk fotoğrafı çekme fonksiyonu
function getFirstImage(content) {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = content.match(imgRegex);
  return match ? match[1] : null;
}

function createPreviewEntryElement(entry) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `preview-entry`;
  entryDiv.onclick = () => {
    window.location.href = `microblog.html#entry-${entry.id}`;
  };

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit"
  }).replace(",", "");

  const likeCount = likesCache.data[entry.id] || 0;
  const pinCount = pinsCache.data[entry.id] || 0;

  const formattedContent = formatContent(entry.content, true);
  const firstImage = getFirstImage(entry.content);

  let imageHtml = '';
  if (firstImage) {
    imageHtml = `<img src="${firstImage}" alt="Entry image" class="preview-image">`;
  }

  entryDiv.innerHTML = `
    <div class="preview-header">
      <div class="preview-date">
        <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
      </div>
      <div class="preview-id">#${entry.id}</div>
    </div>
    ${imageHtml}
    <div class="preview-content">${formattedContent}</div>
    <div class="preview-stats">
      <span><i class="fas fa-heart"></i> ${likeCount}</span>
      <span><i class="fas fa-thumbtack"></i> ${pinCount}</span>
    </div>
  `;

  return entryDiv;
}

function processEntries(entries) {
  const container = document.getElementById("entries-preview");
  if (!container) {
    console.error('Entries preview container not found!');
    return;
  }
  
  container.innerHTML = "";

  const actualEntries = entries.records || entries;
  allEntries = [...actualEntries];
  
  // Son 5 entry'i al
  const last5Entries = allEntries.slice(0, 5);
  
  // Entry'leri ekrana bas
  last5Entries.forEach(entry => {
    const entryElement = createPreviewEntryElement(entry);
    container.appendChild(entryElement);
  });
}

// 4. BAŞLANGIÇ FONKSİYONU
async function initializeApp() {
  try {
    await loadInteractions();
    const entries = await fetchViaProxy('/b/68933248ae596e708fc2fbbc/latest');
    processEntries(entries);
  } catch (error) {
    console.error("Initialization error:", error);
    try {
      const response = await fetch("entries.json");
      processEntries(await response.json());
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError);
      document.getElementById("entries-preview").innerHTML = 
        '<div class="error">Veriler yüklenirken bir hata oluştu</div>';
    }
  }
}

// 5. UYGULAMAYI BAŞLAT
document.addEventListener("DOMContentLoaded", initializeApp);