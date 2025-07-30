document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadInteractions();
    const response = await fetch("entries.json");
    const entries = await response.json();
    processEntries(entries);
  } catch (error) {
    console.error("Initialization error:", error);
  }
});

const interactionsCache = {
  likes: {},
  pins: {},
  isUpdating: false
};

async function loadInteractions() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest`, {
      headers: {
        'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    if (result.record) {
      interactionsCache.likes = result.record.likes || {};
      interactionsCache.pins = result.record.pins || {};
    }
    console.log("Loaded interactions:", interactionsCache);
  } catch (error) {
    console.error("Failed to load interactions:", error);
    const localData = localStorage.getItem('entryInteractions');
    if (localData) {
      const { likes, pins } = JSON.parse(localData);
      interactionsCache.likes = likes || {};
      interactionsCache.pins = pins || {};
    }
  }
}

function processEntries(entries) {
  const container = document.getElementById("entries");
  if (!container) return;
  container.innerHTML = "";

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const last7Entries = sortedEntries.slice(0, 7);

  // Hiyerarşik yapı oluşturma
  const entriesMap = new Map();
  const parentEntries = [];

  last7Entries.forEach(entry => entriesMap.set(entry.id, { ...entry, children: [] }));
  
  last7Entries.forEach(entry => {
    if (entry.references?.length > 0) {
      const parentId = entry.references[0];
      if (entriesMap.has(parentId)) entriesMap.get(parentId).children.push(entry);
    } else {
      parentEntries.push(entry);
    }
  });

  parentEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(parent => {
      createEntryElement(parent, container, 0);
      entriesMap.get(parent.id)?.children
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(child => createEntryElement(child, container, 1));
    });
}

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;
  entryDiv.dataset.entryId = entry.id;

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", month: "2-digit", day: "2-digit", 
    hour: "2-digit", minute: "2-digit"
  }).replace(",", "");

  const likeCount = interactionsCache.likes[entry.id] || 0;
  const pinCount = interactionsCache.pins[entry.id] || 0;

  entryDiv.innerHTML = `
    <div class="timestamp">
      <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
    </div>
    <div class="entry-id">#${entry.id}</div>
    <div class="content">${entry.content}</div>
    <div class="interaction-buttons">
      <div class="interaction-btn daisy-like">
        <img src="IMAGES/daisy.svg" class="interaction-icon" alt="Beğen" />
        <span class="like-count">${likeCount}</span>
      </div>
      <div class="interaction-btn pine-pin">
        <img src="IMAGES/pine-tree.svg" class="interaction-icon" alt="İğnele" />
        <span class="pin-count">${pinCount}</span>
      </div>
    </div>
  `;

  container.appendChild(entryDiv);

  // Etkileşim butonları
  entryDiv.querySelector('.daisy-like').addEventListener('click', () => {
    handleInteraction('likes', entry.id, entryDiv);
  });
  
  entryDiv.querySelector('.pine-pin').addEventListener('click', () => {
    handleInteraction('pins', entry.id, entryDiv);
  });
}

async function handleInteraction(type, entryId, entryDiv) {
  if (interactionsCache.isUpdating) return;

  const countElement = entryDiv.querySelector(`.${type}-count`);
  const buttonElement = entryDiv.querySelector(`.${type === 'likes' ? 'daisy-like' : 'pine-pin'}`);
  const currentCount = parseInt(countElement.textContent) || 0;
  const newCount = currentCount + 1;

  // Anında görsel feedback
  countElement.textContent = newCount;
  buttonElement.classList.add('active');
  
  // Önbelleği güncelle
  interactionsCache[type][entryId] = newCount;
  interactionsCache.isUpdating = true;

  // LocalStorage'a kaydet
  localStorage.setItem('entryInteractions', JSON.stringify({
    likes: interactionsCache.likes,
    pins: interactionsCache.pins
  }));

  try {
    // API'yi güncelle
    await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945`, {
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
  } catch (error) {
    console.error("Update failed:", error);
    // Hata durumunda geri al
    countElement.textContent = currentCount;
    interactionsCache[type][entryId] = currentCount;
  } finally {
    setTimeout(() => {
      buttonElement.classList.remove('active');
      interactionsCache.isUpdating = false;
    }, 500);
  }
}
