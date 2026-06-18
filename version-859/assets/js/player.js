(function () {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var playButton = shell.querySelector("[data-play-button]");
  var errorBox = shell.querySelector("[data-player-error]");
  var source = video ? video.getAttribute("data-video-url") : "";
  var prepared = false;
  var hls = null;

  var showError = function (message) {
    if (!errorBox) {
      return;
    }
    errorBox.textContent = message;
    errorBox.classList.add("show");
  };

  var clearError = function () {
    if (!errorBox) {
      return;
    }
    errorBox.textContent = "";
    errorBox.classList.remove("show");
  };

  var prepare = function () {
    if (prepared) {
      return true;
    }

    if (!video || !source) {
      showError("视频加载失败，请稍后重试");
      return false;
    }

    clearError();

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          showError("网络加载异常，正在尝试恢复");
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          showError("媒体加载异常，正在尝试恢复");
          hls.recoverMediaError();
          return;
        }

        showError("播放加载失败，请刷新后重试");
        hls.destroy();
      });
      prepared = true;
      return true;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      prepared = true;
      return true;
    }

    showError("当前设备无法播放此视频");
    return false;
  };

  var startPlayback = function () {
    if (!prepare()) {
      return;
    }

    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        showError("播放启动失败，请再次点击播放");
      });
    }
  };

  if (playButton) {
    playButton.addEventListener("click", function (event) {
      event.preventDefault();
      startPlayback();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
    clearError();
  });

  video.addEventListener("pause", function () {
    shell.classList.remove("is-playing");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
