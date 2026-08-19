/* ==========================================================================
   header.js — builds the common header into <div id="site-header-root">
   ========================================================================== */
(function () {
  function buildMenuGroups() {
    const current = SiteUtils.currentPageFile();
    return SiteNav.groups.map(group => {
      const links = group.links.map(link => {
        const isCurrent = link.href === current;
        return `<a class="site-header__menu-link${isCurrent ? ' is-current' : ''}" href="${link.href}"${isCurrent ? ' aria-current="page"' : ''}>${link.label}</a>`;
      }).join('');
      return `<div class="site-header__menu-group"><h4>${group.title}</h4>${links}</div>`;
    }).join('');
  }

  function render() {
    const root = document.getElementById('site-header-root');
    if (!root) return;

    root.innerHTML = `
      <header class="site-header" id="siteHeader">
        <a class="site-header__brand" href="${SiteNav.home.href}">
          <span class="site-header__logo">🧰</span>
          <span class="site-header__name">
            <span class="site-header__name-full">Web Tool Box</span>
            <span class="site-header__name-short">WTB</span>
          </span>
        </a>

        <nav class="site-header__nav" aria-label="Tool categories">
          <button class="site-header__nav-toggle" id="siteHeaderNavToggle" aria-expanded="false" aria-controls="siteHeaderMenu">
            All Tools <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="site-header__menu" id="siteHeaderMenu" role="menu" hidden>
            ${buildMenuGroups()}
          </div>
        </nav>

        <div class="site-header__actions">
          <a class="site-header__icon-btn u-hide-mobile" href="${SiteNav.home.href}" title="Home dashboard" aria-label="Home dashboard">
            <i class="fa-solid fa-house"></i>
          </a>
          <button class="site-header__icon-btn" id="siteHeaderThemeBtn" title="Toggle theme" aria-label="Toggle light and dark theme">
            <i class="fa-solid fa-moon" data-site-theme-icon></i>
          </button>
          <button class="site-header__hamburger" id="siteHeaderHamburger" aria-expanded="false" aria-controls="siteHeaderMenu" aria-label="Open menu">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </header>
    `;

    wireInteractions();
    if (window.SiteTheme) window.SiteTheme.init();
  }

  function wireInteractions() {
    const header = document.getElementById('siteHeader');
    const navToggle = document.getElementById('siteHeaderNavToggle');
    const hamburger = document.getElementById('siteHeaderHamburger');
    const menu = document.getElementById('siteHeaderMenu');
    const themeBtn = document.getElementById('siteHeaderThemeBtn');

    function openMenu() {
      menu.hidden = false;
      navToggle.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-expanded', 'true');
      header.classList.add('site-header--menu-open');
    }
    function closeMenu() {
      menu.hidden = true;
      navToggle.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-expanded', 'false');
      header.classList.remove('site-header--menu-open');
    }
    function toggleMenu() {
      if (menu.hidden) openMenu(); else closeMenu();
    }

    navToggle.addEventListener('click', toggleMenu);
    hamburger.addEventListener('click', toggleMenu);

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    themeBtn.addEventListener('click', () => {
      if (window.SiteTheme) window.SiteTheme.toggle();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
