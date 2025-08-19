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

let currentEntries = [];
let lastEntryCount = 0;
let refreshInterval = 30000; // 30 saniyede bir kontrol
let checkInterval;

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

// ÇEVİRİ İKONLARINI EKLEME FONKSİYONU
async function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");
  if (entries.length === 0) return;

  entries.forEach(entry => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const originalContent = contentDiv?.textContent?.trim();
    if (!idDiv || !originalContent) return;
    
    if (idDiv.querySelector(".translation-icon")) return;

    const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
    if (isNaN(idValue)) return;

    const translationEntry = currentEntries.find(item => item.id === idValue);
    
    if (!translationEntry?.content_tr) return;

    const icon = document.createElement("span");
    icon.classList.add("translation-icon", "fi", "fi-tr");
    icon.title = "Çeviriyi göster/gizle";
    
    const langCode = translationEntry?.lang || 'tr';
    icon.classList.add(`fi-${langCode}`);

    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      icon.classList.toggle("active");
      
      if (icon.classList.contains("active")) {
        if (translationEntry.content_tr) {
          contentDiv.textContent = translationEntry.content_tr;
        }
      } else {
        contentDiv.textContent = originalContent;
      }
    });

    document.addEventListener("click", (e) => {
      if (!icon.contains(e.target) && !contentDiv.contains(e.target)) {
        icon.classList.remove("active");
        contentDiv.textContent = originalContent;
      }
    });

    idDiv.appendChild(icon);
  });
}

function processEntries(entries) {
  const container = document.getElementById("entries");
  if (!container) {
    console.error('Entries container not found!');
    return;
  }
  
  container.textContent = "";

  const actualEntries = entries.records || entries;
  currentEntries = [...actualEntries]; // Global değişkene kaydet
  
  // Yeni entry kontrolü
  if (actualEntries.length !== lastEntryCount) {
    lastEntryCount = actualEntries.length;
    if (lastEntryCount > 0) {
      // Yeni entry geldiğinde sayfayı en üste kaydır
      window.scrollTo(0, 0);
    }
  }

  const sortedEntries = [...actualEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const last7Entries = sortedEntries.slice(0, 7);

  const entriesMap = new Map();
  const parentEntries = [];

  last7Entries.forEach(entry => {
    entriesMap.set(entry.id, { ...entry, children: [] });
  });

  last7Entries.forEach(entry => {
    if (entry.references?.length > 0) {
      const parentId = entry.references[0];
      if (entriesMap.has(parentId)) {
        entriesMap.get(parentId).children.push(entry);
      }
    } else {
      parentEntries.push(entry);
    }
  });

  parentEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(parent => {
      createEntryElement(parent, container, 0);
      const children = entriesMap.get(parent.id)?.children || [];
      children
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(child => createEntryElement(child, container, 1));
    });

  // Çeviri ikonlarını ekle
  addTranslationIcons();
}

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;

  // Spotify link kontrolü
  const hasSpotifyLink = entry.content.includes('open.spotify.com');
  if (!hasSpotifyLink) {
    entryDiv.classList.add('regular-entry');
  }

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit", 
    hour: "2-digit", 
    minute: "2-digit"
  }).replace(",", "");

  const likeCount = likesCache.data[entry.id] || 0;
  const pinCount = pinsCache.data[entry.id] || 0;

  entryDiv.textContent = `
    <div class="timestamp">
      <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
    </div>
    <div class="entry-id">#${entry.id}</div>
    <div class="content">${entry.content}</div>
    <div class="interaction-buttons">
      <div class="daisy-like" data-entry-id="${entry.id}">
        <img src="IMAGES/daisy.svg" class="daisy-icon" alt="Beğen" />
        <span class="like-count">${likeCount}</span>
      </div>
      <div class="pine-pin" data-entry-id="${entry.id}">
        <img src="IMAGES/pine.svg" class="pine-icon" alt="Pinle" />
        <span class="pin-count">${pinCount}</span>
      </div>
    </div>
  `;

  container.appendChild(entryDiv);

  const likeIcon = entryDiv.querySelector(".daisy-icon");
  likeIcon?.addEventListener("click", () => handleLikeClick(entry.id, entryDiv));

  const pinIcon = entryDiv.querySelector(".pine-icon");
  pinIcon?.addEventListener("click", () => handlePinClick(entry.id, entryDiv));
}

