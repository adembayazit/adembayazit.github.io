async function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");
  if (entries.length === 0) return;

  // Mevcut entry'leri kullan (artık ayrıca fetch'e gerek yok)
  const translations = currentEntries;

  entries.forEach(entry => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const originalContent = contentDiv?.innerHTML?.trim();
    if (!idDiv || !originalContent) return;
    
    // Eğer zaten bir ikon varsa atla
    if (idDiv.querySelector(".translation-icon")) return;

    const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
    if (isNaN(idValue)) return;

    // Entry'yi bul
    const translationEntry = translations.find(item => item.id === idValue);
    
    // Çeviri yoksa ve content_tr de yoksa ikon EKLEME
    if (!translationEntry?.content_tr) return;

    const icon = document.createElement("span");
    icon.classList.add("translation-icon", "fi", "fi-tr");
    icon.title = "Çeviriyi göster/gizle";
    
    // Bayrak ikonu (dil koduna göre)
    const langCode = translationEntry?.lang || 'tr';
    icon.classList.add(`fi-${langCode}`);

    // Toggle çeviri işlevi
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      icon.classList.toggle("active");
      
      if (icon.classList.contains("active")) {
        // Eğer çeviri varsa göster
        if (translationEntry.content_tr) {
          contentDiv.innerHTML = translationEntry.content_tr;
        }
      } else {
        // Orijinal içeriğe dön
        contentDiv.innerHTML = originalContent;
      }
    });

    // Dokümana tıklayınca çeviriyi kapat
    document.addEventListener("click", (e) => {
      if (!icon.contains(e.target) && !contentDiv.contains(e.target)) {
        icon.classList.remove("active");
        contentDiv.innerHTML = originalContent;
      }
    });

    idDiv.appendChild(icon);
  });
}
