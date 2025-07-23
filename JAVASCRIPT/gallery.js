let photos = [];
let perPage = 8;
let currentPage = 1;

fetch("/photos.json")
  .then(res => res.json())
  .then(data => {
    photos = data.reverse(); // en son fotoğraf önce gelsin
    renderPhotos();
  });

function renderPhotos() {
  const grid = document.getElementById("gallery-grid");
  const start = 0;
  const end = currentPage * perPage;
  const currentPhotos = photos.slice(start, end);

  grid.innerHTML = "";
  currentPhotos.forEach(photo => {
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = "Photo";
    img.className = "gallery-img";
    img.addEventListener("click", () => showModal(photo.src));
    grid.appendChild(img);
  });

  const moreBtn = document.getElementById("load-more");
  moreBtn.style.display = photos.length > end ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("load-more").addEventListener("click", () => {
    currentPage++;
    renderPhotos();
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target.id === "modal") {
      document.getElementById("modal").style.display = "none";
    }
  });
});

function showModal(src) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  modal.style.display = "flex";
  modalImg.src = src;
}
