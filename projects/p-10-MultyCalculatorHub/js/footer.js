/* ==========================================================================
   footer.js — builds the common footer into <div id="site-footer-root">
   Edit PLATFORMS below to point at your real URLs whenever they're ready.
   ========================================================================== */
(function () {
  var PLATFORMS = [
    { name: 'FreeCourseHub', tag: 'Free verified course links', icon: 'fa-graduation-cap', href: 'https://munendra5singh.github.io/FreeCourseHub/' },
    { name: 'ExcelSuperGuru', tag: 'Excel tips & templates', icon: 'fa-table', href: 'https://munendra5singh.github.io/ExcelSuperGuru/' },
    { name: 'Multy Calculator Hub', tag: 'Multi-purpose calculators', icon: 'fa-calculator', href: '#' },
    { name: 'smartcalcAi', tag: 'AI powered calculations', icon: 'fa-brain', href: 'https://munendra5singh.github.io/smartCalcAi/' }
  ];

  function quickLinks() {
    var flat = [];
    SiteNav.groups.forEach(function (g) { flat = flat.concat(g.links); });
    return flat.slice(0, 6).map(function (l) {
      return '<li><a href="' + l.href + '">' + l.label + '</a></li>';
    }).join('');
  }

  function platformCards() {
    return PLATFORMS.map(function (p) {
      return (
        '<a class="site-footer__platform-card" href="' + p.href + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="site-footer__platform-icon"><i class="fa-solid ' + p.icon + '"></i></span>' +
          '<span><span class="site-footer__platform-name">' + p.name + '</span><br>' +
          '<span class="site-footer__platform-tag">' + p.tag + '</span></span>' +
        '</a>'
      );
    }).join('');
  }

  function render() {
    var root = document.getElementById('site-footer-root');
    if (!root) return;
    var year = new Date().getFullYear();

    root.innerHTML =
      '<footer class="site-footer">' +
        '<div class="site-footer__inner">' +
          '<div class="site-footer__brand-col">' +
            '<a class="site-footer__brand" href="' + SiteNav.home.href + '"><span class="site-header__logo">🧰</span> Web Tool Box</a>' +
            '<p>A free, all-in-one collection of calculators and utility tools &mdash; built to be fast, private, and always available.</p>' +
            '<div class="site-footer__social">' +
              '<a href="https://munendra5singh.github.io/FreeCourseHub/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>' +
              '<a href="#" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>' +
              '<a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>' +
            '</div>' +
          '</div>' +
          '<div class="site-footer__col">' +
            '<h4>Company</h4>' +
            '<ul>' +
              '<li><a href="index.html">About</a></li>' +
              '<li><a href="#">Privacy</a></li>' +
              '<li><a href="#">Terms</a></li>' +
              '<li><a href="#">Contact</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="site-footer__col">' +
            '<h4>Quick Links</h4>' +
            '<ul>' + quickLinks() + '</ul>' +
          '</div>' +
          '<div class="site-footer__col">' +
            '<h4>Our Platforms</h4>' +
            '<div class="site-footer__platforms">' + platformCards() + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="site-footer__bottom">' +
          '<span>&copy; ' + year + ' Web Tool Box &mdash; Powered by <a href="https://munendra5singh.github.io/FreeCourseHub/" target="_blank" rel="noopener noreferrer">FreeCourseHub</a></span>' +
          '<span>Designed by Munendra</span>' +
        '</div>' +
      '</footer>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
