function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");

  entries.forEach(async (entry) => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const contentText = contentDiv?.textContent?.trim();

    if (!idDiv || !contentText) return;
    if (idDiv.querySelector(".globe-icon")) return;

    const globe = document.createElement("span");
    globe.classList.add("globe-icon");
    globe.textContent = " 🌐";
    globe.style.cursor = "help";
    globe.title = "Çeviriliyor...";

    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tr&dt=t&q=${encodeURIComponent(contentText)}`
      );
      const data = await res.json();
      const translatedText = data?.[0]?.[0]?.[0];
      globe.title = translatedText || "Çevrilemedi";
    } catch (err) {
      globe.title = "Hata oluştu";
    }

    idDiv.appendChild(globe);
  });
}
