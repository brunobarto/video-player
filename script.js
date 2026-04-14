document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("videoPlayer");

  const playPauseBtn = document.getElementById("playPauseBtn");
  const btnStop = document.getElementById("btnStop");
  const btnBack10 = document.getElementById("btnBack10");
  const btnForward10 = document.getElementById("btnForward10");
  const btnSpeedUp = document.getElementById("btnSpeedUp");
  const btnSpeedDown = document.getElementById("btnSpeedDown");

  const volumeSlider = document.getElementById("volumeSlider");
  const fileInput = document.getElementById("fileInput");
  const progressSlider = document.getElementById("progressSlider");
  const timeDisplay = document.getElementById("timeDisplay");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  const tronWindow = document.getElementById("tronWindow");
  const tronTitlebar = document.getElementById("tronTitlebar");

  const fsControls = document.getElementById("fsControls");
  const fsPlayPause = document.getElementById("fsPlayPause");
  const fsExit = document.getElementById("fsExit");

  const resizeHandles = document.querySelectorAll(".resize-handle");

  /* =========================
     UTILITAIRES
  ========================== */

  function formatTime(sec) {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateTimeUI() {
    if (!isNaN(video.duration)) {
      progressSlider.value = (video.currentTime / video.duration) * 100;
      timeDisplay.textContent =
        `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    } else {
      timeDisplay.textContent = "00:00 / 00:00";
    }
  }

  function updatePlayButtons() {
    if (video.paused) {
      playPauseBtn.textContent = "Play";
      fsPlayPause.textContent = "▶";
    } else {
      playPauseBtn.textContent = "Pause";
      fsPlayPause.textContent = "⏸";
    }
  }

  /* =========================
     LECTURE / PAUSE / STOP
  ========================== */

  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    updatePlayButtons();
  }

  function stopVideo() {
    video.pause();
    video.currentTime = 0;
    updatePlayButtons();
    updateTimeUI();
  }

  playPauseBtn.addEventListener("click", togglePlay);
  fsPlayPause.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  btnStop.addEventListener("click", stopVideo);

  video.addEventListener("play", updatePlayButtons);
  video.addEventListener("pause", updatePlayButtons);

  /* =========================
     SKIP ±10s
  ========================== */

  btnBack10.addEventListener("click", () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
    updateTimeUI();
  });

  btnForward10.addEventListener("click", () => {
    if (!isNaN(video.duration)) {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      updateTimeUI();
    }
  });

  /* =========================
     VITESSE LECTURE
  ========================== */

  function changeSpeed(delta) {
    let newRate = video.playbackRate + delta;
    newRate = Math.max(0.5, Math.min(2, newRate)); // entre 0.5x et 2x
    video.playbackRate = newRate;
  }

  btnSpeedUp.addEventListener("click", () => changeSpeed(0.25));
  btnSpeedDown.addEventListener("click", () => changeSpeed(-0.25));

  /* =========================
     VOLUME
  ========================== */

  volumeSlider.addEventListener("input", () => {
    video.volume = volumeSlider.value;
  });

  /* =========================
     CHARGEMENT FICHIER
  ========================== */

  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    video.src = URL.createObjectURL(file);
    video.play();
    updatePlayButtons();
  });

  /* =========================
     TIMELINE
  ========================== */

  video.addEventListener("timeupdate", updateTimeUI);

  progressSlider.addEventListener("input", () => {
    if (!isNaN(video.duration)) {
      video.currentTime = (progressSlider.value / 100) * video.duration;
      updateTimeUI();
    }
  });

  /* =========================
     DRAG FENÊTRE
  ========================== */

  let drag = false;
  let offsetX = 0;
  let offsetY = 0;

  tronTitlebar.addEventListener("mousedown", e => {
    // éviter drag si on est en plein écran
    if (document.fullscreenElement) return;
    drag = true;
    const rect = tronWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", e => {
    if (!drag) return;
    tronWindow.style.left = `${e.clientX - offsetX}px`;
    tronWindow.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    drag = false;
  });

  /* =========================
     RESIZE FENÊTRE
  ========================== */

  let resizing = false;
  let resizeDir = "";
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  function startResize(e, dir) {
    if (document.fullscreenElement) return;
    resizing = true;
    resizeDir = dir;

    const rect = tronWindow.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;

    e.preventDefault();
  }

  resizeHandles.forEach(handle => {
    handle.addEventListener("mousedown", e => {
      if (handle.classList.contains("resize-br")) startResize(e, "br");
      if (handle.classList.contains("resize-bl")) startResize(e, "bl");
      if (handle.classList.contains("resize-tr")) startResize(e, "tr");
      if (handle.classList.contains("resize-tl")) startResize(e, "tl");
    });
  });

  document.addEventListener("mousemove", e => {
    if (!resizing) return;

    const minWidth = 320;
    const minHeight = 320;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (resizeDir.includes("r")) {
      newWidth = Math.max(minWidth, startWidth + dx);
    }
    if (resizeDir.includes("l")) {
      newWidth = Math.max(minWidth, startWidth - dx);
      newLeft = startLeft + dx;
    }
    if (resizeDir.includes("b")) {
      newHeight = Math.max(minHeight, startHeight + dy);
    }
    if (resizeDir.includes("t")) {
      newHeight = Math.max(minHeight, startHeight - dy);
      newTop = startTop + dy;
    }

    tronWindow.style.width = `${newWidth}px`;
    tronWindow.style.height = `${newHeight}px`;
    tronWindow.style.left = `${newLeft}px`;
    tronWindow.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    resizing = false;
  });

  /* =========================
     PLEIN ÉCRAN TRON
  ========================== */

  function enterFullscreen() {
    if (tronWindow.requestFullscreen) {
      tronWindow.requestFullscreen();
    } else if (tronWindow.webkitRequestFullscreen) {
      tronWindow.webkitRequestFullscreen();
    } else if (tronWindow.msRequestFullscreen) {
      tronWindow.msRequestFullscreen();
    }
    fsControls.style.display = "flex";
    fsControls.style.opacity = 1;
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    fsControls.style.display = "none";
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }

  fullscreenBtn.addEventListener("click", toggleFullscreen);
  fsExit.addEventListener("click", exitFullscreen);
  video.addEventListener("dblclick", toggleFullscreen);

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      fsControls.style.display = "none";
    }
  });

  /* =========================
     AUTO-HIDE CONTROLES FS
  ========================== */

  let hideTimeout;

  function showFsControls() {
    if (!document.fullscreenElement) return;
    fsControls.style.display = "flex";
    fsControls.style.opacity = 1;
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      fsControls.style.opacity = 0;
    }, 2000);
  }

  document.addEventListener("mousemove", () => {
    if (document.fullscreenElement) showFsControls();
  });

  /* =========================
     INIT
  ========================== */

  video.volume = volumeSlider.value;
  updatePlayButtons();
  updateTimeUI();
});
