/**
 * PROPERTY MANAGER PRO — MAIN BOOTSTRAP APPLICATION
 * =================================================
 * Orchestrates modules, event handlers, keyboard shortcuts, and app lifecycle.
 */

(function(global) {
  'use strict';

  /**
   * Renders all active modules across the application.
   */
  function renderAll() {
    if (typeof global.populateAllConfigDropdowns === 'function') {
      global.populateAllConfigDropdowns();
    }
    if (typeof global.renderDashboard === 'function') {
      global.renderDashboard();
    }
    const propPage = document.getElementById('propertiesPage');
    if (propPage && propPage.style.display !== 'none' && typeof global.renderProperties === 'function') {
      global.renderProperties();
    }
    const directPage = document.getElementById('directPropertyPage');
    if (directPage && directPage.style.display !== 'none' && typeof global.renderDirectProperties === 'function') {
      global.renderDirectProperties();
    }
    const upPage = document.getElementById('upcomingPage');
    if (upPage && upPage.style.display !== 'none' && typeof global.renderUpcoming === 'function') {
      global.renderUpcoming();
    }
    if (typeof global.renderFavorites === 'function') {
      global.renderFavorites();
    }
    if (typeof global.renderFollowups === 'function') {
      global.renderFollowups();
    }
    const searchPage = document.getElementById('searchPage');
    if (searchPage && searchPage.style.display !== 'none' && typeof global.renderMasterSearch === 'function') {
      global.renderMasterSearch();
    }
    const settingsPage = document.getElementById('settingsPage');
    if (settingsPage && settingsPage.style.display !== 'none' && typeof global.renderSettingsPage === 'function') {
      global.renderSettingsPage();
    }
    const historyPage = document.getElementById('historyPage');
    if (historyPage && historyPage.style.display !== 'none' && typeof global.renderHistoryPage === 'function') {
      global.renderHistoryPage();
    }
    if (typeof global.renderProfile === 'function') {
      global.renderProfile();
    }
  }

  /**
   * Global Keyboard Shortcuts (Escape, Ctrl/Cmd + K).
   */
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const lb = document.getElementById('lightboxModal');
        if (lb && lb.classList.contains('show')) {
          lb.classList.remove('show');
          return;
        }
        const notice = document.getElementById('actionNoticeModal');
        if (notice && notice.classList.contains('show')) {
          notice.classList.remove('show');
          return;
        }
        document.querySelectorAll('.modal-bg:not(#profileSetupModal)').forEach((x) => x.classList.remove('show'));
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (global.currentPage === 'upcoming') {
          const s = document.getElementById('upSearch');
          if (s) s.focus();
        } else {
          if (typeof global.showPage === 'function') global.showPage('search');
          setTimeout(() => {
            const s = document.getElementById('masterSearchInput');
            if (s) s.focus();
          }, 100);
        }
      }
    });
  }

  /**
   * Closes modals when clicking on background backdrop.
   */
  function setupBackdropListeners() {
    document.querySelectorAll('.modal-bg').forEach((x) => {
      x.addEventListener('click', (e) => {
        if (e.target === x && x.id !== 'profileSetupModal' && x.id !== 'exitConfirmModal') {
          if (typeof global.closeModal === 'function') global.closeModal(x.id);
        }
      });
    });
  }

  /**
   * Sidebar navigation button click binding.
   */
  function setupNavigationButtons() {
    document.querySelectorAll('.nav button[data-page]').forEach((b) => {
      b.onclick = () => {
        if (typeof global.showPage === 'function') {
          global.showPage(b.dataset.page);
        }
      };
    });
  }

  /**
   * Main application bootstrap sequence.
   */
  function initApp() {
    setupBackdropListeners();
    setupKeyboardShortcuts();
    setupNavigationButtons();

    renderAll();
    if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
    if (typeof global.initStorage === 'function') global.initStorage();
    if (typeof global.initTheme === 'function') global.initTheme();
    if (typeof global.initScrollNavbar === 'function') global.initScrollNavbar();
    if (typeof global.initSidebarCollapse === 'function') global.initSidebarCollapse();

    const settingsAddBtnEl = document.getElementById('settingsAddBtn');
    if (settingsAddBtnEl) {
      settingsAddBtnEl.addEventListener('click', () => {
        if (typeof global.openConfigModal === 'function') global.openConfigModal('add');
      });
    }

    if (typeof global.initHistory === 'function') global.initHistory();

    const isProfileDone = typeof global.isProfileSetupCompleted === 'function' ? global.isProfileSetupCompleted() : true;
    if (!isProfileDone) {
      if (typeof global.showPage === 'function') global.showPage('dashboard', false);
      if (typeof global.openProfileSetupModal === 'function') global.openProfileSetupModal();
    } else {
      if (typeof global.showPage === 'function') global.showPage('dashboard', false);
    }
  }

  // Export to global scope
  global.renderAll = renderAll;
  global.initApp = initApp;

  // Bootstrap when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }

})(typeof window !== 'undefined' ? window : globalThis);
