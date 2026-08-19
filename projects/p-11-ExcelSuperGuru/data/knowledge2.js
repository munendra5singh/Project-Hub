/* ==========================================================================
   ExcelSuperGuru — Knowledge Hub Interactions (Production Patch)
   ========================================================================== */
(function () {
  "use strict";

  const topics = Array.from(document.querySelectorAll(".topic"));
  const LS = {
    theme: "esg_theme",
    bookmarks: "esg_bookmarks",
    recent: "esg_recent",
  };

  /* ---------------------------------------------------------------------
      Theme Engine (Light / Dark) — Optimized State Machine
  --------------------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  
  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    try { 
      localStorage.setItem(LS.theme, mode); 
    } catch (e) {}
  }

  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS.theme); } catch (e) {}
    
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  /* ---------------------------------------------------------------------
      Smart Navbar Animation Engine (Hide on Scroll Down, Show on Scroll Up)
  --------------------------------------------------------------------- */
  let lastScrollTop = 0;
  const header = document.querySelector('.site-header');

  if (header) {
    window.addEventListener('scroll', () => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // स्क्रॉल डाउन: नेवबार छुपाएं
        header.classList.add('nav-hidden');
      } else {
        // स्क्रॉल अप: नेवबार वापस दिखाएं
        header.classList.remove('nav-hidden');
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
      Table of Contents Generator
  --------------------------------------------------------------------- */
  const tocNav = document.getElementById("tocNav");
  if (tocNav) {
    topics.forEach((sec) => {
      const a = document.createElement("a");
      a.href = "#" + sec.id;
      a.dataset.target = sec.id;
      a.innerHTML = `<span class="toc-ref">${sec.dataset.ref || 'A1'}</span><span>${sec.dataset.title || ''}</span>`;
      tocNav.appendChild(a);
    });
  }
  const tocLinks = tocNav ? Array.from(tocNav.querySelectorAll("a")) : [];

  /* ---------------------------------------------------------------------
      Scroll Spy & Performance Throttled Progress Bar
  --------------------------------------------------------------------- */
  const progressFill = document.getElementById("progressFill");
  const miniProgressFill = document.getElementById("miniProgressFill");
  const miniProgressLabel = document.getElementById("miniProgressLabel");
  const backToTop = document.getElementById("backToTop");
  const readingTimeEl = document.getElementById("readingTime");

  if (readingTimeEl && document.querySelector(".content")) {
    const words = document.querySelector(".content").innerText.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    readingTimeEl.textContent = `~${minutes} min read`;
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        
        if (progressFill) progressFill.style.width = pct + "%";
        if (miniProgressFill) miniProgressFill.style.width = pct + "%";
        if (miniProgressLabel) miniProgressLabel.textContent = Math.round(pct) + "% of page read";
        if (backToTop) backToTop.classList.toggle("show", scrollTop > 600);
        
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Intersection Observer for Active Elements Tracking
  if (tocNav && topics.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = tocNav.querySelector(`a[data-target="${entry.target.id}"]`);
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove("active"));
            if (link) {
              link.classList.add("active");
              link.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            trackRecentlyViewed(entry.target);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    topics.forEach((sec) => observer.observe(sec));
  }

  /* ---------------------------------------------------------------------
      Recently Viewed Log
  --------------------------------------------------------------------- */
  const recentList = document.getElementById("recentList");
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(LS.recent) || "[]"); } catch (e) { return []; }
  }
  function trackRecentlyViewed(sec) {
    let recents = getRecent().filter((id) => id !== sec.id);
    recents.unshift(sec.id);
    recents = recents.slice(0, 5);
    try { localStorage.setItem(LS.recent, JSON.stringify(recents)); } catch (e) {}
    renderRecent();
  }
  function renderRecent() {
    if (!recentList) return;
    const recents = getRecent();
    if (!recents.length) { recentList.innerHTML = '<li class="muted">Nothing yet</li>'; return; }
    recentList.innerHTML = recents
      .map((id) => {
        const sec = document.getElementById(id);
        if (!sec) return "";
        return `<li><a href="#${id}">${sec.dataset.title}</a></li>`;
      })
      .join("");
  }
  renderRecent();

  /* ---------------------------------------------------------------------
      Bookmarks Storage Interface
  --------------------------------------------------------------------- */
  const bookmarkList = document.getElementById("bookmarkList");
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(LS.bookmarks) || "[]"); } catch (e) { return []; }
  }
  function setBookmarks(arr) {
    try { localStorage.setItem(LS.bookmarks, JSON.stringify(arr)); } catch (e) {}
  }
  function renderBookmarks() {
    if (!bookmarkList) return;
    const marks = getBookmarks();
    if (!marks.length) { bookmarkList.innerHTML = '<li class="muted">No bookmarks yet</li>'; return; }
    bookmarkList.innerHTML = marks
      .map((id) => {
        const sec = document.getElementById(id);
        if (!sec) return "";
        return `<li><a href="#${id}">${sec.dataset.title}</a></li>`;
      })
      .join("");
  }

  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    const sec = btn.closest(".topic");
    if (!sec) return;
    const id = sec.id;
    if (getBookmarks().includes(id)) btn.classList.add("active");
    
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let marks = getBookmarks();
      if (marks.includes(id)) {
        marks = marks.filter((m) => m !== id);
        btn.classList.remove("active");
      } else {
        marks.push(id);
        btn.classList.add("active");
      }
      setBookmarks(marks);
      renderBookmarks();
    });
  });
  renderBookmarks();

  const bookmarksToggle = document.getElementById("bookmarksToggle");
  if (bookmarksToggle && bookmarkList) {
    bookmarksToggle.addEventListener("click", () => {
      bookmarkList.closest(".sidebar-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------------------------------------------------------------------
      Interactive Clipboard Matrix
  --------------------------------------------------------------------- */
  document.querySelectorAll(".copy-link-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const topicEl = btn.closest(".topic");
      if (!topicEl) return;
      const url = `${window.location.origin}${window.location.pathname}#${topicEl.id}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          const original = btn.textContent;
          btn.textContent = "✓";
          btn.style.color = "var(--accent)";
          setTimeout(() => { btn.textContent = original; btn.style.color = ""; }, 1200);
        }).catch(() => {});
      }
    });
  });

  /* ---------------------------------------------------------------------
      Mobile Navigation Engine (Safe Handling — Fixed Conflict)
  --------------------------------------------------------------------- */
  const tocSidebar = document.getElementById("tocSidebar");
  
  tocLinks.forEach((a) =>
    a.addEventListener("click", () => {
      if (tocSidebar) tocSidebar.classList.remove("open");
    })
  );

  /* ---------------------------------------------------------------------
      Unified Global Live Search Engine
  --------------------------------------------------------------------- */
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  function buildSearchIndex() {
    const index = [];
    topics.forEach((sec) => {
      index.push({
        ref: sec.dataset.ref || "A1",
        title: sec.dataset.title || "Topic",
        id: sec.id,
        haystack: ((sec.dataset.title || "") + " " + (sec.dataset.keywords || "")).toLowerCase(),
      });
    });

    document.querySelectorAll(".func-card").forEach((card) => {
      const codeEl = card.querySelector("h4 code");
      const panel = card.closest(".func-panel");
      if (!codeEl) return;
      index.push({
        ref: "fx",
        title: codeEl.textContent + " (Function)",
        id: "sec-functions",
        haystack: card.textContent.toLowerCase(),
        onSelect: () => { if (panel) activateFuncTab(panel.dataset.cat); }
      });
    });

    document.querySelectorAll(".acc-item").forEach((item) => {
      const trigger = item.querySelector(".acc-trigger");
      const parentSection = item.closest(".topic");
      if (!trigger || !parentSection) return;
      index.push({
        ref: parentSection.dataset.ref || "FAQ",
        title: trigger.textContent,
        id: parentSection.id,
        haystack: item.textContent.toLowerCase(),
        onSelect: () => item.classList.add("open"),
      });
    });

    return index;
  }
  
  const searchIndex = buildSearchIndex();

  function runSearch(query) {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    if (!q) { searchResults.hidden = true; searchResults.innerHTML = ""; return; }
    
    const matches = searchIndex.filter((item) => item.haystack.includes(q)).slice(0, 8);
    if (!matches.length) {
      searchResults.innerHTML = `<div class="sr-empty">No matches found for "${escapeHtml(query)}"</div>`;
    } else {
      searchResults.innerHTML = matches
        .map((m, i) => `<a href="#${m.id}" data-idx="${i}"><span class="sr-ref">${m.ref}</span>${escapeHtml(m.title)}</a>`)
        .join("");
    }
    searchResults.hidden = false;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => runSearch(searchInput.value));
  }

  if (searchResults) {
    searchResults.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-idx]");
      if (!a) return;
      const idx = Number(a.dataset.idx);
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      const matches = searchIndex.filter((item) => item.haystack.includes(q));
      const match = matches[idx];
      if (match && match.onSelect) setTimeout(() => match.onSelect(), 50);
      searchResults.hidden = true;
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!searchInput) return;
      const q = searchInput.value.trim().toLowerCase();
      const first = searchIndex.find((item) => item.haystack.includes(q));
      if (first) {
        document.getElementById(first.id)?.scrollIntoView({ behavior: "smooth" });
        if (first.onSelect) setTimeout(first.onSelect, 300);
      }
      if (searchResults) searchResults.hidden = true;
    });
  }

  document.addEventListener("click", (e) => {
    if (searchForm && !searchForm.contains(e.target) && searchResults) searchResults.hidden = true;
  });

  /* ---------------------------------------------------------------------
      Function Library Category Controls
  --------------------------------------------------------------------- */
  const funcTabs = document.querySelectorAll(".func-tab");
  function activateFuncTab(cat) {
    funcTabs.forEach((t) => t.classList.toggle("active", t.dataset.cat === cat));
    document.querySelectorAll(".func-panel").forEach((p) => p.classList.toggle("active", p.dataset.cat === cat));
  }
  funcTabs.forEach((tab) => tab.addEventListener("click", () => activateFuncTab(tab.dataset.cat)));

  /* ---------------------------------------------------------------------
      Accordions Engine via Event Delegation
  --------------------------------------------------------------------- */
  document.querySelectorAll("[data-accordion]").forEach((acc) => {
    acc.addEventListener("click", (e) => {
      const trigger = e.target.closest(".acc-trigger");
      if (!trigger) return;
      const item = trigger.closest(".acc-item");
      if (item) item.classList.toggle("open");
    });
  });

  /* ---------------------------------------------------------------------
      Real-time Input Filter Matrices (Shortcuts & FAQs)
  --------------------------------------------------------------------- */
  const shortcutSearch = document.getElementById("shortcutSearch");
  if (shortcutSearch) {
    shortcutSearch.addEventListener("input", () => {
      const q = shortcutSearch.value.trim().toLowerCase();
      document.querySelectorAll(".shortcut-cat").forEach((cat) => {
        const match = cat.textContent.toLowerCase().includes(q);
        cat.classList.toggle("hide", q.length > 0 && !match);
      });
    });
  }

  const faqSearch = document.getElementById("faqSearch");
  if (faqSearch) {
    faqSearch.addEventListener("input", () => {
      const q = faqSearch.value.trim().toLowerCase();
      document.querySelectorAll("#faqAccordion .acc-item").forEach((item) => {
        const match = item.textContent.toLowerCase().includes(q);
        item.classList.toggle("hide", q.length > 0 && !match);
      });
    });
  }

  /* ---------------------------------------------------------------------
      Feedback Event Listeners
  --------------------------------------------------------------------- */
  document.querySelectorAll(".fb-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const thanks = document.getElementById("feedbackThanks");
      if (thanks) thanks.hidden = false;
    });
  });

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const thanks = document.getElementById("newsletterThanks");
      if (thanks) thanks.hidden = false;
      newsletterForm.reset();
    });
  }
})();


const menuToggleBtn = document.getElementById("menuToggleBtn");
const tocSidebar = document.getElementById("tocSidebar");

if (menuToggleBtn && tocSidebar) {
  menuToggleBtn.addEventListener("click", () => {
    tocSidebar.classList.toggle("open");
  });
}
