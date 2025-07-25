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
    const contentText = contentDiv?.textContent?.trim();

    if (!idDiv || !contentText) return;
    if (idDiv.querySelector(".translation-icon")) return;

    const idValue = parseInt(idDiv.textContent.replace(/\D/g, ''));
    if (isNaN(idValue)) return;

    const translationEntry = translations.find(item => item.id === idValue);
    const translatedText = translationEntry?.content_tr || "Çeviri bulunamadı";

    const icon = document.createElement("span");
    icon.classList.add("translation-icon");
    icon.textContent = "🇹🇷";
    icon.setAttribute("data-tooltip", translatedText);
    icon.setAttribute("aria-label", "Türkçe çeviri");

    // ⬇ Tooltip davranışı (hover ile gösterme)
    icon.addEventListener("mouseenter", () => {
      if (icon.querySelector(".tooltip-box")) return;

      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip-box");
      tooltip.innerHTML = translatedText;
      icon.appendChild(tooltip);
      icon.classList.add("show-tooltip");
    });

    icon.addEventListener("mouseleave", () => {
      const tooltip = icon.querySelector(".tooltip-box");
      if (tooltip) tooltip.remove();
      icon.classList.remove("show-tooltip");
    });

    // ⬇ Tıklayınca içeriği Türkçeye çevir
    icon.addEventListener("click", () => {
      if (translationEntry?.content_tr) {
        contentDiv.innerHTML = translationEntry.content_tr;
      }
    });

    idDiv.appendChild(icon);
  });
}
