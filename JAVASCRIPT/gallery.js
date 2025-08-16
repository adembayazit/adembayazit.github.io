document.addEventListener("DOMContentLoaded", () => {
  const galleryGrid = document.getElementById("gallery-grid");
  const loadMoreBtn = document.getElementById("load-more");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalInfo = document.getElementById("modal-info"); // Bilgiler için alan
  const closeBtn = document.querySelector(".close");

  let allPhotos = [];
  let visibleCount = 8;

  fetch("/photos.json")
    .then(res => res.json())
    .then(data => {
      allPhotos = data;
      renderPhotos();
    })
    .catch(err => {
      console.error("Photo fetch error:", err);
    });

  function renderPhotos() {
    galleryGrid.innerHTML = "";
    allPhotos.slice(0, visibleCount).forEach(photo => {
      const img = document.createElement("img");
      img.src = photo.src;
      img.classList.add("gallery-photo");
      img.alt = "Gallery Photo";
      
      img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;
        // Modal içinde bilgileri göster
        modalInfo.innerHTML = `
          <div class="photo-info">
            <small>${photo.date} ${photo.time}</small>
            <small>${photo.location}</small>
          </div>
        `;
        document.body.style.overflow = "hidden";
      });
      
      galleryGrid.appendChild(img);
    });

    loadMoreBtn.style.display = visibleCount < allPhotos.length ? "block" : "none";
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += 8;
    renderPhotos();
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});