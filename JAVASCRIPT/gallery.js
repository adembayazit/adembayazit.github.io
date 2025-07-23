let photos = [];
let perPage = 8;
let currentPage = 1;

fetch("photos.json")
  .then(res => res.json())
  .then(data => {
    photos = data.reverse(); // son eklenen başta gözüksün
    renderPhotos();
  });

function renderPhotos() {
  const grid = document.getElementById("gallery-grid");
  const start = 0;
  const end = currentPage * perPage;
  const currentPhotos = photos.slice(0, end);

  grid.innerHTML = "";
  currentPhotos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "gallery-img";
    img.addEventListener("click", () => showModal(src));
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
  modal.style.display = "block";
  modalImg.src = src;
}
