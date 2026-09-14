/**
 * PROPERTY MANAGER PRO — UI NAVIGATION MODULE
 * ===========================================
 * Page routing, sidebar controls, filter accordions, and theme management.
 */

(function(global) {
  'use strict';

  let currentPage = 'dashboard';
  let navStack = ['dashboard'];
  global.isClosingViaHistory = false;
  global.isClosingViaCode = false;

  /**
   * Toggles collapsible filter group accordion.
   */
  function toggleFilterCollapse(groupId, btnId) {
    const grp = document.getElementById(groupId);
    const btn = document.getElementById(btnId);
    if (!grp) return;
    const isOpen = grp.classList.toggle('open');
    if (btn) {
      btn.classList.toggle('active', isOpen);
      btn.innerHTML = isOpen ? '⚡ Filter ▲' : '⚡ Filter ▼';
    }
  }

  /**
   * Toggles mobile sidebar open / closed state.
   */
  function toggleSidebar(force) {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebarBackdrop');
    if (!sb) return;
    const isOpen = typeof force === 'boolean' ? force : !sb.classList.contains('open');
    sb.classList.toggle('open', isOpen);
    if (bd) bd.classList.toggle('show', isOpen);
  }

  /**
   * Switches active application page and updates browser history stack.
   */
  function showPage(page, shouldPush = true) {
    if (shouldPush) {
      if (page === currentPage && !document.querySelector('.modal-bg.show, .lightbox.show')) {
        return;
      }
      // Close any open modals when navigating via menu/buttons
      document.querySelectorAll('.modal-bg.show, .lightbox.show').forEach(m => {
        if (m.id !== 'exitConfirmModal') m.classList.remove('show');
      });

      if (page === 'dashboard') {
        if (navStack.length > 1) {
          let steps = navStack.length - 1;
          navStack = ['dashboard'];
          history.go(-steps);
          renderPageDOM(page);
          return;
        }
      } else {
        let existingIdx = navStack.lastIndexOf(page);
        if (existingIdx !== -1 && existingIdx < navStack.length - 1) {
          let steps = (navStack.length - 1) - existingIdx;
          navStack = navStack.slice(0, existingIdx + 1);
          history.go(-steps);
          renderPageDOM(page);
          return;
        } else {
          navStack.push(page);
          history.pushState({ crmApp: true, page: page, depth: navStack.length - 1 }, '');
        }
      }
    }

    renderPageDOM(page);
  }

  /**
   * Renders DOM for the requested page.
   */
  function renderPageDOM(page) {
    currentPage = page;
    global.currentPage = page;

    if (window.innerWidth <= 992 || window.innerHeight <= 550) {
      toggleSidebar(false);
    }
    const mbNav = document.getElementById('mobileBottomNav');
    if (mbNav) mbNav.classList.remove('nav-hidden');

    document.querySelectorAll('[id$="Page"]').forEach(x => x.style.display = 'none');
    let target = document.getElementById(page + 'Page');
    if (target) target.style.display = '';
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.page === page));

    // Hide duplicate top header on mobile when viewing Upcoming Projects
    const topHeader = document.querySelector('.top');
    if (topHeader) {
      topHeader.classList.toggle('hide-on-upcoming', page === 'upcoming');
    }
    document.body.classList.toggle('page-upcoming', page === 'upcoming');

    let titles = {
      dashboard: ['Property Manager', 'Manage your properties, projects & follow-ups'],
      properties: ['Properties', 'Search, filter, update and manage every property.'],
      directProperty: ['Direct Property', 'Properties personally sourced directly from clients and owners.'],
      upcoming: ['Upcoming Projects', 'Explore and manage future project launches, luxury & economical pipelines.'],
      favorites: ['Favorites', 'Your combined shortlisted properties and upcoming projects.'],
      followups: ['Follow-ups', 'Keep track of upcoming calls and visits.'],
      search: ['Master Search', 'Search across all properties, upcoming projects, locations & contacts.'],
      profile: ['Profile', 'Manage your personal details and view your real-time activity summary.'],
      settings: ['Settings', 'Categories & Filters configuration and management.'],
      history: ['History', 'Review system import logs and recover recently deleted items within 5 days.'],
      about: ['About & How to Use', 'Complete user guide, workflows, and practical tips for Property Manager Pro.']
    };
    if (titles[page]) {
      const pageTitleEl = document.getElementById('pageTitle');
      const pageSubEl = document.getElementById('pageSub');
      if (pageTitleEl) pageTitleEl.textContent = titles[page][0];
      if (pageSubEl) pageSubEl.textContent = titles[page][1];
    }

    let topBtn = document.getElementById('topAddBtn');
    if (topBtn) {
      if (page === 'upcoming') {
        topBtn.textContent = '＋ Add Project';
        topBtn.style.display = '';
      } else if (page === 'directProperty') {
        topBtn.textContent = '＋ Add Direct Property';
        topBtn.style.display = '';
      } else if (page === 'profile' || page === 'search' || page === 'settings' || page === 'about' || page === 'history') {
        topBtn.style.display = 'none';
      } else {
        topBtn.textContent = '＋ Add Property';
        topBtn.style.display = '';
      }
    }

    if (typeof window !== 'undefined' && (window.innerWidth <= 992 || window.innerHeight <= 550)) {
      document.getElementById('sidebar')?.classList.remove('open');
    }

    // Trigger page-specific renders
    if (page === 'properties' && typeof global.renderProperties === 'function') global.renderProperties();
    if (page === 'directProperty' && typeof global.renderDirectProperties === 'function') global.renderDirectProperties();
    if (page === 'upcoming' && typeof global.renderUpcoming === 'function') global.renderUpcoming();
    if (page === 'favorites' && typeof global.renderFavorites === 'function') global.renderFavorites();
    if (page === 'followups' && typeof global.renderFollowups === 'function') global.renderFollowups();
    if (page === 'search' && typeof global.renderMasterSearch === 'function') global.renderMasterSearch();
    if (page === 'profile') {
      if (typeof global.renderProfile === 'function') global.renderProfile();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (page === 'settings') {
      if (typeof global.renderSettingsPage === 'function') global.renderSettingsPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { if (typeof global.centerActiveSettingsTab === 'function') global.centerActiveSettingsTab(false); }, 60);
    }
    if (page === 'history') {
      if (typeof global.renderHistoryPage === 'function') global.renderHistoryPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (page === 'dashboard' && typeof global.renderDashboard === 'function') global.renderDashboard();
    if (page === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Dispatches Add button click based on active page context.
   */
  function handleTopAdd() {
    if (currentPage === 'upcoming') {
      if (typeof global.openProjectForm === 'function') global.openProjectForm();
    } else if (currentPage === 'directProperty') {
      if (typeof global.openDirectPropertyForm === 'function') global.openDirectPropertyForm();
    } else {
      if (typeof global.openForm === 'function') global.openForm();
    }
  }

  /**
   * Theme toggling between Light and Dark mode.
   */
  function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme') || 'light';
    let next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('property_manager_theme', next); } catch (e) {}
    updateThemeMenuLabel();
  }

  function updateThemeMenuLabel() {
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let iconEl = document.getElementById('sidebarThemeIcon');
    let textEl = document.getElementById('sidebarThemeText');
    let btnEl = document.getElementById('sidebarThemeBtn');
    let mbIconEl = document.getElementById('mbThemeIcon');
    let mbTextEl = document.getElementById('mbThemeText');

    if (iconEl) iconEl.textContent = isDark ? '☀️' : '🌙';
    if (textEl) textEl.textContent = isDark ? 'Light' : 'Dark';
    if (btnEl) btnEl.title = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    if (mbIconEl) mbIconEl.textContent = isDark ? '☀️' : '🌙';
    if (mbTextEl) mbTextEl.textContent = isDark ? 'Light' : 'Dark';
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('property_manager_theme'); } catch (e) {}
    if (!saved) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        saved = 'dark';
      } else {
        saved = 'light';
      }
    }
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeMenuLabel();
  }

  /**
   * Sidebar collapse state (desktop icon-only mode).
   */
  function isSidebarCollapsed() {
    return document.body.classList.contains('sidebar-collapsed');
  }

  function setSidebarCollapsed(collapsed) {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    try {
      localStorage.setItem('property_manager_sidebar_collapsed', collapsed ? 'true' : 'false');
    } catch (e) {}

    const toggleBtn = document.getElementById('sidebarToggleBtn');
    if (toggleBtn) {
      toggleBtn.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      toggleBtn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      toggleBtn.innerHTML = collapsed ? '▶' : '▣';
    }
  }

  function toggleSidebarCollapse() {
    if (window.innerWidth <= 992) {
      toggleSidebar(false);
      return;
    }
    setSidebarCollapsed(!isSidebarCollapsed());
  }

  function initSidebarCollapse() {
    let saved = false;
    try {
      saved = localStorage.getItem('property_manager_sidebar_collapsed') === 'true';
    } catch (e) {}

    if (saved && window.innerWidth > 992) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }

  /**
   * Mobile bottom navigation & quick search jump.
   */
  let lastScrollY = 0;
  let scrollTicking = false;
  let isProgrammaticScroll = false;

  function handleMobileSearchNav() {
    showPage('properties');
    setTimeout(() => {
      let s = document.getElementById('search');
      if (s) {
        s.focus();
        s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  function initScrollNavbar() {
    if (typeof window === 'undefined') return;
    const onScrollOrTouch = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          handleNavbarScroll();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    window.addEventListener('scroll', onScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', onScrollOrTouch, { passive: true });

    window.addEventListener('resize', () => {
      const nav = document.getElementById('mobileBottomNav');
      if (nav) nav.classList.remove('nav-hidden');
      lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const nav = document.getElementById('mobileBottomNav');
        if (nav) nav.classList.remove('nav-hidden');
        lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      }, 150);
    });
  }

  function handleNavbarScroll() {
    const nav = document.getElementById('mobileBottomNav');
    if (!nav) return;

    const navDisplay = window.getComputedStyle(nav).display;
    if (navDisplay === 'none') {
      if (nav.classList.contains('nav-hidden')) {
        nav.classList.remove('nav-hidden');
      }
      return;
    }

    if (isProgrammaticScroll) {
      nav.classList.remove('nav-hidden');
      return;
    }

    const rawScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
    const currentScrollY = Math.max(0, Math.min(maxScroll, rawScrollY));

    if (currentScrollY <= 25) {
      nav.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    const delta = currentScrollY - lastScrollY;
    if (Math.abs(delta) < 8) return;

    if (delta > 0 && currentScrollY > 50) {
      nav.classList.add('nav-hidden');
      closeBottomMenu();
    } else if (delta < 0) {
      nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  }

  function navigateTo(target) {
    closeBottomMenu();
    const nav = document.getElementById('mobileBottomNav');
    if (nav) nav.classList.remove('nav-hidden');
    isProgrammaticScroll = true;

    showPage(target);

    if (target === 'search') {
      setTimeout(() => {
        let s = document.getElementById('masterSearchInput');
        if (s) {
          s.focus();
          s.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isProgrammaticScroll = false;
      lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (nav) nav.classList.remove('nav-hidden');
    }, 600);
  }

  function toggleBottomMenu() {
    const popup = document.getElementById('bottomMenuPopup') || document.getElementById('bottomMoreMenu');
    const backdrop = document.getElementById('bottomMenuBackdrop');
    if (!popup) return;
    const isShow = !popup.classList.contains('show');
    popup.classList.toggle('show', isShow);
    if (backdrop) backdrop.classList.toggle('show', isShow);
  }

  function closeBottomMenu() {
    const popup = document.getElementById('bottomMenuPopup') || document.getElementById('bottomMoreMenu');
    const backdrop = document.getElementById('bottomMenuBackdrop');
    if (popup) popup.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
  }

  /**
   * Browser Back / Forward History and Modal Stack Observer
   */
  function onModalOpened(modalId) {
    if (modalId === 'exitConfirmModal') return;
    if (!history.state || history.state.modal !== modalId) {
      history.pushState({ crmApp: true, page: currentPage, depth: navStack.length - 1, modal: modalId }, '');
    }
  }

  function showExitConfirmation() {
    let m = document.getElementById('exitConfirmModal');
    if (m) m.classList.add('show');
  }

  function handleExitConfirmNo() {
    let m = document.getElementById('exitConfirmModal');
    if (m) m.classList.remove('show');
    history.pushState({ crmApp: true, page: 'dashboard', depth: 0 }, '');
  }

  function handleExitConfirmYes() {
    let m = document.getElementById('exitConfirmModal');
    if (m) m.classList.remove('show');
    try {
      window.close();
    } catch (e) {}
    setTimeout(() => {
      try {
        history.back();
      } catch (e) {}
    }, 60);
  }

  function initModalHistoryObserver() {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const target = m.target;
          if (target.id && target.id !== 'exitConfirmModal') {
            if (target.classList.contains('show')) {
              onModalOpened(target.id);
            } else if (history.state?.modal === target.id && !global.isClosingViaHistory && !global.isClosingViaCode) {
              global.isClosingViaCode = true;
              history.back();
            }
          }
        }
      }
    });
    document.querySelectorAll('.modal-bg, .lightbox').forEach(el => {
      observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function initHistory() {
    if (typeof window === 'undefined') return;
    if (!history.state || !history.state.crmApp) {
      history.replaceState({ crmApp: true, isExitBase: true }, '');
      history.pushState({ crmApp: true, page: 'dashboard', depth: 0 }, '');
    }
    initModalHistoryObserver();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', function(e) {
      if (global.isClosingViaCode) {
        global.isClosingViaCode = false;
        return;
      }

      let state = e.state;

      // 1. If Exit Confirmation was open and user pressed Back again -> exit
      let exitModal = document.getElementById('exitConfirmModal');
      if (exitModal && exitModal.classList.contains('show')) {
        handleExitConfirmYes();
        return;
      }

      // 2. If user backed up to isExitBase (pressed Back on Dashboard)
      if (!state || state.isExitBase) {
        showExitConfirmation();
        return;
      }

      // 3. If a modal is open in DOM that is NOT the state modal -> close it
      let openModals = Array.from(document.querySelectorAll('.modal-bg.show, .lightbox.show'))
        .filter(el => el.id !== 'exitConfirmModal');

      if (openModals.length > 0) {
        let topModal = openModals[openModals.length - 1];
        if (!state.modal || state.modal !== topModal.id) {
          global.isClosingViaHistory = true;
          topModal.classList.remove('show');
          global.isClosingViaHistory = false;
          return;
        }
      }

      // 4. Page navigation back
      if (state.page) {
        let targetDepth = typeof state.depth === 'number' ? state.depth : 0;
        navStack = navStack.slice(0, targetDepth + 1);
        if (navStack[navStack.length - 1] !== state.page) {
          navStack[targetDepth] = state.page;
        }
        showPage(state.page, false);
      }
    });
  }

  // Export to global scope
  global.currentPage = currentPage;
  global.navStack = navStack;
  global.toggleFilterCollapse = toggleFilterCollapse;
  global.toggleSidebar = toggleSidebar;
  global.showPage = showPage;
  global.renderPageDOM = renderPageDOM;
  global.handleTopAdd = handleTopAdd;
  global.toggleTheme = toggleTheme;
  global.updateThemeMenuLabel = updateThemeMenuLabel;
  global.initTheme = initTheme;
  global.isSidebarCollapsed = isSidebarCollapsed;
  global.setSidebarCollapsed = setSidebarCollapsed;
  global.toggleSidebarCollapse = toggleSidebarCollapse;
  global.initSidebarCollapse = initSidebarCollapse;
  global.navigateTo = navigateTo;
  global.toggleBottomMenu = toggleBottomMenu;
  global.closeBottomMenu = closeBottomMenu;
  global.handleMobileSearchNav = handleMobileSearchNav;
  global.initScrollNavbar = initScrollNavbar;
  global.handleNavbarScroll = handleNavbarScroll;
  global.onModalOpened = onModalOpened;
  global.showExitConfirmation = showExitConfirmation;
  global.handleExitConfirmNo = handleExitConfirmNo;
  global.handleExitConfirmYes = handleExitConfirmYes;
  global.initModalHistoryObserver = initModalHistoryObserver;
  global.initHistory = initHistory;

})(typeof window !== 'undefined' ? window : globalThis);
