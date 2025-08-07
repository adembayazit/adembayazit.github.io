// GLOBAL CACHES - Bunları en üste ekleyin
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

// processEntries fonksiyonunu ekleyin
function processEntries(entries) {
  const container = document.getElementById("entries");
  if (!container) return;
  
  container.innerHTML = "";

  const actualEntries = entries.records || entries;
  
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

  if (typeof addTranslationIcons === 'function') {
    addTranslationIcons();
  }
}

// createEntryElement fonksiyonunu ekleyin
function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", month: "2-digit", day: "2-digit", 
    hour: "2-digit", minute: "2-digit"
  }).replace(",", "");

  const likeCount = likesCache.data[entry.id] || 0;
  const pinCount = pinsCache.data[entry.id] || 0;

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

// DOMContentLoaded event listener - ORİJİNAL KODUNUZ
document.addEventListener("DOMContentLoaded", async () => {
  await loadInteractions();

  // Netlify proxy üzerinden entry'leri çek
  fetch("https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path: '/b/68933248ae596e708fc2fbbc/latest',
      method: 'GET'
    })
  })
    .then((res) => res.json())
    .then(processEntries)
    .catch((error) => {
      console.error("Entry çekme hatası:", error);
      // Fallback: Local JSON
      fetch("entries.json")
        .then((res) => res.json())
        .then(processEntries)
        .catch(console.error);
    });
});

// INTERACTION DATA YÜKLE (likes + pins) - ORİJİNAL KODUNUZ
async function loadInteractions() {
  try {
    const response = await fetch("https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '/b/68862fd97b4b8670d8a81945/latest',
        method: 'GET'
      })
    });

    if (!response.ok) throw new Error('Failed to fetch interaction data');

    const result = await response.json();
    likesCache.data = result.likes || {};
    pinsCache.data = result.pins || {};
    likesCache.lastUpdated = pinsCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('loadInteractions error:', error);
    const localLikes = localStorage.getItem('entryLikes');
    const localPins = localStorage.getItem('entryPins');
    if (localLikes) likesCache.data = JSON.parse(localLikes);
    if (localPins) pinsCache.data = JSON.parse(localPins);
  }
}

// SUNUCUDA BEĞENİ VE PİN GÜNCELLE - ORİJİNAL KODUNUZ
async function updateInteractionsOnServer(entryId, newLikeCount, newPinCount) {
  const updatedLikes = newLikeCount !== null ? { ...likesCache.data, [entryId]: newLikeCount } : likesCache.data;
  const updatedPins = newPinCount !== null ? { ...pinsCache.data, [entryId]: newPinCount } : pinsCache.data;

  try {
    const response = await fetch("https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '/b/68862fd97b4b8670d8a81945',
        method: 'PUT',
        body: {
          likes: updatedLikes,
          pins: updatedPins
        }
      })
    });

    if (!response.ok) throw new Error('Failed to update data');
    
    likesCache.lastUpdated = pinsCache.lastUpdated = Date.now();
    return await response.json();
  } catch (error) {
    throw new Error('Failed to update data on server');
  }
}
