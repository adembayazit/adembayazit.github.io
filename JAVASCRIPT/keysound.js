// IP göstergesi ve ses butonu kapsayıcısı
const dot = document.createElement('div');
dot.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: auto;
  height: 30px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 9999;
`;

// Lime yeşil daire (IP göstergesi)
const circle = document.createElement('div');
circle.style.cssText = `
  width: 18px;
  height: 18px;
  background: limegreen;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(50, 205, 50, 0.8);
  cursor: pointer;
`;

// Ses butonu (▶️ ikonlu)
const playButton = document.createElement('button');
playButton.textContent = '▶️';
playButton.style.cssText = `
  background: limegreen;
  border: none;
  color: white;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0,0,0,0.3);
  transition: transform 0.2s;
`;
playButton.title = "Anahtar Sesi Çal";

// Ses çalma olayı
playButton.addEventListener("click", () => {
  const audio = new Audio('/SOUND/keysound.mp3');
  audio.play().catch(err => console.error("Ses çalma hatası:", err));
});

// Tooltip kutusu (isteğe bağlı, hover ile açıklama)
const tooltip = document.createElement('div');
tooltip.style.cssText = `
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  min-width: 240px;
  backdrop-filter: blur(5px);
`;
tooltip.textContent = 'Ziyaretçi IP burada gösterilebilir veya log bilgisi.';

// Tooltip görünürlüğü
circle.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
circle.addEventListener('mouseleave', () => tooltip.style.opacity = '0');

// Her şeyi birleştir
dot.appendChild(circle);
dot.appendChild(playButton);
dot.appendChild(tooltip);
document.body.appendChild(dot);
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
  document.body.appendC
