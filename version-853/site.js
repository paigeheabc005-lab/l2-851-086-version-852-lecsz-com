(function () {
  const html = document.documentElement;
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navWrap = document.querySelector('[data-nav-wrap]');

  if (navToggle && navWrap) {
    navToggle.addEventListener('click', () => {
      navWrap.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navWrap.classList.contains('open'));
    });

    document.addEventListener('click', (e) => {
      if (!navWrap.contains(e.target) && !navToggle.contains(e.target)) {
        navWrap.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const activePath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const hrefPath = href.split('/').pop();
    if (hrefPath === activePath) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-dot]'));
    const prevBtn = slider.querySelector('[data-prev]');
    const nextBtn = slider.querySelector('[data-next]');
    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
    if (current < 0) current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };

    const next = () => show(current + 1);
    const prev = () => show(current - 1);

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

    const stop = () => timer && clearInterval(timer);
    const start = () => {
      stop();
      timer = setInterval(next, 6000);
    };

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
    show(current);
  });

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const buttons = Array.from(scope.querySelectorAll('[data-filter-btn]'));
    const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
    const counter = scope.querySelector('[data-filter-count]');
    const empty = scope.querySelector('[data-filter-empty]');
    let currentGroup = 'all';

    const run = () => {
      const q = (input?.value || '').trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const hay = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.year || '',
          card.dataset.region || '',
          card.dataset.type || ''
        ].join(' ').toLowerCase();
        const group = card.dataset.group || 'all';
        const groupMatch = currentGroup === 'all' || currentGroup === group;
        const queryMatch = !q || hay.includes(q);
        const ok = groupMatch && queryMatch;
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });
      if (counter) counter.textContent = String(visible);
      if (empty) empty.classList.toggle('hidden', visible > 0);
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentGroup = btn.dataset.group || 'all';
        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        run();
      });
    });

    input && input.addEventListener('input', run);
    run();
  });

  document.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copyLink || location.href;
      try {
        await navigator.clipboard.writeText(text);
        const old = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(() => btn.textContent = old, 1200);
      } catch (err) {
        console.warn(err);
      }
    });
  });

  document.querySelectorAll('img[data-lazy-poster]').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = img.nextElementSibling;
      if (fallback) fallback.classList.add('visible');
    });
  });

  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const input = form.querySelector('input');
      if (!input || !input.value.trim()) return;
      e.preventDefault();
      const q = encodeURIComponent(input.value.trim());
      const target = form.getAttribute('action') || 'search.html';
      location.href = `${target}?q=${q}`;
    });
  });
})();