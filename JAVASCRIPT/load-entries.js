
document.addEventListener("DOMContentLoaded", async () => {
  // Önce beğenileri yükle
  await loadLikes();
  
  // Sonra entry'leri yükle
  fetch("entries.json")
    .then((res) => res.json())
    .then(processEntries)
    .catch(console.error);
});

// Global önbellek ve durum yönetimi
const likesCache = {
  data: {},
  lastUpdated: 0,
  isUpdating: false
};

// Beğenileri yükle (sayfa yüklendiğinde)
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
    likesCache.lastUpdated = Date.now();
  } catch (error) {
    console.error('loadLikes error:', error);
    // LocalStorage'dan yedek yükle
    const localLikes = localStorage.getItem('entryLikes');
    if (localLikes) {
      likesCache.data = JSON.parse(localLikes);
    }
  }
}

// Entry'leri işle
function processEntries(entries) {
  const container = document.getElementById("entries");
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
    year: "numeric", month: "2-digit", day: "2-digit", 
    hour: "2-digit", minute: "2-digit"
  }).replace(",", "");

  // Beğeni sayısını önbellekten al
  const likeCount = likesCache.data[entry.id] || 0;

  entryDiv.innerHTML = `
    <div class="timestamp">
      <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
    </div>
    <div class="entry-id">#${entry.id}</div>
    <div class="content">${entry.content}</div>
    <div class="daisy-like" data-entry-id="${entry.id}">
      <img src="IMAGES/daisy.svg" class="daisy-icon" alt="Beğen" />
      <span class="like-count">${likeCount}</span>
    </div>
  `;

  container.appendChild(entryDiv);

  // Beğeni butonu event listener
  const likeIcon = entryDiv.querySelector(".daisy-icon");
  likeIcon?.addEventListener("click", () => handleLikeClick(entry.id, entryDiv));
}

// Beğeni tıklama işlemi
async function handleLikeClick(entryId, entryDiv) {
  if (likesCache.isUpdating) return;
  
  const likeCountSpan = entryDiv.querySelector(".like-count");
  const likeIcon = entryDiv.querySelector(".daisy-icon");
  const currentCount = parseInt(likeCountSpan.textContent) || 0;

  // 1. Anında görsel feedback
  likeCountSpan.textContent = currentCount + 1;
  likeIcon.style.transform = 'scale(1.2)';
  likeCountSpan.style.animation = 'pulse 0.3s';
  
  // 2. Önbelleği güncelle
  likesCache.data[entryId] = currentCount + 1;
  likesCache.isUpdating = true;

  // 3. LocalStorage'a yedekle
  localStorage.setItem('entryLikes', JSON.stringify(likesCache.data));

  try {
    // 4. API'ye güncelleme gönder (arka planda)
    await updateLikeOnServer(entryId, currentCount + 1);
  } catch (error) {
    console.error('Like update failed:', error);
    // Hata durumunda geri al
    likesCache.data[entryId] = currentCount;
    likeCountSpan.textContent = currentCount;
  } finally {
    likesCache.isUpdating = false;
    setTimeout(() => likeIcon.style.transform = 'scale(1)', 300);
  }
}

// Sunucuda beğeniyi güncelle (arka planda)
async function updateLikeOnServer(entryId, newCount) {
  const updatedData = { ...likesCache.data, [entryId]: newCount };
  
  const response = await fetch(`https://api.jsonbin.io/v3/b/68862fd97b4b8670d8a81945`, {
    method: 'PUT',
    headers: {
      'X-Master-Key': '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ likes: updatedData })
  });

  if (!response.ok) {
    throw new Error('Failed to update likes on server');
  }

  // Önbellek güncelleme zamanını kaydet
  likesCache.lastUpdated = Date.now();
  return response.json();
}
