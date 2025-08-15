document.getElementById('home').addEventListener('click', function(e) {
  e.preventDefault(); // href="#" ile sayfanın başına ani atlamayı engeller
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Yumuşak kaydırma efekti
  });
  
  // Alternatif olarak belirli bir section'a gitmek isterseniz:
  // document.getElementById('top-section').scrollIntoView({ behavior: 'smooth' });
});