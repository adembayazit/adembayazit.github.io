// javascript/monitor.js

(function() {
  const endpoint = "https://adembayazit.netlify.app/.netlify/functions/log-visitor"; // Aynı endpoint'e yolluyorsak field ekleyeceğiz

  const sendLog = (eventType, detail) => {
    const now = new Date();
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: now.toISOString(),
        userAgent: navigator.userAgent,
        eventType,
        detail
      })
    }).catch(console.error);
  };

  // 1. Sayfa bulanıklaştı (blur)
  window.addEventListener("blur", () => {
    sendLog("blur", "Sayfa odağını kaybetti (muhtemel ekran görüntüsü alma)");
  });

  // 2. Sayfa yeniden odaklandı
  window.addEventListener("focus", () => {
    sendLog("focus", "Sayfa yeniden odaklandı");
  });

  // 3. Görünürlük değişti (örn: başka sekmeye geçti)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      sendLog("visibilitychange_hidden", "Kullanıcı başka sekmeye geçti veya ekran görüntüsü aldı");
    } else {
      sendLog("visibilitychange_visible", "Kullanıcı tekrar geri döndü");
    }
  });

  // 4. PrtScn kısayolu algılama (Windows)
  document.addEventListener("keydown", (e) => {
    if (e.key === "PrintScreen") {
      sendLog("keypress", "PrintScreen tuşuna basıldı");
    }
    // Bazı OS'lerde ekran görüntüsü Shift+Cmd+4 gibi olabilir ama web'de algılanamaz
  });

  // 5. Mouse freeze tespiti (örnek, isteğe bağlı)
  let lastMove = Date.now();
  document.addEventListener("mousemove", () => {
    const now = Date.now();
    if (now - lastMove > 3000) {
      sendLog("mousemove_pause", "Fare 3 saniyeden uzun süre hareket etmedi");
    }
    lastMove = now;
  });

})();
