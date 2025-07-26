document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    bottom: 18px;
    right: 18px;
    z-index: 9999;
  `;

  const btn = document.createElement('button');
  btn.innerHTML = '▶';
  btn.style.cssText = `
    background: limegreen;
    color: white;
    font-size: 14px;
    border: 1px solid white;
    border-radius: 50%;
    width: 28px;
    height: 28px;
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
    audio.play().catch(err => {
      console.error("Ses çalma hatası:", err);
    });
  });

  wrapper.appendChild(btn);
  document.body.appendChild(wrapper);
});
