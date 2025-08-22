// Canvas elementini seç
        const canvas = document.getElementById("matrixCanvas");
        const ctx = canvas.getContext("2d");

        // Değişkenleri let ile tanımla (yeniden atanabilir olması için)
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        let columns = Math.floor(canvasWidth / 20);
        let yPositions = [];
        let animationId = null;

        // Create an array of characters
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

        // Update the matrix animation
        function updateMatrix() {
            // Set the background color
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Set the text color and font
            ctx.fillStyle = "green";
            ctx.font = "12px timesnewroman";

            // Loop through each column
            for (let i = 0; i < columns; i++) {
                // Select a random character from the array
                const character = characters[Math.floor(Math.random() * characters.length)];

                // Set the y position of the current column
                const y = yPositions[i];

                // Draw the character at the current position
                ctx.fillText(character, i * 20, y);

                // Move the column down by 20 units
                yPositions[i] += 20;

                // Reset the position if it reaches the bottom of the canvas
                if (yPositions[i] > canvasHeight && Math.random() > 0.98) {
                    yPositions[i] = 0;
                }
            }
        }

        // Render the matrix animation
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