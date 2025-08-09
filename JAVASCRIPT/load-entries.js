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
let lastEntryObserver = null;

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

// 4. ENTRY İŞLEME FONKSİYONLARI
function processEntries(entries) {
  const container = document.getElementById("entries");
  if (!container) {
    console.error('Entries container not found!');
    return;
  }
  
  container.innerHTML = "";

  const actualEntries = entries.records || entries;
  currentEntries = [...actualEntries];
  
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

  setupAutoRefresh();
}

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;
  
  // Spotify kontrolü
  const hasSpotify = entry.content.includes('open.spotify.com');
  if (hasSpotify) {
    entryDiv.classList.add('has-spotify');
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

  // Entry ID için daha şık bir tasarım
  const entryIdHTML = `
    <div class="entry-id">
      <i class="fas fa-hashtag"></i>
      ${entry.id}
    </div>
  `;

  // İçerik işleme - Spotify embed ekleme
  let processedContent = entry.content;
  if (hasSpotify) {
    const spotifyUrlMatch = entry.content.match(/https:\/\/open\.spotify\.com\/[^\s]+/);
    if (spotifyUrlMatch) {
      const spotifyUrl = spotifyUrlMatch[0];
      const spotifyEmbed = `
        <iframe src="https://open.spotify.com/embed/${spotifyUrl.split('open.spotify.com/')[1]}"
                class="spotify-embed" 
                frameborder="0" 
                allowtransparency="true" 
                allow="encrypted-media"></iframe>
      `;
      processedContent = entry.content.replace(spotifyUrl, '') + spotifyEmbed;
    }
  }

  entryDiv.innerHTML = `
    <div class="timestamp">
      <i class="fas fa-bug bug-iconentry"></i> ${time}
    </div>
    ${entryIdHTML}
    <div class="content">${processedContent}</div>
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

  // Etkileşim butonlarına event listener ekle
  const likeIcon = entryDiv.querySelector(".daisy-icon");
  likeIcon?.addEventListener("click", () => handleLikeClick(entry.id, entryDiv));

  const pinIcon = entryDiv.querySelector(".pine-icon");
  pinIcon?.addEventListener("click", () => handlePinClick(entry.id, entryDiv));

  // Çeviri ikonu ekleme (eğer çeviri varsa)
  if (entry.content_tr) {
    const idDiv = entryDiv.querySelector(".entry-id");
    if (idDiv) {
      const icon = document.createElement("span");
      icon.classList.add("translation-icon", "fi", `fi-${entry.lang || 'tr'}`);
      icon.title = "Çeviriyi göster/gizle";
      idDiv.appendChild(icon);
      
      const contentDiv = entryDiv.querySelector(".content");
      const originalContent = contentDiv.innerHTML;
      
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        icon.classList.toggle("active");
        contentDiv.innerHTML = icon.classList.contains("active") 
          ? entry.content_tr 
          : originalContent;
      });
    }
  }
}

// 5. OTOMATİK YENİLEME SİSTEMİ
function setupAutoRefresh() {
  // Önceki observer'ı temizle
  if (lastEntryObserver) {
    lastEntryObserver.disconnect();
  }

  const lastEntry = document.querySelector(".entry:last-child");
  if (!lastEntry) return;

  lastEntryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        checkForNewEntries();
      }
    });
  }, { threshold: 0.1 });

  lastEntryObserver.observe(lastEntry);
}

async function checkForNewEntries() {
  try {
    const entries = await fetchViaProxy('/b/68933248ae596e708fc2fbbc/latest');
    const newEntryCount = entries.records?.length || entries.length;
    if (newEntryCount > currentEntries.length) {
      initializeApp();
    }
  } catch (error) {
    console.error("New entries check failed:", error);
  }
}

// 6. ETKİLEŞİM FONKSİYONLARI
async function handleLikeClick(entryId, entryDiv) {
  if (likesCache.isUpdating) return;

  likesCache.isUpdating = true;
  const likeCountSpan = entryDiv.querySelector(".like-count");
  const likeIcon = entryDiv.querySelector(".daisy-icon");
  const currentCount = parseInt(likeCountSpan.textContent) || 0;

  try {
    likeCountSpan.textContent = currentCount + 1;
    likeIcon.classList.add("liked");
    
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
      likeIcon.classList.remove("liked");
    }, 600);
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

// 7. UYGULAMA BAŞLATMA
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
      document.getElementById("entries").innerHTML = 
        '<div class="error">Veriler yüklenirken bir hata oluştu</div>';
    }
  }
}

// UYGULAMAYI BAŞLAT
document.addEventListener("DOMContentLoaded", initializeApp);