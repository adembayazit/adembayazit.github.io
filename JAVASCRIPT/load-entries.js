document.addEventListener("DOMContentLoaded", () => {
  fetch("entries.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("entries");
      container.innerHTML = '';

      const sortedEntries = data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      const last7Entries = sortedEntries.slice(0, 7);

      const entriesMap = new Map();
      const parentEntries = [];

      last7Entries.forEach(entry => {
        entriesMap.set(entry.id, {...entry, children: []});
      });

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

      parentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

      parentEntries.forEach(parent => {
        createEntryElement(parent, container, 0);
        const children = entriesMap.get(parent.id)?.children || [];
        children.sort((a, b) => new Date(a.date) - new Date(b.date));
        children.forEach(child => {
          createEntryElement(child, container, 1);
        });
      });

      // ✅ Entry'ler DOM'a eklendikten sonra çeviri ikonlarını ekle
      addTranslationIcons();
    });
});

function createEntryElement(entry, container, depth) {
  const entryDiv = document.createElement("div");
  entryDiv.className = "entry";
  
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


