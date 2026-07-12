// Landing Grid behavior. Externalized so the CSP can use script-src 'self'.
document.addEventListener('DOMContentLoaded', () => {
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const tiles = Array.from(document.querySelectorAll('.tile'));
  const searchInput = document.getElementById('search-input');
  const navCounter = document.getElementById('nav-counter');
  const emptyState = document.getElementById('empty-state');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // First-letter glyph is decorative; the link is labelled by its visible text.
  document.querySelectorAll('.tile-icon').forEach((icon) => {
    const name = icon.getAttribute('data-name');
    if (name) icon.textContent = name.charAt(0).toUpperCase();
  });

  // Entrance animation only when motion is welcome (finding A11Y-04).
  if (!reduceMotion) {
    tiles.forEach((tile, i) => {
      tile.style.animationDelay = `${i * 0.05}s`;
      tile.classList.add('animate-scale-in');
    });
  }

  // Exact token match, not substring (finding JS-04).
  const tokensOf = (tile) =>
    (tile.getAttribute('data-groups') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  function setCounter(text, tone) {
    if (!navCounter) return;
    navCounter.textContent = text;
    navCounter.dataset.tone = tone;
  }

  // Single source of truth for visibility. Uses a class, not inline-style string
  // matching (finding JS-03), so counting hidden tiles is reliable.
  function apply(filter, query) {
    const q = (query || '').trim().toLowerCase();
    let visible = 0;
    tiles.forEach((tile) => {
      const name = (tile.getAttribute('data-name') || '').toLowerCase();
      const matchesFilter = filter === 'all' || tokensOf(tile).includes(filter);
      const matchesQuery = !q || name.includes(q);
      const show = matchesFilter && matchesQuery;
      tile.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });
    if (q) setCounter(`${visible} found`, 'search');
    else if (filter === 'all') setCounter(`${tiles.length} apps`, 'default');
    else setCounter(`${visible}/${tiles.length}`, 'filter');
    if (emptyState) emptyState.classList.toggle('hidden', visible !== 0);
  }

  function setActive(item) {
    navItems.forEach((n) => {
      const active = n === item;
      n.classList.toggle('active', active);
      if (active) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
    });
  }

  let searchTimer;
  let currentFilter = 'all';

  function selectFilter(item) {
    clearTimeout(searchTimer); // no stale search callback can fire (finding JS-02)
    if (searchInput) searchInput.value = '';
    setActive(item);
    currentFilter = item.getAttribute('data-filter') || 'all';
    apply(currentFilter, '');
    // Base-aware history update — never a hardcoded '/' (finding HTML-01).
    const url =
      currentFilter === 'all'
        ? window.location.pathname + window.location.search
        : `#${currentFilter}`;
    window.history.replaceState(null, '', url);
  }

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      selectFilter(item);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query) setActive(null); // searching spans all tiles
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        if (query) apply('all', query);
        else {
          const allItem = navItems.find((n) => n.getAttribute('data-filter') === 'all');
          setActive(allItem);
          apply('all', '');
        }
      }, 180);
    });
  }

  // Global shortcuts — but never while the user is typing (finding JS-01).
  document.addEventListener('keydown', (e) => {
    const typing =
      e.target instanceof Element &&
      (e.target.matches('input, textarea, select') || e.target.isContentEditable);

    if (e.key === 'Escape') {
      if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
      }
      const allItem = navItems.find((n) => n.getAttribute('data-filter') === 'all');
      if (allItem) selectFilter(allItem);
      return;
    }

    if (typing || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;

    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= navItems.length) {
      e.preventDefault();
      navItems[n - 1].click();
    }
  });

  // Initial state: honor a category in the URL hash, else show all.
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  const initial = hash && navItems.find((n) => n.getAttribute('data-filter') === hash);
  if (initial) {
    setActive(initial);
    currentFilter = hash;
    apply(hash, '');
  } else {
    apply('all', '');
  }
});
