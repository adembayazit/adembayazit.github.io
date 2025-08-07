async function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");
  if (entries.length === 0) return;

  let translations;
  try {
    // JSONBin.io'dan çevirileri çek
    const response = await fetch('https://api.jsonbin.io/v3/b/68933248ae596e708fc2fbbc/latest', {
      headers: {
        'X-Master-Key': '$2a$10$8d7wB08K7w275/WFSjFBQOgEFxZ.MN/Z2L8WCze6bE60QM7UzLMQ6',
        'Content-Type': 'application/json',
        'X-Bin-Meta': 'false'
      },
      cache: 'no-cache'
    });
    
    if (!response.ok) throw new Error('Veri alınamadı');
    const data = await response.json();
    translations = data.records || data; // JSONBin v3 formatı desteği
  } catch (err) {
    console.error('JSON yükleme hatası:', err);
    return;
  }

  entries.forEach(entry => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const originalContent = contentDiv?.innerHTML?.trim();
    if (!idDiv || !originalContent) return;
    if (idDiv.querySelector(".translation-icon")) return;

    const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
    if (isNaN(idValue)) return;

    const translationEntry = Array.isArray(translations) ? 
      translations.find(item => item.id === idValue) :
      translations;

    // Çeviri yoksa ikon ekleme
    if (!translationEntry?.content_tr) return;

    const icon = document.createElement("span");
    icon.classList.add("translation-icon", "fi", "fi-tr");
    icon.title = "Çeviriyi göster/gizle";
    
    // Bayrak ikonu
    const langCode = translationEntry?.lang || 'tr';
    icon.classList.add(`fi-${langCode}`);

    // Toggle çeviri
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      icon.classList.toggle("active");
      contentDiv.innerHTML = icon.classList.contains("active") ? 
        translationEntry.content_tr : 
        originalContent;
    });

    // Dışarı tıklandığında çeviriyi kapat
    document.addEventListener("click", (e) => {
      if (!icon.contains(e.target)) {
        icon.classList.remove("active");
        contentDiv.innerHTML = originalContent;
      }
    });

    idDiv.appendChild(icon);
  });
}
