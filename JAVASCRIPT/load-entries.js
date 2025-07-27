document.addEventListener("DOMContentLoaded", () => {
  fetch("entries.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("entries");
      container.innerHTML = "";

      const sortedEntries = data.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      const last7Entries = sortedEntries.slice(0, 7);

      const entriesMap = new Map();
      const parentEntries = [];

      last7Entries.forEach((entry) => {
        entriesMap.set(entry.id, { ...entry, children: [] });
      });

      last7Entries.forEach((entry) => {
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

      parentEntries.forEach((parent) => {
        createEntryElement(parent, container, 0);
        const children = entriesMap.get(parent.id)?.children || [];
        children.sort((a, b) => new Date(a.date) - new Date(b.date));
        children.forEach((child) => {
          createEntryElement(child, container, 1);
        });
      });

      addTranslationIcons(); // varsa çeviri sistemini de çağır
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
    <div class="timestamp">
      <span class="fa-solid fa-bug bug-iconentry"></span> ${time}
    </div>
    <div class="entry-id">#${entry.id}</div>
    <div class="content">${entry.content}</div>

    <div class="entry-box" data-entry-id="${entry.id}">
      <div class="entry-content">${entry.content}</div>

      <div class="like-container" data-entry-id="${entry.id}">
        <img src="/IMAGES/daisy.svg" class="daisy-icon" onclick="likeEntry(this)" />
        <span class="like-count">0</span>
      </div>
    </div>
  `;

  container.appendChild(entryDiv);

  // Sayfa yüklendiğinde like sayısını getir
  fetch(`/.netlify/functions/get-likes?id=${entry.id}`)
    .then((res) => res.json())
    .then((data) => {
      const likeCountSpan = entryDiv.querySelector(".like-count");
      if (data && data.likes !== undefined) {
        likeCountSpan.textContent = data.likes;
      }
    })
    .catch((err) => console.error("Like yükleme hatası:", err));
}

function likeEntry(img) {
  const entryId = img.closest(".like-container").dataset.entryId;
  fetch("/.netlify/functions/like-entry", {
    method: "POST",
    body: JSON.stringify({ id: entryId }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && data.likes !== undefined) {
        const likeCountSpan = img.nextElementSibling;
        likeCountSpan.textContent = data.likes;
      }
    })
    .catch((err) => console.error("Beğeni hatası:", err));
}
