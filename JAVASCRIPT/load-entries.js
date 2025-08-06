document.addEventListener("DOMContentLoaded", async () => {
  await loadInteractions();

  fetch("entries.json")
    .then((res) => res.json())
    .then(processEntries)
    .catch(console.error);
});

// GLOBAL CACHES
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

// INTERACTION DATA YÜKLE (likes + pins)
async function loadInteractions() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest`, {
      headers: {
        'X-Master-Key': '$2a$10$8d7wB08K7w275/WFSjFBQOgEFxZ.MN/Z2L8WCze6bE60QM7UzLMQ6',
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      cache: 'no-cache'
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

// ENTRY'LERİ YÜKLE VE GÖSTER
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

// ENTRY ELEMENTİ OLUŞTUR
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

// BEĞENİ TIKLAMA
async function handleLikeClick(entryId, entryDiv) {
  if (likesCache.isUpdating) return;

  const likeCountSpan = entryDiv.querySelector(".like-count");
  const likeIcon = entryDiv.querySelector(".daisy-icon");
  const currentCount = parseInt(likeCountSpan.textContent) || 0;

  likeCountSpan.textContent = currentCount + 1;
  likeIcon.style.transform = 'scale(1.2)';
  likeCountSpan.style.animation = 'pulse 0.3s';

  likesCache.data[entryId] = currentCount + 1;
  likesCache.isUpdating = true;

  localStorage.setItem('entryLikes', JSON.stringify(likesCache.data));

  try {
    await updateInteractionsOnServer(entryId, currentCount + 1, null);
  } catch (error) {
    console.error('Like update failed:', error);
    likesCache.data[entryId] = currentCount;
    likeCountSpan.textContent = currentCount;
  } finally {
    likesCache.isUpdating = false;
    setTimeout(() => likeIcon.style.transform = 'scale(1)', 300);
  }
}

// PİN TIKLAMA
async function handlePinClick(entryId, entryDiv) {
  if (pinsCache.isUpdating) return;

  const pinCountSpan = entryDiv.querySelector(".pin-count");
  const pinIcon = entryDiv.querySelector(".pine-icon");
  const currentCount = parseInt(pinCountSpan.textContent) || 0;

  pinCountSpan.textContent = currentCount + 1;
  pinIcon.classList.add("pinned");

  pinsCache.data[entryId] = currentCount + 1;
  pinsCache.isUpdating = true;

  localStorage.setItem('entryPins', JSON.stringify(pinsCache.data));

  try {
    await updateInteractionsOnServer(entryId, null, currentCount + 1);
  } catch (error) {
    console.error('Pin update failed:', error);
    pinsCache.data[entryId] = currentCount;
    pinCountSpan.textContent = currentCount;
  } finally {
    pinsCache.isUpdating = false;
    setTimeout(() => pinIcon.classList.remove("pinned"), 600);
  }
}

// SUNUCUDA BEĞENİ VE PİN GÜNCELLE
async function updateInteractionsOnServer(entryId, newLikeCount, newPinCount) {
  const updatedLikes = newLikeCount !== null ? { ...likesCache.data, [entryId]: newLikeCount } : likesCache.data;
  const updatedPins = newPinCount !== null ? { ...pinsCache.data, [entryId]: newPinCount } : pinsCache.data;

  const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945`, {
    method: 'PUT',
    headers: {
      'X-Master-Key': '$2a$10$8d7wB08K7w275/WFSjFBQOgEFxZ.MN/Z2L8WCze6bE60QM7UzLMQ6',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      likes: updatedLikes,
      pins: updatedPins
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update data on server');
  }

  likesCache.lastUpdated = pinsCache.lastUpdated = Date.now();
  return response.json();
}
