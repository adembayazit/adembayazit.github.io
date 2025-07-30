document.addEventListener("DOMContentLoaded", async () => {
  await loadInteractions();
  fetch("entries.json")
    .then((res) => res.json())
    .then(processEntries)
    .catch(console.error);
});

const interactionsCache = {
  likes: {},
  pins: {},
  lastUpdated: 0,
  isUpdating: false
};

async function loadInteractions() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945/latest`, {
      headers: {
        'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
        'X-Bin-Meta': 'false'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch interactions');
    
    const result = await response.json();
    // JSON yapınıza göre doğrudan erişim
    interactionsCache.likes = result.record?.likes || {};
    interactionsCache.pins = result.record?.pins || {};
    interactionsCache.lastUpdated = Date.now();
    
    console.log('Loaded interactions:', interactionsCache);
  } catch (error) {
    console.error('loadInteractions error:', error);
    const localData = localStorage.getItem('entryInteractions');
    if (localData) {
      const parsed = JSON.parse(localData);
      interactionsCache.likes = parsed.likes || {};
      interactionsCache.pins = parsed.pins || {};
    }
  }
}

function processEntries(entries) {
  const container = document.getElementById("entries");
  if (!container) return;
  
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
}

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;

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

  // Beğeni butonu event listener
  entryDiv.querySelector(".daisy-like")?.addEventListener("click", (e) => {
    e.stopPropagation();
    handleInteractionClick('likes', entry.id, entryDiv);
  });
  
  // Pin butonu event listener
  entryDiv.querySelector(".pine-pin")?.addEventListener("click", (e) => {
    e.stopPropagation();
    handleInteractionClick('pins', entry.id, entryDiv);
  });
}

async function handleInteractionClick(type, entryId, entryDiv) {
  if (interactionsCache.isUpdating) {
    console.log('Update already in progress');
    return;
  }
  
  const button = entryDiv.querySelector(`.${type === 'likes' ? 'daisy-like' : 'pine-pin'}`);
  const countSpan = entryDiv.querySelector(`.${type}-count`);
  const currentCount = parseInt(countSpan.textContent) || 0;
  const newCount = currentCount + 1;

  // Anında görsel feedback
  countSpan.textContent = newCount;
  button.classList.add('animating');
  
  // Önbellek güncelleme
  interactionsCache[type][entryId] = newCount;
  interactionsCache.isUpdating = true;

  // LocalStorage yedek
  localStorage.setItem('entryInteractions', JSON.stringify({
    likes: interactionsCache.likes,
    pins: interactionsCache.pins
  }));

  try {
    // API güncelleme
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    interactionsCache.lastUpdated = Date.now();
    console.log(`${type} updated successfully`);
  } catch (error) {
    console.error('Update failed:', error);
    // Hata durumunda geri al
    countSpan.textContent = currentCount;
    interactionsCache[type][entryId] = currentCount;
    button.classList.remove('animating');
  } finally {
    interactionsCache.isUpdating = false;
    setTimeout(() => {
      button.classList.remove('animating');
    }, 600);
  }
}
