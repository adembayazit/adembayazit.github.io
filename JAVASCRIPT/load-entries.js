// JSONBin.io ayarları
const JSONBIN_BIN_ID = '68862fd97b4b8670d8a81945'; // JSONBin.io'dan aldığınız bin ID
const JSONBIN_API_KEY = '$2a$10$eY1/HMTP6ppkyuDLWsZGteqd7gRPXZ1YcjWc.bdfd3s6CdNElmwFC'; // JSONBin.io API key
const LIKES_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Başlangıç veri yapısı
const INITIAL_DATA = {
  likes: {}
};

document.addEventListener("DOMContentLoaded", async () => {
  // Önce beğeni verilerini yükle
  await initializeLikesData();
  
  // Sonra entry'leri yükle
  fetch("entries.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("entries");
      container.innerHTML = "";

      const sortedEntries = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const last7Entries = sortedEntries.slice(0, 7);

      const entriesMap = new Map();
      const parentEntries = [];

      last7Entries.forEach(entry => {
        entriesMap.set(entry.id, { ...entry, children: [] });
      });

      last7Entries.forEach(entry => {
        if (entry.references && entry.references.length > 0) {
          const parentId = entry.references[0];
          if (entriesMap.has(parentId)) {
            entriesMap.get(parentId).children.push(entry);
          }
        } else {
          parentEntries.push(entry);
        }
      });

      parentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

      parentEntries.forEach(parent => {
        createEntryElement(parent, container, 0);
        const children = entriesMap.get(parent.id)?.children || [];
        children.sort((a, b) => new Date(a.date) - new Date(b.date));
        children.forEach(child => {
          createEntryElement(child, container, 1);
        });
      });

      addTranslationIcons?.();
    });
});

async function initializeLikesData() {
  try {
    const response = await fetch(LIKES_URL, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Eğer bin boşsa veya geçersiz yapıdaysa, başlangıç verisini oluştur
    if (!response.ok || response.status === 404) {
      await fetch(LIKES_URL, {
        method: 'PUT',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(INITIAL_DATA)
      });
    }
  } catch (error) {
    console.error('initializeLikesData error:', error);
  }
}

async function getLikesData() {
  try {
    const response = await fetch(LIKES_URL, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch likes');
    const data = await response.json();
    return data.record?.likes || {};
  } catch (error) {
    console.error('getLikesData error:', error);
    return {};
  }
}

async function updateLikes(entryId) {
  try {
    // Mevcut tüm veriyi al
    const response = await fetch(LIKES_URL, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch current data');
    const currentData = await response.json();
    
    // Veri yapısını kontrol et ve gerekirse başlat
    const likesData = currentData.record?.likes || {};
    
    // Yeni beğeni sayısını hesapla
    const newCount = (likesData[entryId] || 0) + 1;
    
    // Güncellenmiş veriyi hazırla
    const updatedData = {
      ...currentData.record,
      likes: {
        ...likesData,
        [entryId]: newCount
      }
    };
    
    // JSONBin.io'ya güncelleme gönder
    const updateResponse = await fetch(LIKES_URL, {
      method: 'PUT',
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!updateResponse.ok) throw new Error('Failed to update likes');
    return newCount;
  } catch (error) {
    console.error('updateLikes error:', error);
    throw error;
  }
}

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = "entry";
  if (depth > 0) entryDiv.classList.add("child-entry");

  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  }).replace(",", "");

  entryDiv.innerHTML = `
    <div class="timestamp"><span class="fa-solid fa-bug bug-iconentry"></span> ${time}</div>
    <div class="entry-id">#${entry.id}</div>
    <div class="content">${entry.content}</div>

    <!-- 🌼 Papatya Beğeni Butonu -->
    <div class="daisy-like" data-entry-id="${entry.id}">
      <img src="IMAGES/daisy.svg" class="daisy-icon" alt="Beğen" />
      <span class="like-count">0</span>
    </div>
  `;

  container.appendChild(entryDiv);

  const likeContainer = entryDiv.querySelector(".daisy-like");
  const likeCountSpan = likeContainer.querySelector(".like-count");
  const likeIcon = likeContainer.querySelector(".daisy-icon");

  // Beğeni sayısını yükle
  getLikesData().then(likesData => {
    likeCountSpan.textContent = likesData[entry.id] || 0;
  }).catch(() => {
    likeCountSpan.textContent = '0';
  });

  // Tıklama eventi
  likeIcon.addEventListener("click", async () => {
    // Animasyon ekle
    likeIcon.style.transform = 'scale(1.2)';
    likeIcon.style.transition = 'transform 0.3s ease';
    
    try {
      const newCount = await updateLikes(entry.id);
      likeCountSpan.textContent = newCount;
      
      // Animasyon efekti
      likeCountSpan.style.animation = 'none';
      void likeCountSpan.offsetWidth; // Reflow
      likeCountSpan.style.animation = 'pulse 0.5s';
    } catch (error) {
      console.error('Like update failed:', error);
      // Fallback: LocalStorage
      const likesData = JSON.parse(localStorage.getItem('entryLikes')) || {};
      likesData[entry.id] = (likesData[entry.id] || 0) + 1;
      localStorage.setItem('entryLikes', JSON.stringify(likesData));
      likeCountSpan.textContent = likesData[entry.id];
    } finally {
      setTimeout(() => {
        likeIcon.style.transform = 'scale(1)';
      }, 300);
    }
  });
}
