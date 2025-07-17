(function () {
  const endpoint = "https://adembayazit.netlify.app/.netlify/functions/logVisitor"; // Mevcut log endpoint'in burasıysa

  // Yardımcı: log gönder
  function logSuspicious(eventName) {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "suspicious_event",
        event: eventName,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  }

  // 1. PrintScreen tuşu
  document.addEventListener("keyup", function (e) {
    if (e.key === "PrintScreen") {
      logSuspicious("PrintScreen tuşuna basıldı");
      blurScreenTemporarily();
    }
  });

  // 2. Sayfa odaktan çıkınca (örneğin snipping tool vs)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      logSuspicious("Sayfa odaktan çıktı");
      blurScreenTemporarily();
    }
  });

  // 3. Mouse donması (örneğin ekran seçim sırasında)
  let lastMove = Date.now();
  document.addEventListener("mousemove", () => {
    const now = Date.now();
    if (now - lastMove > 3000) {
      logSuspicious("Mouse 3+ saniye hareket etmedi (ekran yakalama şüphesi)");
      blurScreenTemporarily();
    }
    lastMove = now;
  });

  // 4. Sağ tık ve kopyalama girişimi
  document.addEventListener("contextmenu", () => {
    logSuspicious("Sağ tık menüsü açıldı");
  });

  document.addEventListener("copy", () => {
    logSuspicious("Ctrl+C ile içerik kopyalandı");
  });

  // 5. Sayfayı anlık karartmak
  function blurScreenTemporarily() {
    document.body.style.filter = "blur(8px)";
    setTimeout(() => {
      document.body.style.filter = "none";
    }, 5000); // 5 saniye bulanıklık
  }

})();
