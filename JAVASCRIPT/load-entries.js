document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Önce etkileşimleri yükle
    await loadInteractions();
    
    // Sonra entry'leri yükle ve işle
    const response = await fetch("entries.json");
    if (!response.ok) throw new Error('Entries fetch failed');
    const entries = await response.json();
    processEntries(entries);
  } catch (error) {
    console.error("Initialization error:", error);
  }
});

// Etkileşim verileri için önbellek
const interactionsCache = {
  likes: {},
  pins: {},
  lastUpdated: 0,
  isUpdating: false
};

// Etkileşimleri yükle
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
    
    if (!response.ok) throw new Error('API request failed');
    
    const result = await response.json();
    interactionsCache.likes = result.likes || {};
    interactionsCache.pins = result.pins || {};
    interactionsCache.lastUpdated = Date.now();
    console.log("Interactions loaded:", interactionsCache);
  } catch (error) {
    console.error("Failed to load interactions:", error);
    // LocalStorage'dan yedek yükle
    const localData = localStorage.getItem('entryInteractions');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        interactionsCache.likes = parsed.likes || {};
        interactionsCache.pins = parsed.pins || {};
        console.log("Loaded from localStorage:", parsed);
      } catch (e) {
        console.error("LocalStorage parse error:", e);
      }
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

  // Entry'leri tarihe göre sırala ve son 7'sini al
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const displayedEntries = sortedEntries.slice(0, 7);

  // Hiyerarşik yapı oluştur
  const entriesMap = new Map();
  const parentEntries = [];

  displayedEntries.forEach(entry => {
    entriesMap.set(entry.id, { ...entry, children: [] });
  });

  displayedEntries.forEach(entry => {
    if (entry.references?.length > 0) {
      const parentId = entry.references[0];
      if (entriesMap.has(parentId)) {
        entriesMap.get(parentId).children.push(entry);
      }
    } else {
      parentEntries.push(entry);
    }
  });

  // Entry elementlerini oluştur
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
  entryDiv.dataset.entryId = entry.id;

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

  // Etkileşim butonlarına event listener ekle
  entryDiv.querySelector(".daisy-like").addEventListener("click", (e) => {
    e.stopPropagation();
    handleInteractionClick('likes', entry.id, entryDiv);
  });
  
  entryDiv.querySelector(".pine-pin").addEventListener("click", (e) => {
    e.stopPropagation();
    handleInteractionClick('pins', entry.id, entryDiv);
  });
}

// Etkileşim tıklama işlemi
async function handleInteractionClick(type, entryId, entryDiv) {
  if (interactionsCache.isUpdating) {
    console.log("Update already in progress");
    return;
  }

  try {
    interactionsCache.isUpdating = true;
    
    // Mevcut değeri al
    const currentCount = interactionsCache[type][entryId] || 0;
    const newCount = currentCount + 1;
    
    // Önbelleği güncelle
    interactionsCache[type][entryId] = newCount;
    
    // UI'ı güncelle
    const countSpan = entryDiv.querySelector(`.${type}-count`);
    const button = entryDiv.querySelector(`.${type === 'likes' ? '.daisy-like' : '.pine-pin'}`);
    
    if (countSpan) countSpan.textContent = newCount;
    if (button) button.classList.add(type === 'likes' ? 'liked' : 'pinned');
    
    // LocalStorage'a kaydet
    localStorage.setItem('entryInteractions', JSON.stringify({
      likes: interactionsCache.likes,
      pins: interactionsCache.pins
    }));
    
    // Sunucuyu güncelle (arka planda)
    setTimeout(async () => {
      try {
        await updateInteractionsOnServer();
      } catch (error) {
        console.error("Background update failed:", error);
      }
    }, 0);
    
  } catch (error) {
    console.error("Interaction error:", error);
  } finally {
    setTimeout(() => {
      const button = entryDiv.querySelector(`.${type === 'likes' ? '.daisy-like' : '.pine-pin'}`);
      if (button) button.classList.remove(type === 'likes' ? 'liked' : 'pinned');
      interactionsCache.isUpdating = false;
    }, 600);
  }
}

// Sunucudaki etkileşimleri güncelle
async function updateInteractionsOnServer() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945`, {
      method: 'PUT',
      headers: {
        'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        likes: interactionsCache.likes,
        pins: interactionsCache.pins
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    interactionsCache.lastUpdated = Date.now();
    console.log("Server update successful:", result);
    return result;
  } catch (error) {
    console.error("Failed to update server:", error);
    throw error;
  }
}