// 4. INTERACTION FONKSİYONLARI
async function handleLikeClick(entryId, entryDiv) {
  if (likesCache.isUpdating) return;

  likesCache.isUpdating = true;
  const likeCountSpan = entryDiv.querySelector(".like-count");
  const likeIcon = entryDiv.querySelector(".daisy-icon");
  const currentCount = parseInt(likeCountSpan.textContent) || 0;

  try {
    likeCountSpan.textContent = currentCount + 1;
    likeIcon.style.transform = 'scale(1.2)';
    
    likesCache.data[entryId] = currentCount + 1;
    localStorage.setItem('entryLikes', JSON.stringify(likesCache.data));
    
    await updateInteractionsOnServer(entryId, currentCount + 1, null);
    likesCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('Like update failed:', error);
    likeCountSpan.textContent = currentCount;
    likesCache.data[entryId] = currentCount;
  } finally {
    likesCache.isUpdating = false;
    setTimeout(() => {
      likeIcon.style.transform = 'scale(1)';
    }, 300);
  }
}

async function handlePinClick(entryId, entryDiv) {
  if (pinsCache.isUpdating) return;

  pinsCache.isUpdating = true;
  const pinCountSpan = entryDiv.querySelector(".pin-count");
  const pinIcon = entryDiv.querySelector(".pine-icon");
  const currentCount = parseInt(pinCountSpan.textContent) || 0;

  try {
    pinCountSpan.textContent = currentCount + 1;
    pinIcon.classList.add("pinned");
    
    pinsCache.data[entryId] = currentCount + 1;
    localStorage.setItem('entryPins', JSON.stringify(pinsCache.data));
    
    await updateInteractionsOnServer(entryId, null, currentCount + 1);
    pinsCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('Pin update failed:', error);
    pinCountSpan.textContent = currentCount;
    pinsCache.data[entryId] = currentCount;
  } finally {
    pinsCache.isUpdating = false;
    setTimeout(() => {
      pinIcon.classList.remove("pinned");
    }, 600);
  }
}

async function updateInteractionsOnServer(entryId, newLikeCount, newPinCount) {
  const updatedLikes = newLikeCount !== null ? { ...likesCache.data, [entryId]: newLikeCount } : likesCache.data;
  const updatedPins = newPinCount !== null ? { ...pinsCache.data, [entryId]: newPinCount } : pinsCache.data;

  try {
    await fetchViaProxy('/b/68862fd97b4b8670d8a81945', 'PUT', {
      likes: updatedLikes,
      pins: updatedPins
    });
  } catch (error) {
    throw new Error('Failed to update data on server');
  }
}

// Yeni entry kontrol fonksiyonu
async function checkForNewEntries() {
  try {
    const entries = await fetchViaProxy('/b/68933248ae596e708fc2fbbc/latest');
    const actualEntries = entries.records || entries;
    
    if (actualEntries.length !== lastEntryCount) {
      processEntries(entries);
    }
  } catch (error) {
    console.error('Error checking for new entries:', error);
  }
}

// 5. BAŞLANGIÇ FONKSİYONU
async function initializeApp() {
  try {
    await loadInteractions();
    const entries = await fetchViaProxy('/b/68933248ae596e708fc2fbbc/latest');
    processEntries(entries);
    
    // Otomatik yenileme kontrolünü başlat
    checkInterval = setInterval(checkForNewEntries, refreshInterval);
  } catch (error) {
    console.error("Initialization error:", error);
    try {
      const response = await fetch("entries.json");
      processEntries(await response.json());
      
      // Fallback için de kontrolü başlat
      checkInterval = setInterval(checkForNewEntries, refreshInterval);
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError);
      document.getElementById("entries").textContent = 
        '<div class="error">Veriler yüklenirken bir hata oluştu</div>';
    }
  }
}

// 6. UYGULAMAYI BAŞLAT
document.addEventListener("DOMContentLoaded", initializeApp);

// Sayfa kapatılırken interval'i temizle
window.addEventListener('beforeunload', () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});