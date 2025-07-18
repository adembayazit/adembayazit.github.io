document.addEventListener("DOMContentLoaded", () => {
  fetch("entries.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("entries");
      container.innerHTML = '';

      // 1. Tüm entry'leri tarihe göre sırala (yeniden eskiye)
      const sortedEntries = data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      // 2. Sadece son 7 entry'i al
      const last7Entries = sortedEntries.slice(0, 7);

      // 3. Parent-child ilişkilerini kur (sadece son 7 için)
      const entriesMap = new Map();
      const parentEntries = [];
      
      // Önce tüm entry'leri map'e ekle
      last7Entries.forEach(entry => {
        entriesMap.set(entry.id, {...entry, children: []});
      });
      
      // Child-parent ilişkilerini kur
      last7Entries.forEach(entry => {
        if (entry.references && entry.references.length > 0) {
          const parentId = entry.references[0];
          if (entriesMap.has(parentId)) {
            entriesMap.get(parentId).children.push(entry);
          }
        } else {
          parentEntries.push(entry);
        }
      });

      // 4. Parent entry'leri tarihe göre sırala (yeniden eskiye)
      parentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 5. Entry'leri oluştur (sadece son 7)
      parentEntries.forEach(parent => {
        // Parent entry'i oluştur
        createEntryElement(parent, container, 0);
        
        // Child entry'leri bul ve tarihe göre sırala (eskiden yeniye)
        const children = entriesMap.get(parent.id)?.children || [];
        children.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Child entry'leri oluştur
        children.forEach(child => {
          createEntryElement(child, container, 1);
        });
      });
    });
});

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = "entry";
  
  // Girinti ekle
  if (depth > 0) {
    entryDiv.classList.add("child-entry");
  }
  
  const time = new Date(entry.date).toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).replace(",", "");

  entryDiv.innerHTML = `
    <div class="timestamp">🗓 ${time}</div>
    <div class="entry-id">#${entry.id}</div>
    <div class="content">${entry.content}</div>
  `;
  
  container.appendChild(entryDiv);
}
