document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_FAVS = "projecthub_favs";
  const STORAGE_RECENT = "projecthub_recents";
  const STORAGE_SETTINGS = "projecthub_user_settings";

  // App State
  const state = {
    view: "all",
    selectedCategory: "All",
    searchQuery: "",
    favorites: JSON.parse(localStorage.getItem(STORAGE_FAVS)) || [],
    recents: JSON.parse(localStorage.getItem(STORAGE_RECENT)) || [],
    settings: JSON.parse(localStorage.getItem(STORAGE_SETTINGS)) || {
      sort: "asc",
      theme: "dark",
      layout: "grid"
    }
  };

  // Elements
  const el = {
    topHeader: document.querySelector(".top-header"),
    mobileNav: document.querySelector(".mobile-youtube-nav"),
    desktopNavs: document.querySelectorAll(".nav-item"),
    mobileNavs: document.querySelectorAll(".yt-nav-btn"),
    viewHeading: document.getElementById("viewHeading"),
    viewDesc: document.getElementById("viewDesc"),
    searchSection: document.getElementById("searchSection"),
    searchInput: document.getElementById("mainSearchInput"),
    searchResetBtn: document.getElementById("searchResetBtn"),
    categorySection: document.getElementById("categorySection"),
    categoryPills: document.querySelectorAll(".category-pill"),
    settingsSection: document.getElementById("settingsSection"),
    profileSection: document.getElementById("profileSection"),
    projectsGallery: document.getElementById("projectsGallery"),
    gridToggleBtn: document.getElementById("gridToggleBtn"),
    listToggleBtn: document.getElementById("listToggleBtn"),
    viewSwitchBox: document.querySelector(".view-switch-box"),
    quickSortSelect: document.getElementById("quickSortSelect"),
    noResultsState: document.getElementById("noResultsState"),
    emptyHeading: document.getElementById("emptyHeading"),
    emptySub: document.getElementById("emptySub"),
    settingToggles: document.querySelectorAll(".setting-toggle"),
    sidebar: document.getElementById("sidebar"),
    sidebarToggleBtn: document.getElementById("sidebarToggleBtn"),
    userCardBtn: document.getElementById("userCardBtn"),
    mobileMoreBtn: document.getElementById("mobileMoreBtn"),
    mobileMoreOverlay: document.getElementById("mobileMoreOverlay"),
    mobileMoreSheet: document.getElementById("mobileMoreSheet"),
    closeMoreSheetBtn: document.getElementById("closeMoreSheetBtn"),
    sheetMenuItems: document.querySelectorAll(".sheet-menu-item"),
    sheetThemeToggleBtn: document.getElementById("sheetThemeToggleBtn"),
    sheetThemeIcon: document.getElementById("sheetThemeIcon"),
    sheetThemeDesc: document.getElementById("sheetThemeDesc"),
    sheetThemeBadge: document.getElementById("sheetThemeBadge")
  };

  // Init
  function init() {
    applyTheme(state.settings.theme);
    applyLayout(state.settings.layout);
    initSidebarState();
    el.quickSortSelect.value = state.settings.sort;
    syncSettingsControls();
    registerEvents();
    initScrollListener();
    handleViewSwitch(state.view);
  }

  function initSidebarState() {
    const isCollapsed = localStorage.getItem("projecthub_sidebar_collapsed") === "true";
    if (isCollapsed && el.sidebar) {
      el.sidebar.classList.add("collapsed");
    }
  }

  function registerEvents() {
    el.desktopNavs.forEach(btn => {
      btn.addEventListener("click", () => handleViewSwitch(btn.dataset.view));
    });

    el.mobileNavs.forEach(btn => {
      if (btn.dataset.view) {
        btn.addEventListener("click", () => handleViewSwitch(btn.dataset.view));
      }
    });

    if (el.sidebarToggleBtn && el.sidebar) {
      el.sidebarToggleBtn.addEventListener("click", () => {
        el.sidebar.classList.toggle("collapsed");
        localStorage.setItem("projecthub_sidebar_collapsed", el.sidebar.classList.contains("collapsed"));
      });
    }

    if (el.userCardBtn) {
      el.userCardBtn.addEventListener("click", () => handleViewSwitch("profile"));
      el.userCardBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleViewSwitch("profile");
        }
      });
    }

    if (el.mobileMoreBtn) {
      el.mobileMoreBtn.addEventListener("click", openMoreSheet);
    }
    if (el.closeMoreSheetBtn) {
      el.closeMoreSheetBtn.addEventListener("click", closeMoreSheet);
    }
    if (el.mobileMoreOverlay) {
      el.mobileMoreOverlay.addEventListener("click", closeMoreSheet);
    }

    el.sheetMenuItems.forEach(item => {
      if (item.dataset.view) {
        item.addEventListener("click", () => {
          handleViewSwitch(item.dataset.view);
          closeMoreSheet();
        });
      }
    });

    if (el.sheetThemeToggleBtn) {
      el.sheetThemeToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const nextTheme = state.settings.theme === "dark" ? "light" : "dark";
        state.settings.theme = nextTheme;
        applyTheme(nextTheme);
        saveSettings();
        syncSettingsControls();
      });
    }

    el.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      el.searchResetBtn.classList.toggle("hidden", state.searchQuery === "");
      renderGallery();
    });

    el.searchResetBtn.addEventListener("click", () => {
      el.searchInput.value = "";
      state.searchQuery = "";
      el.searchResetBtn.classList.add("hidden");
      renderGallery();
    });

    el.categoryPills.forEach(pill => {
      pill.addEventListener("click", () => {
        el.categoryPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        state.selectedCategory = pill.dataset.category;
        renderGallery();
      });
    });

    el.quickSortSelect.addEventListener("change", (e) => {
      state.settings.sort = e.target.value;
      saveSettings();
      syncSettingsControls();
      renderGallery();
    });

    el.gridToggleBtn.addEventListener("click", () => {
      state.settings.layout = "grid";
      applyLayout("grid");
      saveSettings();
      syncSettingsControls();
    });

    el.listToggleBtn.addEventListener("click", () => {
      state.settings.layout = "list";
      applyLayout("list");
      saveSettings();
      syncSettingsControls();
    });

    el.settingToggles.forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.setting;
        const val = btn.dataset.value;
        state.settings[type] = val;

        if (type === "theme") applyTheme(val);
        if (type === "layout") applyLayout(val);
        if (type === "sort") el.quickSortSelect.value = val;

        saveSettings();
        syncSettingsControls();
        renderGallery();
      });
    });
  }

  function openMoreSheet() {
    if (el.mobileMoreOverlay && el.mobileMoreSheet) {
      el.mobileMoreOverlay.classList.remove("hidden");
      el.mobileMoreSheet.classList.remove("hidden");
    }
  }

  function closeMoreSheet() {
    if (el.mobileMoreOverlay && el.mobileMoreSheet) {
      el.mobileMoreOverlay.classList.add("hidden");
      el.mobileMoreSheet.classList.add("hidden");
    }
  }

  // Auto Hide / Show on Scroll
  function initScrollListener() {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const threshold = 8;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDiff = currentScrollY - lastScrollY;

      if (currentScrollY <= 10) {
        el.topHeader.classList.remove("nav-hidden");
        el.mobileNav.classList.remove("nav-hidden");
      } 
      else if (scrollDiff > threshold) {
        el.topHeader.classList.add("nav-hidden");
        el.mobileNav.classList.add("nav-hidden");
      } 
      else if (scrollDiff < -threshold) {
        el.topHeader.classList.remove("nav-hidden");
        el.mobileNav.classList.remove("nav-hidden");
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Dynamic View / Current Page Switcher
  function handleViewSwitch(targetView) {
    state.view = targetView;

    el.desktopNavs.forEach(b => b.classList.toggle("active", b.dataset.view === targetView));
    el.mobileNavs.forEach(b => {
      if (b.dataset.view) {
        b.classList.toggle("active", b.dataset.view === targetView);
      }
    });

    // If active view is in More menu (recent, categories, settings), highlight More button
    if (el.mobileMoreBtn) {
      const isMoreView = ["recent", "categories", "settings"].includes(targetView);
      el.mobileMoreBtn.classList.toggle("active", isMoreView);
    }

    // Active item in More sheet
    el.sheetMenuItems.forEach(item => {
      item.classList.toggle("active", item.dataset.view === targetView);
    });

    // Dynamic current section page titles
    const titles = {
      all: { h: "All Projects", d: "Browse and launch all your web projects from one place." },
      favorites: { h: "Favorites", d: "Quickly access your starred high-priority projects." },
      recent: { h: "Recent", d: "Projects you have launched recently." },
      search: { h: "Search", d: "Instantly query projects across names, tags, and categories." },
      categories: { h: "Categories", d: "Filter projects based on workspace stack and type." },
      settings: { h: "Settings", d: "Customize sorting, theme mode, and density." },
      profile: { h: "Profile", d: "About me, my skills, experience and development journey." }
    };

    const currentMeta = titles[targetView] || { h: "All Projects", d: "" };
    el.viewHeading.textContent = currentMeta.h;
    if (el.viewDesc) el.viewDesc.textContent = currentMeta.d;

    // Toggle panels
    const isProjectGalleryView = !["settings", "profile"].includes(targetView);

    el.searchSection.classList.toggle("hidden", targetView !== "search");
    el.categorySection.classList.toggle("hidden", targetView !== "categories");
    el.settingsSection.classList.toggle("hidden", targetView !== "settings");
    if (el.profileSection) el.profileSection.classList.toggle("hidden", targetView !== "profile");
    el.projectsGallery.classList.toggle("hidden", !isProjectGalleryView);

    // Hide sort dropdown and layout switcher on settings and profile for a clean header
    if (el.quickSortSelect) {
      el.quickSortSelect.style.display = isProjectGalleryView ? "" : "none";
    }
    if (el.viewSwitchBox) {
      el.viewSwitchBox.style.display = isProjectGalleryView ? "" : "none";
    }

    if (targetView === "search") el.searchInput.focus();

    window.scrollTo({ top: 0, behavior: "smooth" });

    renderGallery();
  }

  function renderGallery() {
    if (state.view === "settings" || state.view === "profile") {
      el.projectsGallery.innerHTML = "";
      el.noResultsState.classList.add("hidden");
      return;
    }

    let dataset = [...projectsData];

    if (state.view === "favorites") {
      dataset = dataset.filter(p => state.favorites.includes(p.id));
    } else if (state.view === "recent") {
      dataset = state.recents.map(r => {
        const match = projectsData.find(p => p.id === r.id);
        return match ? { ...match, lastOpened: r.time } : null;
      }).filter(Boolean);
    } else if (state.view === "categories") {
      if (state.selectedCategory !== "All") {
        dataset = dataset.filter(p => p.category === state.selectedCategory);
      }
    } else if (state.view === "search" && state.searchQuery) {
      dataset = dataset.filter(p => {
        const nMatch = p.name.toLowerCase().includes(state.searchQuery);
        const cMatch = p.category.toLowerCase().includes(state.searchQuery);
        const tMatch = p.technologies.some(t => t.toLowerCase().includes(state.searchQuery));
        return nMatch || cMatch || tMatch;
      });
    }

    if (state.view !== "recent") {
      dataset.sort((a, b) => {
        const order = a.name.localeCompare(b.name);
        return state.settings.sort === "asc" ? order : -order;
      });
    }

    if (dataset.length === 0) {
      el.projectsGallery.innerHTML = "";
      el.noResultsState.classList.remove("hidden");

      if (state.view === "favorites") {
        el.emptyHeading.textContent = "No Favorites Added";
        el.emptySub.textContent = "Click the star on any project to favorite it.";
      } else if (state.view === "recent") {
        el.emptyHeading.textContent = "No Recent Activity";
        el.emptySub.textContent = "Projects you open will be tracked here.";
      } else {
        el.emptyHeading.textContent = "No Matching Projects";
        el.emptySub.textContent = "Try searching for a different keyword or category.";
      }
      return;
    }

    el.noResultsState.classList.add("hidden");

    el.projectsGallery.innerHTML = dataset.map(p => {
      const isFav = state.favorites.includes(p.id);
      return `
        <article class="card-item">
          <div class="card-media-box">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <button class="fav-action-btn ${isFav ? 'is-active' : ''}" data-id="${p.id}" title="Toggle Favorite">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
          <div class="card-content">
            <div class="card-top-row">
              <h3 class="card-name">${p.name}</h3>
              <span class="badge-category">${p.category}</span>
            </div>
            <p class="card-summary">${p.description}</p>
            ${p.lastOpened ? `<span class="access-time-stamp">Opened: ${formatStamp(p.lastOpened)}</span>` : ''}
            <div class="card-tags">
              ${p.technologies.map(t => `<span class="tag-badge">${t}</span>`).join('')}
            </div>
            <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="open-launch-btn" data-id="${p.id}">
              Open Project ↗
            </a>
          </div>
        </article>
      `;
    }).join('');

    bindCardActions();
  }

  function bindCardActions() {
    document.querySelectorAll(".fav-action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFav(parseInt(btn.dataset.id, 10));
      });
    });

    document.querySelectorAll(".open-launch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        saveRecent(parseInt(btn.dataset.id, 10));
      });
    });
  }

  function toggleFav(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) state.favorites.splice(idx, 1);
    else state.favorites.push(id);
    localStorage.setItem(STORAGE_FAVS, JSON.stringify(state.favorites));
    renderGallery();
  }

  function saveRecent(id) {
    state.recents = state.recents.filter(r => r.id !== id);
    state.recents.unshift({ id, time: new Date().toISOString() });
    if (state.recents.length > 20) state.recents.pop();
    localStorage.setItem(STORAGE_RECENT, JSON.stringify(state.recents));
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    syncThemeInMoreSheet(theme);
  }

  function syncThemeInMoreSheet(theme) {
    if (el.sheetThemeBadge && el.sheetThemeDesc && el.sheetThemeIcon) {
      const isDark = theme === "dark";
      el.sheetThemeIcon.textContent = isDark ? "🌙" : "☀️";
      el.sheetThemeDesc.textContent = isDark ? "Current: Dark Theme (tap to switch)" : "Current: Light Theme (tap to switch)";
      el.sheetThemeBadge.textContent = isDark ? "Dark" : "Light";
    }
  }

  function applyLayout(layout) {
    el.projectsGallery.className = `gallery-grid layout-${layout}`;
    el.gridToggleBtn.classList.toggle("active", layout === "grid");
    el.listToggleBtn.classList.toggle("active", layout === "list");
  }

  function syncSettingsControls() {
    el.settingToggles.forEach(btn => {
      const type = btn.dataset.setting;
      const val = btn.dataset.value;
      btn.classList.toggle("active", state.settings[type] === val);
    });
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(state.settings));
  }

  function formatStamp(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  init();
});
