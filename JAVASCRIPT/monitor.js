// javascript/monitor.js

(async function() {
  const endpoint = "https://adembayazit.netlify.app/.netlify/functions/log-visitor";
  let ipData = null;

  // 1. IP ve konum bilgisini al
  try {
    const res = await fetch('https://ipinfo.io/json?token=68a1229187303a');
    if (!res.ok) throw new Error('IP info alınamadı');
    ipData = await res.json();
  } catch (e) {
    console.error('IP info fetch hatası:', e);
    ipData = {};
  }

  const sendLog = (eventType, detail) => {
    const now = new Date();

    const payload = {
      timestamp: now.toISOString(),
      userAgent: navigator.userAgent,
      eventType,
      detail,
      ip: ipData.ip || null,
      hostname: ipData.hostname || null,
      city: ipData.city || null,
      region: ipData.region || null,
      country: ipData.country || null,
      loc: ipData.loc || null,
      org: ipData.org || null,
      postal: ipData.postal || null,
      timezone: ipData.timezone || null,
      pageTitle: document.title || null,
      pageURL: window.location.href
    };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(console.error);
  };

  // ✅ SAYFA İLK AÇILDIĞINDA LOG GÖNDER
  sendLog('page_load', 'Sayfa yüklendi ve monitor.js aktif oldu');

  // 2. Ekran görüntüsü vb davranışları dinle

  window.addEventListener('blur', () => {
    sendLog('blur', 'Sayfa odağını kaybetti (muhtemel ekran görüntüsü alma)');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sendLog('visibilitychange_hidden', 'Kullanıcı başka sekmeye geçti veya ekran görüntüsü aldı');
    } else {
      sendLog('visibilitychange_visible', 'Kullanıcı geri döndü');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
      sendLog('keypress', 'PrintScreen tuşuna basıldı');
    }
  });

  let lastMove = Date.now();
  document.addEventListener('mousemove', () => {
    const now = Date.now();
    if (now - lastMove > 3000) {
      sendLog('mousemove_pause', 'Fare 3 saniyeden uzun hareket etmedi');
    }
    lastMove = now;
  });

})();

// monitor.js içinde, en sona ekle
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadCv");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const now = new Date();
      const payload = {
        timestamp: now.toISOString(),
        userAgent: navigator.userAgent,
        eventType: "cv_download",
        detail: "Download CV butonuna tıklandı",
        ip: ipData?.ip || null,
        hostname: ipData?.hostname || null,
        city: ipData?.city || null,
        region: ipData?.region || null,
        country: ipData?.country || null,
        loc: ipData?.loc || null,
        org: ipData?.org || null,
        postal: ipData?.postal || null,
        timezone: ipData?.timezone || null,
        pageTitle: document.title || null,
        pageURL: window.location.href
      };

      fetch("https://adembayazit.netlify.app/.netlify/functions/log-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(console.error);
    });
  }
});
