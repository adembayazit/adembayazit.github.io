fetch("entries.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("entries");
    data.reverse().forEach((entry) => {
      const div = document.createElement("div");
      div.className = "entry";

      const time = new Date(entry.date).toLocaleString("tr-TR", {
        dateStyle: "long",
        timeStyle: "short"
      });

      div.innerHTML = `
        <div class="timestamp">📅 ${time}</div>
        <div class="content">${entry.content}</div>
      `;
      container.appendChild(div);
    });
  });
