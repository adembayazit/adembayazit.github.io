// JAVASCRIPT/keysound.js

// Tarayıcı politikalarını aşmak için kapsamlı çözüm
(function() {
    // Daha önce çalındı mı kontrol et
    if (localStorage.getItem('audioPlayed')) return;
    
    // Ses dosyasını oluştur
    const audio = new Audio('/SOUND/keysound.mp3');
    audio.volume = 0.5;
    audio.preload = 'auto';
    
    // Oynatma denemesi
    const tryPlay = () => {
        audio.play()
            .then(() => {
                // Başarılı oynatma
                localStorage.setItem('audioPlayed', 'true');
            })
            .catch(error => {
                // Hata durumunda alternatif yöntemler
                handlePlaybackError(error);
            });
    };
    
    // Oynatma hatası işleyici
    const handlePlaybackError = (error) => {
        console.log('Oynatma hatası:', error.name);
        
        // 1. Yöntem: Gecikmeli yeniden deneme
        setTimeout(tryPlay, 1000);
        
        // 2. Yöntem: Sayfa görünür olduğunda deneme
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                tryPlay();
            }
        }, {once: true});
        
        // 3. Yöntem: Kullanıcı etkileşimi için gizli tetikleyici
        const playOnInteraction = () => {
            tryPlay();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, {once: true});
        document.addEventListener('touchstart', playOnInteraction, {once: true});
        document.addEventListener('keydown', playOnInteraction, {once: true});
        
        // 4. Yöntem: Video elementini kullanarak ses politikalarını atlama
        const video = document.createElement('video');
        video.muted = true;
        video.style.display = 'none';
        
        video.play().then(() => {
            // Video oynatıldıktan sonra sesi çal
            audio.muted = false;
            tryPlay();
        }).catch(e => console.log('Video hatası:', e));
        
        document.body.appendChild(video);
    };
    
    // İlk oynatma denemesi
    setTimeout(tryPlay, 300);
    
    // Sayfa yüklendikten sonra ek deneme
    window.addEventListener('load', () => {
        setTimeout(tryPlay, 1500);
    });
})();
