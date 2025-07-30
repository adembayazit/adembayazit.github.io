document.addEventListener("DOMContentLoaded", async () => {
  await loadInteractions();
  fetch("entries.json")
    .then(res => res.json())
    .then(processEntries)
    .catch(console.error);
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
    interactionsCache.likes = result.record?.likes || {};
    interactionsCache.pins = result.record?.pins || {};
  } catch (error) {
    console.error('API load error:', error);
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
  container.innerHTML = "";

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const last7Entries = sortedEntries.slice(0, 7);

  // Hiyerarşik yapı oluşturma kodu aynı
  // ... (önceki hiyerarşik yapı kodunu buraya ekleyin)

  parentEntries.forEach(parent => {
    createEntryElement(parent, container, 0);
    const children = entriesMap.get(parent.id)?.children || [];
    children.forEach(child => createEntryElement(child, container, 1));
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
      <div class="daisy-like">
        <img src="IMAGES/daisy.svg" class="daisy-icon" alt="Beğen" />
        <span class="like-count">${likeCount}</span>
      </div>
      <div class="pine-pin">
        <img src="IMAGES/pine-tree.svg" class="pine-icon" alt="İğnele" />
        <span class="pin-count">${pinCount}</span>
      </div>
    </div>
  `;

  container.appendChild(entryDiv);

  // Buton event listener'ları
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
    console.error('Update error:', error);
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
