document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    bottom: 18px;
    left: 18px;
    z-index: 9999;
  `;

  const btn = document.createElement('button');
  btn.style.cssText = `
    background: limegreen;
    color: white;
    font-size: 20px;
    border: 1px solid white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.2s;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  `;

  // 🔊 İkonu ekle
  const icon = document.createElement('i');
  icon.className = 'bx bx-play';
  icon.style.cssText = `
    font-size: 24px;
    pointer-events: none;
  `;
  btn.appendChild(icon);

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.innerText = "Sesli mesajınız var";
  tooltip.style.cssText = `
    position: absolute;
    bottom: 46px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.85);
    color: white;
    padding: 6px 10px;
    font-size: 13px;
    border-radius: 6px;
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    transition: opacity 0.3s ease;
    font-family: system-ui, sans-serif;
  `;
  btn.appendChild(tooltip);

  btn.addEventListener("mouseenter", () => {
    tooltip.style.opacity = "1";
  });
  btn.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  btn.addEventListener("click", () => {
    const audio = new Audio("/SOUND/keysound.mp3");
    audio.play().catch(err => {
      console.error("Ses çalma hatası:", err);
    });
  });

  wrapper.appendChild(btn);
  document.body.appendChild(wrapper);
});
