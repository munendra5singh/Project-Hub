/* ==========================================================================
   theme.js — shared theme sync for the common header
   Does NOT replace any page's existing dark-mode logic. It only:
   1) reads the same "globalDarkMode" key pages already use, to paint the
      header's own icon correctly on load, and
   2) when the header's theme button is clicked, prefers calling the page's
      own toggle function/button (if one exists) so existing per-page
      behavior (icons, checkboxes, etc.) keeps working unmodified.
   ========================================================================== */
window.SiteTheme = (function () {
  const STORAGE_KEY = 'globalDarkMode';

  function isDark() {
    return document.body.classList.contains('dark-mode') ||
      document.body.getAttribute('data-theme') === 'dark' ||
      localStorage.getItem(STORAGE_KEY) === 'enabled';
  }

  function paintHeaderIcon() {
    const icon = document.querySelector('[data-site-theme-icon]');
    if (!icon) return;
    icon.className = isDark() ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  function toggle() {
    // Prefer whatever theme toggle the page already ships, so its own
    // icon/checkbox/state updates keep working exactly as before.
    if (typeof window.toggleGlobalDashboardTheme === 'function') {
      window.toggleGlobalDashboardTheme();
    } else if (typeof window.toggleThemeEngine === 'function') {
      window.toggleThemeEngine();
    } else {
      const pageToggle = document.getElementById('theme-toggle');
      if (pageToggle) {
        pageToggle.click();
      } else {
        // Fallback for pages with no bespoke toggle at all.
        const darkNow = document.body.classList.toggle('dark-mode');
        localStorage.setItem(STORAGE_KEY, darkNow ? 'enabled' : 'disabled');
      }
    }
    setTimeout(paintHeaderIcon, 0);
  }

  function init() {
    paintHeaderIcon();
  }

  return { init, toggle, isDark };
})();
