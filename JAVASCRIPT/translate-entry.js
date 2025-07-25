function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");

  entries.forEach(async (entry) => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const contentText = contentDiv?.textContent?.trim();

    if (!idDiv || !contentText) return;

    if (idDiv.querySelector(".translation-icon")) return;

    // 🇹🇷 ikonunu oluştur
    const icon = document.createElement("span");
    icon.classList.add("translation-icon");
    icon.textContent = "🇹🇷";
    icon.setAttribute("data-tooltip", "Çeviri yükleniyor...");

    // Çeviri al
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tr&dt=t&q=${encodeURIComponent(contentText)}`
      );
      const data = await res.json();
      const translated = data?.[0]?.[0]?.[0];

      if (translated) {
        icon.setAttribute("data-tooltip", translated);
      } else {
        icon.setAttribute("data-tooltip", "Çevrilemedi");
      }
    } catch (err) {
      icon.setAttribute("data-tooltip", "Hata oluştu");
      console.error("Çeviri hatası:", err);
    }

    idDiv.appendChild(icon);
  });
}
