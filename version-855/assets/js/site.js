
(function () {
  function initHeroCarousel() {
    const root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function start() {
      stop();
      timer = setInterval(() => show(index + 1), 6500);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    prev && prev.addEventListener('click', () => { show(index - 1); start(); });
    next && next.addEventListener('click', () => { show(index + 1); start(); });
    dots.forEach((dot) => dot.addEventListener('click', () => { show(Number(dot.dataset.heroDot || 0)); start(); }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    const input = document.querySelector('[data-search-input]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    if (!input || !cards.length) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = (card.dataset.search || '').toLowerCase();
        card.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }

  function initMenu() {
    const btn = document.querySelector('[data-menu-btn]');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function initPlayer() {
    const root = document.querySelector('[data-player]');
    if (!root) return;
    const video = root.querySelector('[data-video]');
    const playBtn = root.querySelector('[data-play-btn]');
    const sourceBtns = Array.from(root.querySelectorAll('[data-source]'));
    const mp4 = root.dataset.mp4 || '';
    const m3u8 = root.dataset.m3u8 || '';
    let current = 'mp4';
    let hlsInstance = null;

    function attachM3U8(url) {
      if (!url) return false;
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return true;
      }
      if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return true;
      }
      return false;
    }

    function setSource(kind) {
      current = kind;
      sourceBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.source === kind));
      if (kind === 'hls') {
        if (!attachM3U8(m3u8)) {
          video.src = mp4;
        }
      } else {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        video.src = mp4;
      }
      video.load();
    }

    sourceBtns.forEach((btn) => btn.addEventListener('click', () => setSource(btn.dataset.source || 'mp4')));
    playBtn && playBtn.addEventListener('click', () => video.play().catch(() => {}));
    video.addEventListener('click', () => video.paused ? video.play().catch(() => {}) : video.pause());
    setSource(current);
  }

  function initScrollHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => header.style.boxShadow = window.scrollY > 12 ? '0 12px 30px rgba(0,0,0,.24)' : 'none';
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  initHeroCarousel();
  initSearch();
  initMenu();
  initPlayer();
  initScrollHeader();
})();
