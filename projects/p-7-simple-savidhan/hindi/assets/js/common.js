/* ============================================================
   SAVIDHAN — SHARED COMMON JAVASCRIPT
   Simple Savidhan: Know Your Rights. Know Your Law.
   ============================================================ */

(function () {
  'use strict';

  /* ======================
     1. THEME SYSTEM
     ====================== */
  const THEME_KEY = 'savidhan-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function(btn) {
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', label);
    });
  }

  function initTheme() {
    const theme = getPreferredTheme();
    // Apply immediately to prevent flash
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  // Apply theme ASAP (runs synchronously when script loads)
  initTheme();

  function bindThemeToggle() {
    document.querySelectorAll('.theme-toggle').forEach(function(btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
      });
    });
  }


  /* ======================
     2. MOBILE NAVIGATION
     ====================== */
  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger-btn');
    var navLinks = document.querySelector('.sv-navbar .nav-links');
    if (!hamburger || !navLinks) return;

    function openMenu() {
      navLinks.classList.add('mobile-open');
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      navLinks.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
      var isOpen = navLinks.classList.contains('mobile-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Toggle on hamburger click
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // Reset on resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 900) {
          closeMenu();
        }
      }, 100);
    });
  }


  /* ======================
     3. SMART NAVBAR SCROLL
     ====================== */
  function initSmartNavbar() {
    var navbar = document.querySelector('.sv-navbar');
    if (!navbar) return;

    var lastScrollY = window.scrollY;
    var ticking = false;
    var scrollThreshold = 5; // Minimum scroll to trigger hide/show
    var hideThreshold = 80; // Don't hide until scrolled this far

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        var currentScrollY = window.scrollY;
        var diff = currentScrollY - lastScrollY;

        if (Math.abs(diff) < scrollThreshold) {
          ticking = false;
          return;
        }

        if (diff > 0 && currentScrollY > hideThreshold) {
          // Scrolling DOWN — hide navbar
          navbar.classList.add('navbar-hidden');
        } else if (diff < 0) {
          // Scrolling UP — show navbar immediately
          navbar.classList.remove('navbar-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ======================
     4. LANGUAGE DROPDOWN
     ====================== */
  function initLanguageDropdown() {
    var langBtn = document.getElementById('langBtn');
    var langMenu = document.getElementById('langMenu');
    if (!langBtn || !langMenu) return;

    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      langMenu.classList.toggle('show');
    });

    document.addEventListener('click', function (e) {
      if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.remove('show');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        langMenu.classList.remove('show');
      }
    });
  }


  /* ======================
     5. INIT ON DOM READY
     ====================== */
  function init() {
    bindThemeToggle();
    initMobileNav();
    initSmartNavbar();
    initLanguageDropdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
