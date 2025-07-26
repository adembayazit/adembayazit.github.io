document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.1);
    padding: 5px 10px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
  `;

  // IP göstergesi
  const dot = document.createElement('div');
  dot.style.cssText = `
    width: 18px;
    height: 18px;
    background: limegreen;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
  `;

  // Ses çalma butonu
  const btn = document.createElement('button');
  btn.innerHTML = '▶️';
  btn.style.cssText = `
    background: limegreen;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 6px rgba(0,0,0,0.3);
    transition: transform 0.2s;
  `;
  btn.title = "Anahtar sesi çal";

  btn.addEventListener("click", () => {
    const audio = new Audio("/SOUND/keysound.mp3");
    audio.play().catch(err => console.error("Ses çalma hatası:", err));
  });

  // Tooltip (isteğe bağlı)
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position: absolute;
    bottom: 50px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    max-width: 240px;
  `;
  tooltip.innerText = "Ziyaretçinin IP bilgisi burada gösterilir.";

  wrapper.appendChild(dot);
  wrapper.appendChild(btn);
  document.body.appendChild(wrapper);
  document.body.appendChild(tooltip);

  // Tooltip davranışı
  dot.addEventListener("mouseenter", () => tooltip.style.opacity = "1");
  dot.addEventListener("mouseleave", () => tooltip.style.opacity = "0");
});
