
(function () {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupMenu() {
    const btn = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function setupSearch() {
    document.querySelectorAll('[data-search-form]').forEach(form => {
      const input = form.querySelector('[data-search-input]');
      if (!input) return;
      const scope = form.closest('main') || document;
      const cards = Array.from(scope.querySelectorAll('[data-card-item]'));
      const runFilter = () => {
        const q = input.value.trim().toLowerCase();
        cards.forEach(card => {
          const hay = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.year
          ].join(' ').toLowerCase();
          card.classList.toggle('hidden', q && !hay.includes(q));
        });
      };
      input.addEventListener('input', runFilter);
      form.addEventListener('submit', e => { e.preventDefault(); runFilter(); });
    });
  }

  function setupHero() {
    const root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dotsWrap = root.querySelector('[data-hero-dots]');
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    if (!slides.length) return;
    let index = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
    }
    function step(delta) { show(index + delta); }

    prev && prev.addEventListener('click', () => step(-1));
    next && next.addEventListener('click', () => step(1));
    show(0);

    if (!prefersReduced) {
      let timer = setInterval(() => step(1), 5000);
      root.addEventListener('mouseenter', () => clearInterval(timer));
      root.addEventListener('mouseleave', () => { timer = setInterval(() => step(1), 5000); });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearInterval(timer);
        else timer = setInterval(() => step(1), 5000);
      });
    }
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 255, g: 138, b: 61 };
  }

  function setupMoviePlayer() {
    const card = document.querySelector('.js-movie-player');
    if (!card) return;
    const video = card.querySelector('.movie-video');
    const overlayButtons = card.querySelectorAll('[data-play-preview]');
    if (!video) return;

    let started = false;
    let stream;
    let raf = 0;
    let canvas, ctx, coverImg;
    let t = 0;

    function drawFrame() {
      if (!ctx) return;
      const w = canvas.width, h = canvas.height;
      const title = card.dataset.title || 'MOVIE';
      const year = card.dataset.year || '';
      const region = card.dataset.region || '';
      const genre = card.dataset.genre || '';
      const accent = hexToRgb('#ff8a3d');
      const accent2 = hexToRgb('#2dd4bf');
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#06101f');
      bg.addColorStop(1, '#120b22');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      if (coverImg && coverImg.complete) {
        const iw = coverImg.naturalWidth || w, ih = coverImg.naturalHeight || h;
        const scale = Math.max(w / iw, h / ih);
        const dw = iw * scale, dh = ih * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.globalAlpha = 0.25;
        ctx.drawImage(coverImg, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }

      const pulse = 0.5 + Math.sin(t * 0.04) * 0.5;
      const grad = ctx.createRadialGradient(w * 0.25, h * 0.3, 40, w * 0.25, h * 0.3, Math.min(w, h) * 0.7);
      grad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},${0.32 + pulse * 0.16})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(6, 10, 20, 0.42)';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 14; i++) {
        const x = (Math.sin((t + i * 17) * 0.03) * 0.35 + 0.5) * w;
        const y = (Math.cos((t + i * 11) * 0.025) * 0.33 + 0.5) * h;
        ctx.beginPath();
        ctx.fillStyle = i % 2 ? `rgba(${accent.r},${accent.g},${accent.b},0.14)` : `rgba(${accent2.r},${accent2.g},${accent2.b},0.12)`;
        ctx.arc(x, y, 10 + (i % 5) * 7 + pulse * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 52px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.fillText(title, 60, h * 0.55);
      ctx.font = '600 22px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText([region, year, genre].filter(Boolean).join(' · '), 60, h * 0.55 + 42);
      ctx.font = '500 18px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('静态站内预览播放器 · HLS 接口已预留', 60, h * 0.55 + 76);
      t += 1;
      raf = requestAnimationFrame(drawFrame);
    }

    function setupPreview() {
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        ctx = canvas.getContext('2d');
        coverImg = new Image();
        coverImg.src = card.dataset.cover || '';
      }
      if (!started) {
        try {
          stream = canvas.captureStream(24);
          video.srcObject = stream;
          video.play().catch(() => {});
        } catch (err) {
          // fall back to a simple source if captureStream is unavailable
          if (!video.src) {
            video.src = '';
          }
        }
        started = true;
        drawFrame();
      }
    }

    function initHls(url) {
      if (!url) return false;
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return true;
      }
      return false;
    }

    function handlePlay() {
      const src = card.dataset.stream || video.dataset.stream || '';
      if (src && initHls(src)) return;
      setupPreview();
    }

    overlayButtons.forEach(btn => btn.addEventListener('click', handlePlay));
    video.addEventListener('play', handlePlay, { once: true });
    video.addEventListener('pause', () => {
      if (started && !video.ended) {
        // keep stream alive; user can resume
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (started) raf = requestAnimationFrame(drawFrame);
    });
  }

  setupMenu();
  setupSearch();
  setupHero();
  setupMoviePlayer();
})();
