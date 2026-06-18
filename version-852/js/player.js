function initMoviePlayer(source) {
  var video = document.getElementById("moviePlayer");
  var overlay = document.getElementById("playerOverlay");
  var shell = document.getElementById("playerShell");
  var hls = null;
  var attached = false;
  var requested = false;

  function attach() {
    if (attached || !video || !source) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (requested) {
          video.play().catch(function () {});
        }
      });
      return;
    }
    video.src = source;
  }

  function start() {
    requested = true;
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.play().catch(function () {});
  }

  if (!video) {
    return;
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (shell) {
    shell.addEventListener("click", function (event) {
      if (!attached && event.target !== video) {
        start();
      }
    });
  }
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  video.addEventListener("click", function () {
    if (!attached) {
      start();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
