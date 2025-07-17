fetch("entries.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("entries");

    // En eski 10 entry'yi al (yeni olan alta)
    const latestTen = data.slice(-10); // ters çevirmiyoruz

    latestTen.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "entry";

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

