/* ==========================================================================
   utils.js — small shared helpers (no dependency on any page's own logic)
   ========================================================================== */
window.SiteUtils = (function () {
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function currentPageFile() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  return { debounce, qs, qsa, currentPageFile };
})();
