document.addEventListener("DOMContentLoaded", () => {
  const galleryGrid = document.getElementById("gallery-grid");
  const loadMoreBtn = document.getElementById("load-more");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalLocation = document.getElementById("modal-location");
  const modalTime = document.getElementById("modal-time");
  const modalCounter = document.getElementById("modal-counter");
  const closeBtn = document.querySelector(".close");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");

  let allPhotos = [];
  let visibleCount = 8;
  let currentIndex = 0;

  // photos.json'dan verileri çek
  fetch("/photos.json")
    .then(res => res.json())
    .then(data => {
      allPhotos = data;
      renderPhotos();
    })
    .catch(err => {
      console.error("Photo fetch error:", err);
      // Eğer fetch başarısız olursa, örnek veri kullan
      allPhotos = [
        {
          "src": "PHOTO/photo1.JPG",
          "date": "2017-05-25",
          "time": "17:12",
          "location": "Eymir, Ankara, Türkiye"
        },
        {
          "src": "PHOTO/photo2.JPG",
          "date": "2017-05-30",
          "time": "14:57",
          "location": "Eymir, Ankara, Türkiye"
        },
        {
          "src": "PHOTO/photo3.JPG",
          "date": "2017-05-11",
          "time": "14:41",
          "location": "Eymir, Ankara, Türkiye"
        },
        {
          "src": "PHOTO/photo4.jpeg",
          "date": "2017-04-01",
          "time": "10:57",
          "location": "Kuleli, İstanbul, Türkiye"
        },
        {
          "src": "PHOTO/photo5.jpeg",
          "date": "2017-04-29",
          "time": "19:18",
          "location": "Alıntepe, İstanbul, Türkiye"
        },
        {
          "src": "PHOTO/IMG_0530.jpeg",
          "date": "2023-06-29",
          "time": "19:22",
          "location": "Hacettepe Üniversitesi Cami Önü, Ankara, Türkiye"
        }
      ];
      renderPhotos();
    });

  function renderPhotos() {
    galleryGrid.innerHTML = "";
    allPhotos.slice(0, visibleCount).forEach((photo, index) => {
      const img = document.createElement("img");
      img.src = photo.src;
      img.classList.add("gallery-photo");
      img.alt = "Gallery Photo";
      img.dataset.location = photo.location;
      img.dataset.date = photo.date;
      img.dataset.time = photo.time;
      img.dataset.index = index;
      
      img.addEventListener("click", () => {
        currentIndex = index;
        openModal();
      });
      
      galleryGrid.appendChild(img);
    });

    loadMoreBtn.style.display = visibleCount < allPhotos.length ? "block" : "none";
  }

  function openModal() {
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
    document.body.style.overflow = "hidden";
    updateModal();
  }

  function closeModal() {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  }

  function updateModal() {
    const photo = allPhotos[currentIndex];
    modalImg.src = photo.src;
    modalLocation.textContent = photo.location || 'Unknown Location';
    modalTime.textContent = `${photo.date} ${photo.time}` || 'Unknown Time';
    modalCounter.textContent = `${currentIndex + 1} / ${allPhotos.length}`;
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % allPhotos.length;
    updateModal();
  }

  function prevPhoto() {
    currentIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    updateModal();
  }

  // Olay dinleyicileri
  closeBtn.addEventListener("click", closeModal);

  window.addEventListener("click", e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  nextButton.addEventListener("click", nextPhoto);
  prevButton.addEventListener("click", prevPhoto);

  // Klavye ile gezinme
  document.addEventListener("keydown", e => {
    if (modal.classList.contains("show")) {
      if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        prevPhoto();
      } else if (e.key === "Escape") {
        closeModal();
      }
    }
  });

  // Swipe için touch events
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  modal.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      nextPhoto();
    }
    if (touchEndX > touchStartX + 50) {
      prevPhoto();
    }
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += 8;
    renderPhotos();
  });
});