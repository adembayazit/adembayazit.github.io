// 1. Global cache yapısını güncelle
const likesCache = {
  data: {},
  pins: {}, // Yeni eklenen pin verileri
  lastUpdated: 0,
  isUpdating: false
};

// 2. loadLikes fonksiyonunu güncelle (içerik aynı, sadece pins kısmı eklendi)
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
    likesCache.pins = result.pins || {}; // Yeni eklenen satır
    likesCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('loadLikes error:', error);
    const localData = localStorage.getItem('entryLikes');
    if (localData) {
      const parsedData = JSON.parse(localData);
      likesCache.data = parsedData.likes || {};
      likesCache.pins = parsedData.pins || {}; // Yeni eklenen satır
    }
  }
}

// 3. createEntryElement fonksiyonunu güncelle (pine ikonu eklendi)
function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = `entry ${depth > 0 ? 'child-entry' : ''}`;

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", month: "2-digit", day: "2-digit", 
    hour: "2-digit", minute: "2-digit"
  }).replace(",", "");

  const likeCount = likesCache.data[entry.id] || 0;
  const pinCount = likesCache.pins[entry.id] || 0; // Yeni eklenen pin sayacı

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

  const likeIcon = entryDiv.querySelector(".daisy-icon");
  likeIcon?.addEventListener("click", () => handleLikeClick(entry.id, entryDiv));
  
  // Yeni eklenen pin event listener
  const pinIcon = entryDiv.querySelector(".pine-icon");
  pinIcon?.addEventListener("click", () => handlePinClick(entry.id, entryDiv));
}

// 4. Yeni pin fonksiyonlarını ekle
async function handlePinClick(entryId, entryDiv) {
  if (likesCache.isUpdating) return;
  
  const pinCountSpan = entryDiv.querySelector(".pin-count");
  const pinIcon = entryDiv.querySelector(".pine-icon");
  const currentCount = parseInt(pinCountSpan.textContent) || 0;

  pinCountSpan.textContent = currentCount + 1;
  pinIcon.style.transform = 'scale(1.2)';
  pinCountSpan.classList.add('pinned');
  
  setTimeout(() => {
    pinCountSpan.classList.remove('pinned');
  }, 600);

  likesCache.pins[entryId] = currentCount + 1;
  likesCache.isUpdating = true;

  localStorage.setItem('entryLikes', JSON.stringify({
    likes: likesCache.data,
    pins: likesCache.pins
  }));

  try {
    await updatePinsOnServer(entryId, currentCount + 1);
  } catch (error) {
    console.error('Pin update failed:', error);
    likesCache.pins[entryId] = currentCount;
    pinCountSpan.textContent = currentCount;
  } finally {
    likesCache.isUpdating = false;
    setTimeout(() => pinIcon.style.transform = 'scale(1)', 300);
  }
}

async function updatePinsOnServer(entryId, newCount) {
  const updatedData = { 
    likes: likesCache.data,
    pins: { ...likesCache.pins, [entryId]: newCount }
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
    throw new Error('Failed to update pins on server');
  }

  likesCache.lastUpdated = Date.now();
  return response.json();
}

// 5. Mevcut updateLikeOnServer fonksiyonunu güncelle
async function updateLikeOnServer(entryId, newCount) {
  const updatedData = { 
    likes: { ...likesCache.data, [entryId]: newCount },
    pins: likesCache.pins // Pins verisini de gönder
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
    throw new Error('Failed to update likes on server');
  }

  likesCache.lastUpdated = Date.now();
  return response.json();
}
