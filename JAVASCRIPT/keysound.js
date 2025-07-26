// keysound.js dosyasına aşağıdaki kodu ekleyin

document.addEventListener('DOMContentLoaded', () => {
    // Daha önce çalındı mı kontrol et
    if (!localStorage.getItem('audioPlayed')) {
        // Ses dosyasını oluştur
        const audio = new Audio('/SOUND/keysound.mp3');
        audio.volume = 0.5; // Ses seviyesi
        
        // Otomatik oynatmayı gecikmeli deneme
        const playAudio = () => {
            audio.play()
                .then(() => {
                    // Başarıyla çalındığında işaretle
                    localStorage.setItem('audioPlayed', 'true');
                })
                .catch(error => {
                    console.log('Ses oynatma hatası:', error.message);
                    
                    // 2 saniye sonra tekrar dene
                    setTimeout(playAudio, 2000);
                });
        };
        
        // İlk denemeyi başlat
        setTimeout(playAudio, 500);
    }
});
