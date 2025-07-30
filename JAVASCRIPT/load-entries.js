document.addEventListener("DOMContentLoaded", async () => {
  // Önce etkileşimleri yükle
  await loadInteractions();
  
  // Sonra entry'leri yükle
  fetch("entries.json")
    .then((res) => res.json())
    .then(processEntries)
    .catch(console.error);
});

// Global önbellek ve durum yönetimi
const interactionsCache = {
  likes: {},
  pins: {},
  lastUpdated: 0,
  isUpdating: false
};

// Etkileşimleri yükle (sayfa yüklendiğinde)
async function loadInteractions() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest`, {
      headers: {
        'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      cache: 'no-cache'
    });
    
    if (!response.ok) throw new Error('Failed to fetch interactions');
    
    const result = await response.json();
    interactionsCache.likes = result.likes || {};
    interactionsCache.pins = result.pins || {};
    interactionsCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('loadInteractions error:', error);
    // LocalStorage'dan yedek yükle
    const localData = localStorage.getItem('entryInteractions');
    if (localData) {
      const parsed = JSON.parse(localData);
      interactionsCache.likes = parsed.likes || {};
      interactionsCache.pins = parsed.pins || {};
    }
  }
}

// Entry'leri işle
function processEntries(entries) {
  const container = document.getElementById("entries");
  if (!container) {
    console.error("Entries container not found!");
    return;
  }
  container.innerHTML = "";

  // Entry'leri tarihe göre sırala
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const last7Entries = sortedEntries.slice(0, 7);

  // Hiyerarşik yapı oluştur
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

  // Entry'leri oluştur
  parentEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(parent => {
      createEntryElement(parent, container, 0);
      const children = entriesMap.get(parent.id)?.children || [];
      children
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(child => createEntryElement(child, container, 1));
    });

  // Çeviri ikonlarını ekle (varsa)
  if (typeof addTranslationIcons === 'function') {
    addTranslationIcons();
  }
}

// Entry elementi oluştur
function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit", 
    hour: "2-digit", 
    minute: "2-digit"
  }).replace(",", "");

  // Beğeni ve iğneleme sayılarını önbellekten al
  const likeCount = interactionsCache.likes[entry.id] || 0;
  const pinCount = interactionsCache.pins[entry.id] || 0;

  entryDiv.innerHTML = `
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
        <img src="IMAGES/pine-tree.svg" class="pine-icon" alt="İğnele" />
        <span class="pin-count">${pinCount}</span>
      </div>
    </div>
  `;

  container.appendChild(entryDiv);

  // Beğeni butonu event listener
  entryDiv.querySelector(".daisy-like").addEventListener("click", function() {
    handleInteractionClick('likes', entry.id, entryDiv);
  });
  
  // İğneleme butonu event listener
  entryDiv.querySelector(".pine-pin").addEventListener("click", function() {
    handleInteractionClick('pins', entry.id, entryDiv);
  });
}

// Etkileşim tıklama işlemi
async function handleInteractionClick(type, entryId, entryDiv) {
  if (interactionsCache.isUpdating) return;
  
  const countSpan = entryDiv.querySelector(`.${type}-count`);
  const button = entryDiv.querySelector(`.${type === 'likes' ? 'daisy-like' : 'pine-pin'}`);
  const currentCount = parseInt(countSpan.textContent) || 0;

  // 1. Anında görsel feedback
  countSpan.textContent = currentCount + 1;
  button.classList.add('active');
  
  // 2. Önbelleği güncelle
  interactionsCache[type][entryId] = currentCount + 1;
  interactionsCache.isUpdating = true;

  // 3. LocalStorage'a yedekle
  localStorage.setItem('entryInteractions', JSON.stringify({
    likes: interactionsCache.likes,
    pins: interactionsCache.pins
  }));

  try {
    // 4. API'ye güncelleme gönder (arka planda)
    await updateInteractionsOnServer();
  } catch (error) {
    console.error('Interaction update failed:', error);
    // Hata durumunda geri al
    interactionsCache[type][entryId] = currentCount;
    countSpan.textContent = currentCount;
  } finally {
    interactionsCache.isUpdating = false;
    setTimeout(() => button.classList.remove('active'), 300);
  }
}

// Sunucuda etkileşimleri güncelle (arka planda)
async function updateInteractionsOnServer() {
  const updatedData = {
    likes: interactionsCache.likes,
    pins: interactionsCache.pins
  };
  
  const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945`, {
    method: 'PUT',
    headers: {
      'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  });

  if (!response.ok) {
    throw new Error('Failed to update interactions on server');
  }

  // Önbellek güncelleme zamanını kaydet
  interactionsCache.lastUpdated = Date.now();
  return response.json();
}
