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
    font-size: 18px;
    border: 1px solid white;
    border-radius: 50%;
    width: 21px;
    height: 21px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    padding: 0;
  `;

  // 🎧 Başlangıçta play ikonu
  const icon = document.createElement('i');
  icon.className = 'bx bx-play';
  icon.style.cssText = `
    font-size: 18px;
    pointer-events: none;
    margin-top: 1px;
  `;
  btn.appendChild(icon);

  // 🛠 Tooltip (hover yazısı)
  const tooltip = document.createElement("div");
  tooltip.innerText = "Acoustic Steganography";
  tooltip.style.cssText = `
    position: absolute;
    bottom: 38px;
    right: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.85);
    color: white;
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 5px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    font-family: system-ui, sans-serif;
  `;
  btn.appendChild(tooltip);

  btn.addEventListener("mouseenter", () => {
    tooltip.style.opacity = "1";
  });
  btn.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  // 🎵 Ses oynatıcı
  const audio = new Audio("/SOUND/klavyesound.mp3");
  audio.loop = true;
  audio.volume = 1.0;

  let isPlaying = false;

  // 👆 Butona tıklama: oynat / durdur
  btn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      icon.className = 'bx bx-play';
    } else {
      audio.play().then(() => {
        isPlaying = true;
        icon.className = 'bx bx-pause';
      }).catch(err => {
        console.error("Ses başlatılamadı:", err);
      });
    }
  });

  wrapper.appendChild(btn);
  document.body.appendChild(wrapper);
});
