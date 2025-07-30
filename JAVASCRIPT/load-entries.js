document.addEventListener("DOMContentLoaded", async () => {
  await loadLikes();
  fetch("entries.json")
    .then((res) => res.json())
    .then(processEntries)
    .catch(console.error);
});

const likesCache = {
  data: {},
  pins: {},
  lastUpdated: 0,
  isUpdating: false
};

async function loadLikes() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest`, {
      headers: {
        'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      cache: 'no-cache'
    });
    
    if (!response.ok) throw new Error('Failed to fetch likes');
    
    const result = await response.json();
    likesCache.data = result.likes || {};
    likesCache.pins = result.pins || {};
    likesCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('loadLikes error:', error);
    const localData = localStorage.getItem('entryLikes');
    if (localData) {
      const parsedData = JSON.parse(localData);
      likesCache.data = parsedData.likes || {};
      likesCache.pins = parsedData.pins || {};
    }
  }
}

function processEntries(entries) {
  const container = document.getElementById("entries");
  container.innerHTML = "";

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
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

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", month: "2-digit", day: "2-digit", 
    hour: "2-digit", minute: "2-digit"
  }).replace(",", "");

  const likeCount = likesCache.data[entry.id] || 0;
  const pinCount = likesCache.pins[entry.id] || 0;

  // DÜZELTME: interaction-buttons div'i entry-content'ten sonra gelmeli
  entryDiv.innerHTML = `
    <div class="entry-header">
      <div class="timestamp">
        <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
      </div>
      <div class="entry-id">#${entry.id}</div>
    </div>
    <div class="entry-content">${entry.content}</div>
    <div class="interaction-buttons">
      <div class="daisy-like" data-entry-id="${entry.id}">
        <img src="IMAGES/daisy.svg" class="daisy-icon" alt="Beğen" />
        <span class="like-count">${likeCount}</span>
      </div>
      <div class="pine-pin" data-entry-id="${entry.id}">
        <img src="IMAGES/pine-tree.svg" class="pine-icon" alt="Sabitle" />
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

// Diğer fonksiyonlar (handleLikeClick, handlePinClick, updateLikeOnServer, updatePinsOnServer) 
// önceki mesajdaki gibi aynen kalacak
