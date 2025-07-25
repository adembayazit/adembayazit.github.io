async function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");
  if (entries.length === 0) return;

  // entries.json'dan çeviri verilerini al
  let translations;
  try {
    const response = await fetch('entries.json');
    if (!response.ok) throw new Error('Veri alınamadı');
    translations = await response.json();
  } catch (err) {
    console.error('JSON yükleme hatası:', err);
    return;
  }

  // Her entry elementini işle
  entries.forEach(entry => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const contentText = contentDiv?.textContent?.trim();

    if (!idDiv || !contentText) return;
    if (idDiv.querySelector(".translation-icon")) return;

    // ID değerini parçala (örneğin "#123" -> 123)
    const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
    if (isNaN(idValue)) return;

    // Çeviriyi bul
    const translationEntry = translations.find(item => item.id === idValue);
    const translatedText = translationEntry?.content_tr || "Çeviri bulunamadı";

    // 🇹🇷 ikonunu oluştur
    const icon = document.createElement("span");
    icon.classList.add("translation-icon");
    icon.textContent = "🇹🇷";
    icon.setAttribute("data-tooltip", translatedText);
    icon.setAttribute("aria-label", "Türkçe çeviri");
    
    // Tooltip stilleri için class ekle (isteğe bağlı)
    icon.style.cursor = "pointer";
    icon.style.marginLeft = "8px";
    
    idDiv.appendChild(icon);
  });
}
