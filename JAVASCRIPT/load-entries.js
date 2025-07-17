<script>
fetch("entries.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("entries");

    // Entry'leri ana entry ve alt entry olarak grupla
    const grouped = {};
    data.forEach(entry => {
      if (entry.parentId === null) {
        grouped[entry.id] = { parent: entry, replies: [] };
      } else {
        if (!grouped[entry.parentId]) {
          grouped[entry.parentId] = { parent: null, replies: [] };
        }
        grouped[entry.parentId].replies.push(entry);
      }
    });

    // Grupları tarihe göre sırala (yeni en üstte)
    const sortedGroups = Object.values(grouped)
      .filter(group => group.parent)
      .sort((a, b) => new Date(b.parent.date) - new Date(a.parent.date))
      .slice(0, 10);

    // HTML'e yaz
    sortedGroups.forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "entry-group";

      const mainEntry = document.createElement("div");
      mainEntry.className = "entry";

      const time = new Date(group.parent.date).toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", "");

      mainEntry.innerHTML = `
        <div class="id-badge">Makale No: ${group.parent.id}</div>
        <div class="timestamp">📅 ${time}</div>
        <div class="content">${group.parent.content}</div>
      `;

      groupDiv.appendChild(mainEntry);

      group.replies
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(reply => {
          const replyDiv = document.createElement("div");
          replyDiv.className = "entry reply";

          const rtime = new Date(reply.date).toLocaleString("tr-TR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }).replace(",", "");

          replyDiv.innerHTML = `
            <div class="timestamp">📅 ${rtime}</div>
            <div class="content">${reply.content}</div>
          `;
          groupDiv.appendChild(replyDiv);
        });

      container.appendChild(groupDiv);
    });
  });
</script>

