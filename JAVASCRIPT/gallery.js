document.addEventListener("DOMContentLoaded", () => {
  const galleryGrid = document.getElementById("gallery-grid");
  const loadMoreBtn = document.getElementById("load-more");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalInfo = document.getElementById("modal-info"); // Yeni ekledik
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
      const photoContainer = document.createElement("div");
      photoContainer.classList.add("photo-container");
      
      const img = document.createElement("img");
      img.src = photo.src;
      img.classList.add("gallery-photo");
      img.alt = "Gallery Photo";
      
      const infoText = document.createElement("div");
      infoText.classList.add("photo-info");
      infoText.innerHTML = `
        <small>${photo.date} ${photo.time}</small>
        <small>${photo.location}</small>
      `;
      
      img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;
        modalInfo.innerHTML = `
          <p>${photo.date} ${photo.time}</p>
          <p>${photo.location}</p>
        `;
        document.body.style.overflow = "hidden";
      });
      
      photoContainer.appendChild(img);
      photoContainer.appendChild(infoText);
      galleryGrid.appendChild(photoContainer);
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