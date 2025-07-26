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
