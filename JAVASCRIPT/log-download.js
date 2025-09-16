// /JAVASCRIPT/log-download.js

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadCv");

  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Sayfa yönlenmesini engelle
    const endpoint = "https://adembayazit.netlify.app/.netlify/functions/log-visitor";

    fetch("https://ipinfo.io/json?token=68a1229187303a")
      .then(res => res.json())
      .then(ipData => {
        const now = new Date();
        const payload = {
          timestamp: now.toISOString(),
          eventType: "cv_download",
          detail: "Download CV butonuna tıklandı",
          userAgent: navigator.userAgent,
          pageURL: window.location.href,
          ip: ipData.ip || null,
          hostname: ipData.hostname || null,
          city: ipData.city || null,
          region: ipData.region || null,
          country: ipData.country || null,
          loc: ipData.loc || null,
          org: ipData.org || null,
          postal: ipData.postal || null,
          timezone: ipData.timezone || null,
        };

        return fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      })
      .then(() => {
        // Log başarılıysa aynı sekmede yönlendir
        setTimeout(() => {
          window.location.href = "https://www.jobseeker.com/d/6lC0jFnRrJm6mZliwFGSBx/view";
        }, 50); // Hafif gecikme
      })
      .catch(err => {
        console.error("Log gönderimi başarısız:", err);
        // Hata olsa bile yönlendir
        window.location.href = "https://www.jobseeker.com/d/6lC0jFnRrJm6mZliwFGSBx/view";
      });
  });
});
