(function () {
  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }
  function qsa(root, sel) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  // Mobile menu
  const menuBtn = qs(document, '.js-menu-toggle');
  const header = qs(document, '.site-header');
  if (menuBtn && header) {
    menuBtn.addEventListener('click', () => {
      header.classList.toggle('menu-open');
      document.body.classList.toggle('menu-open');
    });
  }

  // Search filtering for any page with cards.
  function normalize(s) {
    return String(s || '').toLowerCase();
  }
  function attachFilter(input, list) {
    if (!input || !list) return;
    const cards = qsa(list, '.movie-card');
    if (!cards.length) return;
    input.addEventListener('input', () => {
      const term = normalize(input.value.trim());
      cards.forEach(card => {
        const text = normalize(card.getAttribute('data-search') || card.textContent);
        card.classList.toggle('is-hidden', term && !text.includes(term));
      });
    });
  }
  qsa(document, '[data-filter-input]').forEach(input => {
    const panel = input.closest('.section-block, .search-panel, .page-intro, main, section');
    const list = panel ? qs(panel.nextElementSibling || panel.parentElement, '[data-card-list]') : qs(document, '[data-card-list]');
    attachFilter(input, list);
  });

  // Category chips on overview page.
  qsa(document, '[data-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      const slug = chip.getAttribute('data-chip');
      qsa(document, '.chip').forEach(c => c.classList.toggle('active', c === chip));
      const sections = qsa(document, '.category-showcase');
      sections.forEach(section => {
        const title = normalize(section.textContent);
        const target = slug === 'all' || title.includes(normalize(chip.textContent.replace(/\s*\(\d+\)\s*/, '')));
        section.style.display = target ? '' : 'none';
      });
    });
  });

  // Hero slider.
  const heroRoot = qs(document, '[data-hero-slider]');
  if (heroRoot) {
    const slides = qsa(heroRoot, '.hero-slide');
    const prev = qs(heroRoot, '[data-hero-prev]');
    const next = qs(heroRoot, '[data-hero-next]');
    let index = 0;
    function show(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
    }
    if (slides.length > 1) {
      prev && prev.addEventListener('click', () => show(index - 1));
      next && next.addEventListener('click', () => show(index + 1));
      let timer = setInterval(() => show(index + 1), 5500);
      heroRoot.addEventListener('mouseenter', () => clearInterval(timer));
      heroRoot.addEventListener('mouseleave', () => {
        timer = setInterval(() => show(index + 1), 5500);
      });
      show(0);
    }
  }

  // Video player with HLS fallback
  function initPlayer(video) {
    const hlsUrl = video.dataset.hls;
    const fallback = video.dataset.fallback;
    const overlayBtn = video.parentElement ? qs(video.parentElement, '.js-play-btn') : null;
    const tryPlay = () => video.play().catch(() => {});
    if (overlayBtn) overlayBtn.addEventListener('click', tryPlay);

    if (hlsUrl && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        maxLiveSyncPlaybackRate: 1.25,
        backBufferLength: 60
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => tryPlay());
      return;
    }
    if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', tryPlay, { once: true });
      return;
    }
    if (fallback) {
      video.src = fallback;
      video.addEventListener('loadedmetadata', tryPlay, { once: true });
    }
  }

  qsa(document, 'video.js-player').forEach(initPlayer);
})();
