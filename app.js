// App simple para cargar ficheros Markdown desde /files en función de la URL
(function () {
  const contentEl = document.getElementById('content');
  const yearEl = document.getElementById('year');
  const footerBrandEl = document.getElementById('footer-brand');
  const headerBrandEl = document.getElementById('brand');
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Tema (claro/oscuro) ---
  const THEME_KEY = 'theme';
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }
  function getPreferredTheme() {
    const stored = safeGet(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    // Usamos un atributo en :root (html) para que coincida con el CSS
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    syncToggleUI(theme);
  }
  function syncToggleUI(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  // Inicializa el tema
  applyTheme(getPreferredTheme());
  // Control del botón toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      safeSet(THEME_KEY, next);
    });
  }
  // Si el usuario no ha elegido manualmente, sigue el sistema
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mql) {
    mql.addEventListener?.('change', () => {
      const stored = safeGet(THEME_KEY);
      if (stored !== 'light' && stored !== 'dark') {
        applyTheme(getPreferredTheme());
      }
    });
  }

  let baseTitle = 'Markdown Blog';

  async function loadConfig() {
    try {
      const res = await fetch('config.json', { cache: 'no-cache' });
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.title) baseTitle = cfg.title;

        // Actualiza el brand del header con el título del config
        if (cfg.title && headerBrandEl) {
          headerBrandEl.textContent = baseTitle;
        }

        if (footerBrandEl) {
          let footerTxt = cfg.footerSpan ?? cfg.title ?? '';
          // Añade un espacio de separación si no existe
          if (footerTxt && !/\s$/.test(footerTxt)) footerTxt += ' ';
          footerBrandEl.textContent = footerTxt;
        }

        // Recalcula el título del documento con la config cargada
        const firstH1 = contentEl?.querySelector('h1');
        document.title = firstH1 ? `${firstH1.textContent} · ${baseTitle}` : baseTitle;
      }
    } catch (_) {
      // Ignorar errores de carga de config; se usarán valores por defecto
    }
  }

  // Obtiene la ruta actual (sin los "/" iniciales/finales)
  const rawPath = decodeURIComponent(window.location.pathname || '/');
  const cleanPath = rawPath.replace(/^\/+|\/+$/g, '');

  // Si no hay ruta, usamos "index"
  const slug = cleanPath === '' ? 'index' : cleanPath;
  const mdUrl = `/files/${slug}.md`;

  // Carga un fichero .md y lo renderiza
  async function loadMarkdown(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      // marked se incluye desde CDN en index.html
      const html = window.marked ? window.marked.parse(text) : `<pre>${escapeHtml(text)}</pre>`;
      contentEl.innerHTML = html;
      // Ajusta títulos del documento
      const firstH1 = contentEl.querySelector('h1');
      document.title = firstH1 ? `${firstH1.textContent} · ${baseTitle}` : baseTitle;
    } catch (err) {
      if (url !== '/files/404.md') {
        // Intenta cargar una página 404 personalizada
        loadMarkdown('/files/404.md');
      } else {
        contentEl.innerHTML = `<h1>404</h1><p>No se ha encontrado el recurso: <code>${escapeHtml(mdUrl)}</code></p>`;
      }
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // Cargar config y markdown en paralelo
  loadConfig();
  loadMarkdown(mdUrl);
})();
