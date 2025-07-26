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

    // Toggle çeviri
    let isTranslated = false;
    icon.addEventListener("click", () => {
      if (!isTranslated && translationEntry?.content_tr) {
        contentDiv.innerHTML = translationEntry.content_tr;
        isTranslated = true;
      } else {
        contentDiv.innerHTML = originalContent;
        isTranslated = false;
      }
    });

    idDiv.appendChild(icon);
  });
}
