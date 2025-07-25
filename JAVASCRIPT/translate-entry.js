document.addEventListener("DOMContentLoaded", () => {
  const entries = document.querySelectorAll(".entry");

  entries.forEach(async (entry) => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const contentText = contentDiv?.textContent?.trim();

    if (!idDiv || !contentText) return;

    // 🌐 ikonunu oluştur
    const globe = document.createElement("span");
    globe.textContent = " 🌐";
    globe.style.cursor = "help";
    globe.title = "Çevriliyor...";

    // Çeviri al
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tr&dt=t&q=${encodeURIComponent(contentText)}`
      );
      const data = await res.json();
      const translatedText = data?.[0]?.[0]?.[0];

      // Tooltip'i güncelle
      if (translatedText) {
        globe.title = translatedText;
      } else {
        globe.title = "Çevrilemedi";
      }
    } catch (err) {
      globe.title = "Hata oluştu";
    }

    // ID'nin yanına ekle
    idDiv.appendChild(globe);
  });
});
