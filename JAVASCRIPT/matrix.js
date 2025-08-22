// Canvas elementini seç
        const canvas = document.getElementById("matrixCanvas");
        const ctx = canvas.getContext("2d");

        // Değişkenleri tanımla
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        let columns = Math.floor(canvasWidth / 20);
        let yPositions = [];
        let animationId = null;

        // Karakter dizisi
        const characters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

        // Canvas boyutunu ayarlama fonksiyonu
        function setupCanvas() {
            // Mevcut animasyonu durdur
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Yeni boyutları ayarla
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            // Sütun sayısını yeniden hesapla
            columns = Math.floor(canvasWidth / 20);
            
            // Y pozisyonlarını sıfırla
            yPositions = [];
            for (let i = 0; i < columns; i++) {
                yPositions[i] = Math.random() * canvasHeight;
            }
            
            // Animasyonu yeniden başlat
            renderMatrix();
        }

        // Matrix animasyonunu güncelle
        function updateMatrix() {
            // Arkaplan rengi (saydam siyah)
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Metin rengi ve yazı tipi
            ctx.fillStyle = "#0f0";
            ctx.font = "12px monospace";

            // Her sütun için döngü
            for (let i = 0; i < columns; i++) {
                // Rastgele bir karakter seç
                const character = characters[Math.floor(Math.random() * characters.length)];

                // Mevcut sütunun y pozisyonu
                const y = yPositions[i];

                // Karakteri mevcut pozisyona çiz
                ctx.fillText(character, i * 20, y);

                // Sütunu 20 birim aşağı taşı
                yPositions[i] += 20;

                // Eğer sütun canvas'ın altına ulaştıysa ve rastgele bir koşul sağlandıysa, pozisyonu sıfırla
                if (yPositions[i] > canvasHeight && Math.random() > 0.98) {
                    yPositions[i] = 0;
                }
            }
        }

        // Matrix animasyonunu render et
        function renderMatrix() {
            updateMatrix();
            animationId = requestAnimationFrame(renderMatrix);
        }

        // Olay dinleyicilerini ayarla
        function setupEventListeners() {
            // Pencere yeniden boyutlandırıldığında
            window.addEventListener('resize', function() {
                setupCanvas();
            });

            // Ekran yönü değişikliği (mobil cihazlar için)
            window.addEventListener('orientationchange', function() {
                // Kısa bir gecikme ekleyerek ekranın tam olarak dönmesini bekleyelim
                setTimeout(function() {
                    setupCanvas();
                }, 300);
            });
        }

        // Sayfa yüklendiğinde her şeyi başlat
        function init() {
            setupCanvas();
            setupEventListeners();
        }

        // Sayfa yüklendiğinde init fonksiyonunu çalıştır
        window.addEventListener('load', init);