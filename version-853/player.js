import { H as Hls } from './hls-dru42stk.js';

function initPlayer(shell) {
  const video = shell.querySelector('video');
  const playBtn = shell.querySelector('[data-play]');
  const cover = shell.querySelector('[data-cover]');
  const src = shell.dataset.src;
  if (!video || !src) return;

  let hls = null;
  let started = false;

  const cleanup = () => {
    if (hls) {
      try { hls.destroy(); } catch (e) {}
      hls = null;
    }
  };

  const attach = async () => {
    if (started) return;
    started = true;
    shell.classList.add('playing');

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      await video.play();
    } catch (error) {
      console.error('Playback failed:', error);
      started = false;
      shell.classList.remove('playing');
    }
  };

  if (playBtn) playBtn.addEventListener('click', attach);
  if (cover) cover.addEventListener('click', attach);
  video.addEventListener('click', () => {
    if (video.paused) attach();
  });

  video.addEventListener('loadedmetadata', () => {
    shell.classList.add('loaded');
  });

  video.addEventListener('ended', () => {
    shell.classList.remove('playing');
    started = false;
  });

  window.addEventListener('beforeunload', cleanup);
}

document.querySelectorAll('[data-player]').forEach(initPlayer);