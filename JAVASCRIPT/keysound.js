document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('audioPlayed')) {
    const audio = new Audio('/SOUND/keysound.mp3');
    audio.volume = 0.5; // Ses seviyesi (%50)

    // 1. Otomatik başlatmayı dene (tarayıcı izin verirse)
    audio.play().catch(error => {
      // 2. Otomatik başlatma başarısız olursa buton göster
      const audioButton = document.createElement('button');
      audioButton.innerHTML = '🔊 Hoşgeldin Sesi Çal';
      audioButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #0f172a;
        color: white;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
      
      audioButton.addEventListener('click', () => {
        audio.play();
        document.body.removeChild(audioButton);
      });
      
      document.body.appendChild(audioButton);
    });

    // Oynatma tamamlandığında işaretle
    audio.addEventListener('ended', () => {
      localStorage.setItem('audioPlayed', 'true');
    });
  }
});
