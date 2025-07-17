fetch("entries.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("entries");

    // Son 10 entry'yi al (en yenilerden başlayarak)
    data.slice(-10).reverse().forEach((entry) => {
      const div = document.createElement("div");
      div.className = "entry";

      // Sadece rakamlarla tarih formatı (örn. 17.07.2025 18:20)
      const time = new Date(entry.date).toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "");

      div.innerHTML = `
        <div class="timestamp">📅 ${time}</div>
        <div class="content">${entry.content}</div>
      `;
      container.appendChild(div);
    });
  });
