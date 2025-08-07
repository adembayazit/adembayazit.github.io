document.addEventListener("DOMContentLoaded", async () => {
  await loadInteractions();
  await loadEntries(); // Async olarak bekliyoruz
});

// GLOBAL DEĞİŞKENLER
let currentEntries = [];
const likesCache = { data: {}, lastUpdated: 0, isUpdating: false };
const pinsCache = { data: {}, lastUpdated: 0, isUpdating: false };

// ENTRY YÜKLEME
async function loadEntries() {
  try {
    const response = await fetch("https://api.jsonbin.io/v3/b/68933248ae596e708fc2fbbc/latest", {
      headers: {
        'X-Master-Key': '$2a$10$8d7wB08K7w275/WFSjFBQOgEFxZ.MN/Z2L8WCze6bE60QM7UzLMQ6',
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      cache: 'no-cache'
    });
    
    if (!response.ok) throw new Error('API hatası');
    
    const data = await response.json();
    currentEntries = data.records || data;
    processEntries(currentEntries);
    addTranslationIcons(currentEntries); // Mevcut entry'leri direkt veriyoruz
    
  } catch (error) {
    console.error("Entry çekme hatası:", error);
    try {
      const localResponse = await fetch("entries.json");
      currentEntries = await localResponse.json();
      processEntries(currentEntries);
      addTranslationIcons(currentEntries);
    } catch (localError) {
      console.error("Lokal dosya hatası:", localError);
    }
  }
}

// GÜNCELLENMİŞ ÇEVİRİ FONKSİYONU
async function addTranslationIcons(entriesData) {
  const entries = document.querySelectorAll(".entry");
  if (entries.length === 0) return;

  entries.forEach(entry => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const originalContent = contentDiv?.innerHTML?.trim();
    if (!idDiv || !originalContent) return;
    if (idDiv.querySelector(".translation-icon")) return;

    const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
    if (isNaN(idValue)) return;

    // Artık harici fetch yerine mevcut veriyi kullanıyoruz
    const translationEntry = entriesData.find(item => item.id === idValue);
    if (!translationEntry?.content_tr) return; // Çeviri yoksa ikon ekleme

    const icon = document.createElement("span");
    icon.classList.add("translation-icon", "fi", "fi-tr");
    icon.title = "Çeviriyi göster/gizle";
    
    // Dil bayrağı için class ekleme
    const langCode = translationEntry?.lang || 'tr';
    icon.classList.add(`fi-${langCode}`);

    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      icon.classList.toggle("active");
      
      if (icon.classList.contains("active")) {
        contentDiv.innerHTML = translationEntry.content_tr;
      } else {
        contentDiv.innerHTML = originalContent;
      }
    });

    document.addEventListener("click", (e) => {
      if (!icon.contains(e.target)) {
        icon.classList.remove("active");
        contentDiv.innerHTML = originalContent;
      }
    });

    idDiv.appendChild(icon);
  });
}

// DİĞER FONKSİYONLAR (processEntries, createEntryElement, loadInteractions vb.)
// ... (önceki gönderdiğim kodlarla aynı şekilde kalacak) ...
