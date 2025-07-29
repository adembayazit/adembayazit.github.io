async function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");
  if (entries.length === 0) return;

  let translations;
  try {
    const response = await fetch('entries.json');
    if (!response.ok) throw new Error('Veri alınamadı');
    translations = await response.json();
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

    const translationEntry = translations.find(item => item.id === idValue);
    const translatedText = translationEntry?.content_tr || "Çeviri bulunamadı";

    const icon = document.createElement("span");
    icon.classList.add("translation-icon", "fi", "fi-tr");
    
    // Bayrak ikonu için ülke kodu belirleme (örneğin İngilizce için fi-gb)
    const langCode = translationEntry?.lang || 'tr'; // Varsayılan Türkçe
    icon.classList.add(`fi-${langCode}`);

    // Toggle çeviri ve animasyon
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Animasyonu tetikle
      icon.classList.toggle("active");
      
      // Çeviri işlemi
      if (icon.classList.contains("active") && translationEntry?.content_tr) {
        contentDiv.innerHTML = translationEntry.content_tr;
      } else {
        contentDiv.innerHTML = originalContent;
      }
    });

    // Document click event to close translation
    document.addEventListener("click", (e) => {
      if (!icon.contains(e.target)) {
        icon.classList.remove("active");
        contentDiv.innerHTML = originalContent;
      }
    });

    idDiv.appendChild(icon);
  });
}
