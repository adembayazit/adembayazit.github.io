function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");

  entries.forEach((entry) => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const contentText = contentDiv?.textContent?.trim();
    const entryId = idDiv?.textContent?.replace("#", "")?.trim();

    if (!idDiv || !contentText || !entryId) return;
    if (idDiv.querySelector(".translation-icon")) return;

    // Entry ID'ye göre JSON'dan çeviri bul
    const matchedEntry = window.entriesData?.find(
      (e) => String(e.id) === entryId
    );

    if (!matchedEntry || !matchedEntry.content_tr) return;

    // 🇹🇷 ikonunu oluştur
    const icon = document.createElement("span");
    icon.classList.add("translation-icon");
    icon.textContent = "🇹🇷";
    icon.setAttribute("title", "Türkçeye çevir");

    // Tıklanınca içerik Türkçeye dönüşsün
    icon.addEventListener("click", () => {
      contentDiv.textContent = matchedEntry.content_tr;
    });

    idDiv.appendChild(icon);
  });
}
