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

// INTERACTION DATA YÜKLE (likes + pins) - GÜNCELLENMİŞ
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

// SUNUCUDA BEĞENİ VE PİN GÜNCELLE - GÜNCELLENMİŞ
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

// Diğer tüm fonksiyonlar (processEntries, createEntryElement, handleLikeClick, handlePinClick) 
// AYNEN KALIYOR, DEĞİŞMEDİ!
