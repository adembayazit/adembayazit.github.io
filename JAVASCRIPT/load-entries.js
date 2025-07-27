document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("entries");

  // Entries JSON'u yükle
  const entries = await fetch("entries.json").then(res => res.json());

  for (const entry of entries) {
    const entryCard = document.createElement("div");
    entryCard.classList.add("entry-card");
    entryCard.dataset.entryId = entry.id;

    // Entry içeriği
    entryCard.innerHTML = `
      <div class="entry-content">
        <p>${entry.content}</p>
      </div>
      <div class="entry-footer">
        <span class="entry-id">#${entry.id}</span>
        <button class="like-btn" title="Beğen">
          <img src="/images/daisy.svg" class="like-icon" />
          <span class="like-count">0</span>
        </button>
      </div>
    `;

    container.appendChild(entryCard);

    // Beğeni sayısını getir
    try {
      const res = await fetch(`/.netlify/functions/get-likes?id=${entry.id}`);
      const data = await res.json();
      const countSpan = entryCard.querySelector(".like-count");
      if (data.likes !== undefined) countSpan.textContent = data.likes;
    } catch (e) {
      console.error(`Beğeni yüklenemedi (ID: ${entry.id}):`, e);
    }

    // Beğeni butonuna tıklama
    const likeBtn = entryCard.querySelector(".like-btn");
    likeBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`/.netlify/functions/increment-like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: entry.id })
        });
        const data = await res.json();
        const countSpan = entryCard.querySelector(".like-count");
        if (d
