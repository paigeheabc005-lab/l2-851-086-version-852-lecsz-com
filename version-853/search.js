(async function () {
  const qInput = document.querySelector('[data-search-query]');
  const resultWrap = document.querySelector('[data-search-results]');
  const countEl = document.querySelector('[data-search-count]');
  const chips = Array.from(document.querySelectorAll('[data-search-chip]'));
  const empty = document.querySelector('[data-search-empty]');
  const title = document.querySelector('[data-search-title]');
  const params = new URLSearchParams(location.search);
  const startQ = params.get('q') || '';

  const esc = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const data = await fetch('./catalog.json').then(r => r.json());
  const items = data.items || [];

  function render(list) {
    resultWrap.innerHTML = list.map(item => `
      <article class="movie-card" data-filter-card data-title="${esc(item.title)}" data-tags="${esc(item.tags.join(' '))} ${esc(item.genre)} ${esc(item.region)}" data-year="${esc(item.year)}" data-region="${esc(item.region)}" data-type="${esc(item.type)}">
        <a href="./${esc(item.slug)}">
          <div class="poster" style="--hue:${item.hue}">
            <img src="${esc(item.cover)}" alt="${esc(item.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.classList.add('visible')">
            <div class="poster-fallback">
              <span class="poster-badge">${esc(item.id)}</span>
              <strong>${esc(item.title)}</strong>
              <em>${esc(item.year)} · ${esc(item.region)}</em>
            </div>
          </div>
          <div class="movie-card-body">
            <div class="meta-row"><span>${esc(item.region)}</span><span>${esc(item.year)}</span></div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.one_line)}</p>
            <div class="tags">${item.tags.slice(0,3).map(t => `<span>${esc(t)}</span>`).join('')}</div>
          </div>
        </a>
      </article>
    `).join('');
    countEl.textContent = String(list.length);
    empty.classList.toggle('hidden', list.length > 0);
  }

  function applySearch() {
    const q = (qInput.value || '').trim().toLowerCase();
    const chip = chips.find(c => c.classList.contains('active'));
    const group = chip ? chip.dataset.searchChip : 'all';

    const list = items.filter(item => {
      const hay = [
        item.title, item.region, item.type, item.genre,
        item.one_line, item.summary, item.review, item.tags.join(' ')
      ].join(' ').toLowerCase();
      const qMatch = !q || hay.includes(q);
      const gMatch = group === 'all' || item.region === group || item.type === group || String(item.genre).includes(group);
      return qMatch && gMatch;
    });

    render(list.slice(0, 200));
    title.textContent = q ? `“${qInput.value}” 的搜索结果` : '全部影片搜索结果';
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applySearch();
    });
  });

  qInput.addEventListener('input', applySearch);
  qInput.value = startQ;
  applySearch();
})();