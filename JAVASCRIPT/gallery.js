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

  // Örnek veri - gerçek uygulamada photos.json'dan gelecek
  const samplePhotos = [
    { src: "/IMAGES/GALLERY/photo1.jpg", location: "Istanbul, Turkey", date: "2023-05-01", time: "14:30" },
    { src: "/IMAGES/GALLERY/photo2.jpg", location: "Ankara, Turkey", date: "2023-05-02", time: "10:15" },
    { src: "/IMAGES/GALLERY/photo3.jpg", location: "Cappadocia, Turkey", date: "2023-05-03", time: "18:45" },
    { src: "/IMAGES/GALLERY/photo4.jpg", location: "Pamukkale, Turkey", date: "2023-05-04", time: "12:20" },
    { src: "/IMAGES/GALLERY/photo5.jpg", location: "Antalya, Turkey", date: "2023-05-05", time: "09:30" },
    { src: "/IMAGES/GALLERY/photo6.jpg", location: "Izmir, Turkey", date: "2023-05-06", time: "16:40" },
    { src: "/IMAGES/GALLERY/photo7.jpg", location: "Bodrum, Turkey", date: "2023-05-07", time: "19:15" },
    { src: "/IMAGES/GALLERY/photo8.jpg", location: "Trabzon, Turkey", date: "2023-05-08", time: "11:05" },
    { src: "/IMAGES/GALLERY/photo9.jpg", location: "Nemrut, Turkey", date: "2023-05-09", time: "05:50" },
    { src: "/IMAGES/GALLERY/photo10.jpg", location: "Ephesus, Turkey", date: "2023-05-10", time: "13:25" }
  ];

  // Gerçek uygulamada fetch kullanın:
  // fetch("/photos.json")
  //   .then(res => res.json())
  //   .then(data => {
  //     allPhotos = data;
  //     renderPhotos();
  //   })
  //   .catch(err => {
  //     console.error("Photo fetch error:", err);
  //   });

  // Örnek veri ile çalışma
  allPhotos = samplePhotos;
  renderPhotos();

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
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    updateModal();
  }

  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    
    // Animasyon bitene kadar bekleyip tamamen gizle
    setTimeout(() => {
      modal.style.display = "none";
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
    if (touchEndX < touchStartX - 50) { // Minimum kaydırma mesafesi
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

  // Modal başlangıçta gizli
  modal.style.display = "none";
});
