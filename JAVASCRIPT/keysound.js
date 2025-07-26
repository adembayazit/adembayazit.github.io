document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("play-sound-btn");
  if (!button) return;

  const audio = new Audio("SOUND/keysound.mp3");

  button.addEventListener("click", () => {
    audio.currentTime = 0; // her seferinde en baştan
    audio.play();
  });
});
