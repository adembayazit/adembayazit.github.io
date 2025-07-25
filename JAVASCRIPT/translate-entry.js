function addTranslationIcons() {
  const entries = document.querySelectorAll(".entry");

  entries.forEach((entry) => {
    const idDiv = entry.querySelector(".entry-id");
    const contentDiv = entry.querySelector(".content");
    const contentText = contentDiv?.innerHTML?.trim();

    if (!idDiv || !contentText) return;

    // Zaten ikon varsa tekrar ekleme
    if (idDiv.querySelector(".translation-icon")) return;

    // Türkçe içerik kontrolü (data-tr veya dataset.tr)
    const contentTr = entry.dataset.tr || entry.getAttribute("data-tr");

    if (!contentTr) return; // Türkçesi yoksa ikon gösterme

    // 🇹🇷 ikonunu oluştur
    const icon = document.createElement("span");
    icon.classList.add("translation-icon");
    icon.textContent = "🇹🇷";
    icon.title = "Türkçeye çevir";
    icon.style.cssText = `
      display: inline-block;
      margin-left: 8px;
      background: limegreen;
      color: white;
      border-radius: 50%;
      padding: 4px 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    // Hover ile tersine dönüş
    icon.addEventListener("mouseenter", () => {
      icon.style.background = "white";
      icon.style.color = "limegreen";
    });

    icon.addEventListener("mouseleave", () => {
      icon.style.background = "limegreen";
      icon.style.color = "white";
    });

    // Tıklanınca içeriği Türkçe ile değiştir
    icon.addEventListener("click", () => {
      contentDiv.innerHTML = contentTr;
    });

    // ID div'ine ekle
    idDiv.appendChild(icon);
  });
}
