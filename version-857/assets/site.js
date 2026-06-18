(function () {
  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function initHeader() {
    const header = $('.site-header');
    if (header) {
      const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const toggle = $('.nav-toggle');
    const nav = $('.nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
      });

      $all('.nav a, .nav button', nav).forEach((el) => {
        el.addEventListener('click', () => {
          if (window.matchMedia('(max-width: 720px)').matches) {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  }

  function normalize(s) {
    return (s || '').toString().toLowerCase().trim();
  }

  function initFilterRoot(root) {
    if (!root) return;

    const input = $('[data-filter-input]', root);
    const select = $('[data-filter-category]', root);
    const cards = $all('[data-card]', root);

    if (!input && !select && !cards.length) return;

    const selectField = select ? (select.getAttribute('data-filter-field') || 'category') : 'category';

    const apply = () => {
      const q = normalize(input ? input.value : '');
      const selected = normalize(select ? select.value : '');

      cards.forEach((card) => {
        const title = normalize(card.getAttribute('data-title'));
        const tags = normalize(card.getAttribute('data-tags'));
        const year = normalize(card.getAttribute('data-year'));
        const region = normalize(card.getAttribute('data-region'));
        const category = normalize(card.getAttribute('data-category'));
        const haystack = [title, tags, year, region, category].join(' ');
        const matchText = !q || haystack.includes(q);

        let matchSelect = true;
        if (select && selected && selected !== 'all') {
          const fieldValue = normalize(card.getAttribute(`data-${selectField}`));
          matchSelect = fieldValue === selected;
        }

        card.style.display = matchText && matchSelect ? '' : 'none';
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }

    $all('[data-filter-chip]', root).forEach((chip) => {
      chip.addEventListener('click', () => {
        const v = chip.getAttribute('data-filter-chip') || '';
        if (select) {
          select.value = v;
          apply();
          return;
        }
        if (input) {
          input.value = v;
          apply();
        }
      });
    });

    apply();
  }

  function initPlayer() {
    const video = $('video[data-video-url]');
    if (!video) return;

    const src = video.getAttribute('data-video-url');
    const poster = video.getAttribute('poster');
    if (poster) {
      video.setAttribute('poster', poster);
    }

    function attachNative() {
      if (src) video.src = src;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          attachNative();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      attachNative();
    } else {
      attachNative();
    }

    const playBtn = $('[data-play-btn]');
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        try {
          await video.play();
        } catch (err) {
          console.warn(err);
        }
      });
    }
  }

  function initScrollButtons() {
    $all('[data-scroll-target]').forEach((btn) => {
      const target = document.querySelector(btn.getAttribute('data-scroll-target'));
      if (!target) return;
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-direction') || 'next';
        const delta = Math.max(280, target.clientWidth * 0.75);
        target.scrollBy({ left: dir === 'prev' ? -delta : delta, behavior: 'smooth' });
      });
    });
  }

  function initSorters() {
    const sorter = $('[data-sort-by]');
    const list = $('[data-sort-root]');
    if (!sorter || !list) return;
    const cards = $all('[data-sort-item]', list);
    const sortCards = () => {
      const mode = sorter.value;
      const sorted = [...cards].sort((a, b) => {
        const av = a.getAttribute(mode === 'latest' ? 'data-publish' : 'data-views') || '';
        const bv = b.getAttribute(mode === 'latest' ? 'data-publish' : 'data-views') || '';
        if (mode === 'latest') return bv.localeCompare(av);
        return Number(bv) - Number(av);
      });
      sorted.forEach((card) => list.appendChild(card));
    };
    sorter.addEventListener('change', sortCards);
    sortCards();
  }

  function initTabs() {
    $all('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const group = tab.getAttribute('data-tab-group');
        const target = tab.getAttribute('data-tab');
        $all(`[data-tab-group="${group}"]`).forEach((btn) => btn.classList.remove('active'));
        tab.classList.add('active');
        $all(`[data-tab-panel-group="${group}"]`).forEach((panel) => {
          panel.classList.toggle('hidden', panel.getAttribute('data-tab-panel') !== target);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initFilterRoot(document);
    initPlayer();
    initScrollButtons();
    initSorters();
    initTabs();
  });
})();
