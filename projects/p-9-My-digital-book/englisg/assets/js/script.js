/* ==========================================================================
   B.A. 5TH SEMESTER - DIGITAL TEXTBOOK CENTRAL JAVASCRIPT ENGINE
   CENTRAL JAVASCRIPT CONTROLLER & INTERACTIVE FEATURES
   Features: Theme, Typography Scale, Live Topic Progress, Real Focus Mode,
   Official Syllabus Lightbox, Global Search, Subject Quiz Auto-Launch
   ========================================================================== */

// Check for first-time visitor immediately
checkFirstTimeVisitor();

document.addEventListener('DOMContentLoaded', () => {
    initLayoutContainers();
    // Clear any legacy focus mode states
    document.body.classList.remove('reading-mode');
    try {
        localStorage.removeItem('ba5_focus_mode');
    } catch (e) {}
    document.querySelectorAll('.focus-exit-bar, #focus-exit-bar').forEach(el => el.remove());

    initTheme();
    initFontSize();
    initReadingProgress();
    initContinueReading();
    initScrollSpy();
    initMobileNavMenu();
    initSidebarController();
    initContentOnlyController();
    initBackToTop();
    initGlobalSearch();
    initSyllabusModal();
    initUrlParamsHandler();
    initSmoothScrollAnchors();
    initAutoHidingHeader();
    restoreReadingPosition();
    initAudioReader();
});

/* --------------------------------------------------------------------------
   0. BOOK LAYOUT CONTAINERS & SCROLL ARCHITECTURE INITIALIZER
   -------------------------------------------------------------------------- */
function initLayoutContainers() {
    const mainWrapper = document.querySelector('.main-wrapper:not(.single-column)');
    if (mainWrapper) {
        document.body.classList.add('book-page-layout');
        const contentArea = document.querySelector('.content-area, .book-page, .book-main-column');
        const footer = document.querySelector('.site-footer, .book-footer');
        if (contentArea && footer && !contentArea.contains(footer)) {
            contentArea.appendChild(footer);
        }

        // Auto-wrap TOC units into .toc-scroll-area if not already wrapped
        const sidebars = document.querySelectorAll('.sidebar-toc, .book-sidebar');
        sidebars.forEach(sidebar => {
            if (!sidebar.querySelector('.toc-scroll-area') && !sidebar.querySelector('nav.sidebar-toc')) {
                const header = sidebar.querySelector('.toc-header, .sidebar-header');
                const meta = sidebar.querySelector('.sidebar-meta');
                const scrollArea = document.createElement('div');
                scrollArea.className = 'toc-scroll-area';
                const items = Array.from(sidebar.children).filter(el => el !== header && el !== meta);
                items.forEach(item => scrollArea.appendChild(item));
                sidebar.appendChild(scrollArea);
            }
        });
    }

    if (document.getElementById('global-audio-bar')) {
        document.body.classList.add('has-global-audio-bar');
    }
}

/* --------------------------------------------------------------------------
   1. THEME MANAGER (DARK / LIGHT ACADEMIC THEMES)
   -------------------------------------------------------------------------- */
function initTheme() {
    const savedTheme = localStorage.getItem('ba5_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeUI('dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        updateThemeUI('light');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('ba5_theme', 'light');
        updateThemeUI('light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('ba5_theme', 'dark');
        updateThemeUI('dark');
    }
}

function updateThemeUI(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon';
    }
    if (themeText) {
        themeText.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
}

/* --------------------------------------------------------------------------
   2. FONT SIZE RESIZER (A- / A / A+)
   -------------------------------------------------------------------------- */
let currentFontSizeScale = parseInt(localStorage.getItem('ba5_font_scale')) || 16;

function initFontSize() {
    applyFontSize(currentFontSizeScale);
}

function adjustFontSize(delta) {
    currentFontSizeScale = Math.max(14, Math.min(22, currentFontSizeScale + delta));
    localStorage.setItem('ba5_font_scale', currentFontSizeScale);
    applyFontSize(currentFontSizeScale);
}

function resetFontSize() {
    currentFontSizeScale = 16;
    localStorage.setItem('ba5_font_scale', 16);
    applyFontSize(16);
}

function applyFontSize(size) {
    document.documentElement.style.fontSize = size + 'px';
}

/* --------------------------------------------------------------------------
   3. READING PROGRESS BAR & REAL-TIME PERCENTAGE
   -------------------------------------------------------------------------- */
function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress-bar');
    const progressPill = document.getElementById('reading-progress-pill');
    const contentArea = document.querySelector('.content-area, .book-page, .book-main-column');

    const updateProgress = () => {
        let winScroll = 0;
        let height = 0;

        if (window.innerWidth > 991 && contentArea && contentArea.scrollHeight > contentArea.clientHeight) {
            winScroll = contentArea.scrollTop;
            height = contentArea.scrollHeight - contentArea.clientHeight;
        } else {
            winScroll = document.documentElement.scrollTop || document.body.scrollTop;
            height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        }

        if (height > 0) {
            const scrolled = Math.min(100, Math.round((winScroll / height) * 100));
            if (progressBar) progressBar.style.width = scrolled + '%';
            if (progressPill) {
                const label = document.documentElement.lang === 'hi' ? 'प्रगति' : 'Progress';
                progressPill.innerHTML = `<i class="fa-solid fa-book-open text-accent"></i> ${label}: ${scrolled}%`;
            }
        }
    };

    window.addEventListener('scroll', throttle(updateProgress, 100));
    if (contentArea) {
        contentArea.addEventListener('scroll', throttle(updateProgress, 100));
    }
}

/* --------------------------------------------------------------------------
   4. CONTINUE READING TRACKER
   -------------------------------------------------------------------------- */
function initContinueReading() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const pageTitle = document.title.split('|')[0].trim();
    
    if (currentPath !== 'index.html' && currentPath !== '') {
        window.addEventListener('scroll', throttle(() => {
            const scrollPos = window.scrollY;
            const state = {
                path: currentPath,
                title: pageTitle,
                scroll: scrollPos,
                timestamp: Date.now()
            };
            localStorage.setItem('ba5_last_reading', JSON.stringify(state));
        }, 1000));
    }

    const resumeContainer = document.getElementById('resume-reading-container');
    if (resumeContainer) {
        const lastReading = JSON.parse(localStorage.getItem('ba5_last_reading'));
        if (lastReading && lastReading.path && lastReading.path !== currentPath) {
            resumeContainer.innerHTML = `
                <div class="resume-reading-banner">
                    <div>
                        <i class="fa-solid fa-bookmark" style="color:var(--accent-color); margin-right:8px;"></i>
                        <span>Resume reading: <strong>${lastReading.title}</strong></span>
                    </div>
                    <a href="./${lastReading.path}" class="nav-btn" style="background:var(--accent-color); border:none; color:#fff;">
                        Resume <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }
    }
}

/* --------------------------------------------------------------------------
   5. TABLE OF CONTENTS SCROLL SPY & LIVE TOPIC TRACKER
   -------------------------------------------------------------------------- */
function initScrollSpy() {
    const sections = document.querySelectorAll('article[id], section[id], div[id^="u"], div[id^="course-"], div[id^="sec-"], div[id$="-summary"], .unit-divider[id]');
    const navLinks = document.querySelectorAll('.toc-link');
    const breadcrumbTopic = document.getElementById('breadcrumb-active-topic');
    if (!sections.length || !navLinks.length) return;

    const contentArea = document.querySelector('.content-area, .book-page, .book-main-column');

    const observerOptions = {
        root: (window.innerWidth > 991 && contentArea) ? contentArea : null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                        
                        // Update breadcrumb topic text if available
                        if (breadcrumbTopic) {
                            const topicText = link.textContent.trim();
                            breadcrumbTopic.textContent = topicText;
                            breadcrumbTopic.style.display = 'inline-block';
                        }

                        // Scroll sidebar container so active link is always visible
                        const tocParent = link.closest('.toc-scroll-area, nav.sidebar-toc, .sidebar-toc, .book-sidebar');
                        if (tocParent) {
                            const linkTop = link.offsetTop;
                            tocParent.scrollTop = Math.max(0, linkTop - 70);
                        }
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

function initMobileNavMenu() {
    const hamburger = document.getElementById('nav-menu-toggle') || document.querySelector('.nav-hamburger');
    const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // If mobile sidebar drawer is open, close it to prevent overlap
            if (document.body.classList.contains('mobile-sidebar-open')) {
                const backdrop = document.getElementById('sidebar-backdrop') || document.querySelector('.sidebar-backdrop');
                const sidebar = document.getElementById('sidebar-toc') || document.getElementById('book-sidebar') || document.querySelector('.sidebar-toc, .book-sidebar');
                document.body.classList.remove('mobile-sidebar-open');
                if (sidebar) sidebar.classList.remove('open');
                if (backdrop) backdrop.classList.remove('active');
            }

            navMenu.classList.toggle('mobile-open');
            const isOpen = navMenu.classList.contains('mobile-open');
            hamburger.setAttribute('aria-expanded', isOpen);
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                if (navMenu.classList.contains('mobile-open')) {
                    navMenu.classList.remove('mobile-open');
                    hamburger.setAttribute('aria-expanded', 'false');
                    const icon = hamburger.querySelector('i');
                    if (icon) icon.className = 'fa-solid fa-bars';
                }
            }
        });

        // Close on nav-link click on mobile
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    navMenu.classList.remove('mobile-open');
                    hamburger.setAttribute('aria-expanded', 'false');
                    const icon = hamburger.querySelector('i');
                    if (icon) icon.className = 'fa-solid fa-bars';
                }
            });
        });
    }
}

/* --------------------------------------------------------------------------
   5B. UNIFIED SIDEBAR CONTROLLER (DESKTOP TOGGLE & MOBILE DRAWER)
   -------------------------------------------------------------------------- */
function initSidebarController() {
    const sidebar = document.getElementById('sidebar-toc') || 
                    document.getElementById('book-sidebar') || 
                    document.querySelector('.sidebar-toc, .book-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop') || 
                     document.querySelector('.sidebar-backdrop');
    const toggleBtns = document.querySelectorAll('#sidebar-toggle-btn, .sidebar-toggle-btn, #mobile-toc-toggle, .mobile-toc-toggle');
    const closeBtns = document.querySelectorAll('#sidebar-close, .mobile-nav-toggle, .sidebar-close-btn');
    
    if (!sidebar) return;

    const isDesktop = () => window.innerWidth > 991;

    function updateToggleAria(isOpen) {
        toggleBtns.forEach(btn => {
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            btn.setAttribute('aria-label', isOpen ? 'Hide Table of Contents' : 'Show Table of Contents');
            btn.setAttribute('title', isOpen ? 'Hide Table of Contents (Ctrl+B)' : 'Show Table of Contents (Ctrl+B)');
        });
    }

    // Restore desktop preference if saved
    try {
        const savedDesktopState = localStorage.getItem('ba5_sidebar_desktop');
        if (savedDesktopState === 'collapsed' && isDesktop()) {
            document.body.classList.add('sidebar-collapsed');
            updateToggleAria(false);
        } else {
            updateToggleAria(true);
        }
    } catch (e) {}

    function openMobileSidebar() {
        // If top nav mobile menu is open, close it first
        const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
        const hamburger = document.getElementById('nav-menu-toggle') || document.querySelector('.nav-hamburger');
        if (navMenu && navMenu.classList.contains('mobile-open')) {
            navMenu.classList.remove('mobile-open');
            if (hamburger) {
                hamburger.setAttribute('aria-expanded', 'false');
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        }

        document.body.classList.add('mobile-sidebar-open');
        sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
        updateToggleAria(true);
    }

    function closeMobileSidebar() {
        document.body.classList.remove('mobile-sidebar-open');
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        updateToggleAria(false);
    }

    function toggleSidebar() {
        if (isDesktop()) {
            const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
            try {
                localStorage.setItem('ba5_sidebar_desktop', isCollapsed ? 'collapsed' : 'open');
            } catch (e) {}
            updateToggleAria(!isCollapsed);
        } else {
            if (sidebar.classList.contains('open') || document.body.classList.contains('mobile-sidebar-open')) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        }
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMobileSidebar();
        });
    });

    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMobileSidebar();
        });
    }

    // Close on outside click on mobile
    document.addEventListener('click', (e) => {
        if (!isDesktop() && document.body.classList.contains('mobile-sidebar-open')) {
            if (!sidebar.contains(e.target) && !Array.from(toggleBtns).some(b => b.contains(e.target))) {
                closeMobileSidebar();
            }
        }
    });

    // Close mobile drawer when clicking any TOC link on mobile
    const tocLinks = document.querySelectorAll('.toc-link, .sidebar-toc a, .book-sidebar a');
    tocLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!isDesktop()) {
                closeMobileSidebar();
            }
        });
    });

    // Handle screen resize smoothly
    window.addEventListener('resize', throttle(() => {
        if (isDesktop()) {
            if (document.body.classList.contains('mobile-sidebar-open')) {
                closeMobileSidebar();
            }
            const isCollapsed = document.body.classList.contains('sidebar-collapsed');
            updateToggleAria(!isCollapsed);
        }
    }, 150));

    // Keyboard shortcut: Ctrl + B or Cmd + B to toggle sidebar, ESC to close mobile drawer
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            toggleSidebar();
        } else if (e.key === 'Escape') {
            if (document.body.classList.contains('mobile-sidebar-open')) {
                closeMobileSidebar();
            }
        }
    });
}

/* --------------------------------------------------------------------------
   6. CONTENT-ONLY / READING MODE CONTROLLER
   -------------------------------------------------------------------------- */
function initContentOnlyController() {
    const toggleBtns = document.querySelectorAll('#content-only-btn, #content-only-exit-btn, .content-only-toggle');
    const exitBtn = document.getElementById('content-only-exit-btn');
    const mainBtn = document.getElementById('content-only-btn');

    if (!toggleBtns.length) return;

    function updateLabels(isContentOnly) {
        if (mainBtn) {
            mainBtn.setAttribute('aria-label', isContentOnly ? 'Return to Normal View' : 'Content Only');
            mainBtn.setAttribute('title', isContentOnly ? 'Return to Normal View' : 'Content Only (Reading Mode)');
        }
        if (exitBtn) {
            exitBtn.setAttribute('aria-label', 'Return to Normal View');
            exitBtn.setAttribute('title', 'Return to Normal View');
        }
    }

    function toggleMode(forceState) {
        const isContentOnly = typeof forceState === 'boolean' 
            ? forceState 
            : !document.body.classList.contains('content-only-mode');

        document.body.classList.toggle('content-only-mode', isContentOnly);
        updateLabels(isContentOnly);

        // Close any active mobile drawer when entering content-only mode
        if (isContentOnly) {
            document.body.classList.remove('mobile-sidebar-open');
            const sidebar = document.getElementById('sidebar-toc');
            const backdrop = document.getElementById('sidebar-backdrop');
            if (sidebar) sidebar.classList.remove('open');
            if (backdrop) backdrop.classList.remove('active');
        }
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMode();
        });
    });

    // ESC key exits Content-Only Mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('content-only-mode')) {
            toggleMode(false);
        }
    });
}

/* --------------------------------------------------------------------------
   7. BACK TO TOP FLOATING BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 350) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, 150));

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --------------------------------------------------------------------------
   8. OFFICIAL SYLLABUS LIGHTBOX / MODAL ENGINE
   -------------------------------------------------------------------------- */
let currentSyllabusSubject = 'eco-elective-1';
let currentZoomLevel = 1;

const subjectTitles = {
    'eco-elective-1': 'Economics Elective 1 — Development & Policy',
    'eco-skill': 'Field Based Course — Industry & Entrepreneurship',
    'geo-theory': 'Geography — Economic Geography',
    'geo-practical': 'Geography Practical: Field Survey Methods, Field Trip & Report Writing',
    'hindi-bhasha-1': 'Hindi (Language Based Course-1)',
    'vac-ctmv': 'Value Added Course — CTMV'
};

function initSyllabusModal() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSyllabusModal();
            closeSearchModal();
        }
    });

    const overlay = document.getElementById('syllabus-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeSyllabusModal();
            }
        });
    }

    const searchOverlay = document.getElementById('search-modal-overlay');
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearchModal();
            }
        });
    }
}

function openSyllabusModal(subjectKey, titleOverride) {
    if (subjectKey && subjectTitles[subjectKey]) {
        currentSyllabusSubject = subjectKey;
    }

    currentZoomLevel = 1;

    const overlay = document.getElementById('syllabus-modal-overlay') || document.getElementById('syllabus-modal');
    const selectEl = document.getElementById('syllabus-subject-select') || document.getElementById('syllabus-select');
    if (!overlay) return;

    if (selectEl) {
        selectEl.value = currentSyllabusSubject;
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderSyllabusPage();
}

function switchSyllabusSubject(newSubjectKey) {
    if (subjectTitles[newSubjectKey]) {
        currentSyllabusSubject = newSubjectKey;
        currentZoomLevel = 1;
        renderSyllabusPage();
    }
}

function switchSyllabusImage(newSubjectKey) {
    switchSyllabusSubject(newSubjectKey);
}

function handleSyllabusError(imgEl) {
    if (imgEl && imgEl.parentElement) {
        imgEl.style.display = 'none';
    }
}

function closeSyllabusModal() {
    const overlay = document.getElementById('syllabus-modal-overlay') || document.getElementById('syllabus-modal');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function renderSyllabusPage() {
    const imgWrapper = document.getElementById('syllabus-image-wrapper');
    if (!imgWrapper) return;

    imgWrapper.style.transform = `scale(${currentZoomLevel})`;

    let candidates = [
        `assets/images/syllabus/${currentSyllabusSubject}.png`,
        `assets/images/syllabus/${currentSyllabusSubject}.jpg`,
        `assets/images/syllabus/${currentSyllabusSubject}.jpeg`
    ];

    if (currentSyllabusSubject === 'geo-practical') {
        candidates.unshift(`assets/images/syllabus/geo-practicle.png`);
        candidates.unshift(`assets/images/syllabus/geo-practicle.jpg`);
    }

    let loaded = false;
    let tryCandidate = (index) => {
        if (index >= candidates.length) {
            if (!loaded) {
                imgWrapper.innerHTML = `
                    <div style="text-align:center; color:#94a3b8; padding:3rem;">
                        <i class="fa-solid fa-file-invoice" style="font-size:3rem; margin-bottom:1rem;"></i>
                        <h3 style="color:#ffffff;">Official Syllabus Document</h3>
                        <p>Syllabus file: <code>assets/images/syllabus/${currentSyllabusSubject}.png</code></p>
                    </div>
                `;
            }
            return;
        }

        const candidatePath = candidates[index];
        const img = new Image();
        img.src = candidatePath;
        img.className = 'syllabus-img';
        img.alt = `${subjectTitles[currentSyllabusSubject] || currentSyllabusSubject} Official Syllabus`;

        img.onload = () => {
            loaded = true;
            imgWrapper.innerHTML = '';
            imgWrapper.appendChild(img);
        };

        img.onerror = () => {
            tryCandidate(index + 1);
        };
    };

    tryCandidate(0);
}

function zoomSyllabus(delta) {
    currentZoomLevel = Math.max(0.5, Math.min(3.5, currentZoomLevel + delta));
    const imgWrapper = document.getElementById('syllabus-image-wrapper');
    if (imgWrapper) {
        imgWrapper.style.transform = `scale(${currentZoomLevel})`;
    }
}

function resetSyllabusZoom() {
    currentZoomLevel = 1;
    const imgWrapper = document.getElementById('syllabus-image-wrapper');
    if (imgWrapper) {
        imgWrapper.style.transform = `scale(1)`;
    }
}

/* --------------------------------------------------------------------------
   9. GLOBAL SEARCH SYSTEM
   -------------------------------------------------------------------------- */
const searchDatabase = [
    // Economics Elective 1 (Economic Development and Policy in India - I, 30 Chapters)
    { title: "Economic Growth vs Economic Development", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch1", tags: "growth development gdp real income kuznets amartya sen" },
    { title: "Measurement of Economic Development & HDI", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch2", tags: "hdi mpi life expectancy education gni per capita ppp" },
    { title: "Goals and Strategy of Indian Planning", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch6", tags: "indian planning mahalanobis five year plan mixed economy niti aayog" },
    { title: "Sustainable Development Goals & India", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch7", tags: "sdgs 17 goals brundtland sustainable development niti aayog sdg index" },
    { title: "Capital Formation: Physical vs Human", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch10", tags: "capital formation physical human capital savings investment" },
    { title: "Technology, Institutions & Douglass North", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch12", tags: "technology institutions douglass north property rights governance" },
    { title: "Foreign Capital, FDI vs FII", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch15", tags: "fdi fii foreign direct investment hot money fema foreign capital" },
    { title: "Decadal Growth & 1921 Year of Great Divide", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch17", tags: "decadal growth 1921 great divide census population" },
    { title: "Age Composition & Demographic Dividend", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch18", tags: "age composition dependency ratio demographic dividend working age" },
    { title: "Rural-Urban Migration: Push & Pull Factors", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch22", tags: "migration push pull factors remittances reverse migration" },
    { title: "Organised vs Unorganised Sector", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch26", tags: "occupational structure organised unorganised informal sector" },
    { title: "Unemployment: Open, Under & Disguised", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch28", tags: "unemployment open underemployment disguised marginal productivity mpl zero" },
    { title: "MGNREGA & Rural Employment Schemes", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch29", tags: "mgnrega 100 days guarantee women safety net pmmy pmegp" },
    { title: "Macroeconomic Indicators & Critical Analysis", subject: "Economics Elective 1", page: "eco-elective-1-policy.html#ch30", tags: "macroeconomic indicators gdp inflation fiscal deficit cad jobless growth" },

    // Field Based Course (25 Chapters)
    { title: "Field Visit Academic Purpose & Scope", subject: "Field Based Course", page: "eco-skill-course.html#ch1", tags: "field visit purpose real world classroom theory primary data" },
    { title: "Economic vs Entrepreneurial Activities & Value Addition", subject: "Field Based Course", page: "eco-skill-course.html#ch2", tags: "economic entrepreneurial activity value addition innovation risk" },
    { title: "Main Economic Agents & Interaction Flowchart", subject: "Field Based Course", page: "eco-skill-course.html#ch3", tags: "producer entrepreneur worker manager consumer economic agents" },
    { title: "Small, Medium & Large Scale Industries Comparison", subject: "Field Based Course", page: "eco-skill-course.html#ch4", tags: "small medium large scale industries msme comparison table" },
    { title: "Interacting with Entrepreneurs, Workers & Managers", subject: "Field Based Course", page: "eco-skill-course.html#ch5", tags: "entrepreneur worker manager interview questionnaire dialogue" },
    { title: "Working Environment Assessment & Safety", subject: "Field Based Course", page: "eco-skill-course.html#ch6", tags: "working environment ventilation lighting noise ppe safety" },
    { title: "Problems Faced by Producers & Fact vs Assumption Rule", subject: "Field Based Course", page: "eco-skill-course.html#ch7", tags: "problems faced producers raw material power working capital evidence" },
    { title: "Enterprise Background & Locational Factors", subject: "Field Based Course", page: "eco-skill-course.html#ch8", tags: "enterprise background udyam registration locational advantage" },
    { title: "Operations & 5-Stage Production Flow", subject: "Field Based Course", page: "eco-skill-course.html#ch9", tags: "operations production flow quality control packaging transformation" },
    { title: "Marketing 4Ps & Distribution Channels", subject: "Field Based Course", page: "eco-skill-course.html#ch10", tags: "marketing 4ps product price place promotion distribution channel" },
    { title: "Inventory Management & FIFO Principle", subject: "Field Based Course", page: "eco-skill-course.html#ch11", tags: "inventory management raw material wip finished goods fifo overstocking" },
    { title: "Financial Aspects & Working Capital Cycle", subject: "Field Based Course", page: "eco-skill-course.html#ch12", tags: "fixed working capital operating cycle cash flow trade credit mudra" },
    { title: "Human Resources & Workforce Composition", subject: "Field Based Course", page: "eco-skill-course.html#ch13", tags: "human resources skilled unskilled on the job training labour turnover" },
    { title: "Operational Problem Matrix & Coping Strategies", subject: "Field Based Course", page: "eco-skill-course.html#ch14", tags: "operational problems root cause coping strategy solution matrix" },
    { title: "Three Stages of Fieldwork: Before, During & After", subject: "Field Based Course", page: "eco-skill-course.html#ch15", tags: "fieldwork methodology before during after visit stages" },
    { title: "Field Observation Checklist (8-Dimension Framework)", subject: "Field Based Course", page: "eco-skill-course.html#ch16", tags: "field observation checklist audit 8 dimensions" },
    { title: "Field Diary Writing & Authentic Sample Entry", subject: "Field Based Course", page: "eco-skill-course.html#ch17", tags: "field diary notebook sample entry primary evidence" },
    { title: "Ethics, Safety Protocols & No-Fabrication Rule", subject: "Field Based Course", page: "eco-skill-course.html#ch18", tags: "research ethics informed consent ppe safety no fabrication rule" },
    { title: "30-Point Standard Field Report Structure", subject: "Field Based Course", page: "eco-skill-course.html#ch19", tags: "30 point report structure master outline format layout" },
    { title: "Things Observed vs Things Learned & Reflection", subject: "Field Based Course", page: "eco-skill-course.html#ch20", tags: "things observed things learned student experience reflection" },
    { title: "Sample Illustrative Field Report (Model Case Study)", subject: "Field Based Course", page: "eco-skill-course.html#ch21", tags: "sample illustrative report balaji agro flour mill model report" },
    { title: "15 Practical Field Exercises & Assignments", subject: "Field Based Course", page: "eco-skill-course.html#ch22", tags: "practical field exercises assignments 15 tasks practical" },
    { title: "40 High-Yield Viva Voce Q&A Bank", subject: "Field Based Course", page: "eco-skill-course.html#ch23", tags: "viva voce questions answers 40 oral exam revision" },

    // Geography Theory (Economic Geography - 24 Chapters)
    { title: "Economic Geography: Scope, Approaches & Concepts", subject: "Economic Geography", page: "geo-theory.html#ch1", tags: "economic geography chisholm zimmermann production distribution exchange consumption" },
    { title: "Approaches of Economic Geography", subject: "Economic Geography", page: "geo-theory.html#ch2", tags: "regional systematic spatial ecological historical approach" },
    { title: "16 Fundamental Concepts in Economic Geography", subject: "Economic Geography", page: "geo-theory.html#ch3", tags: "location situation distance accessibility spatial interaction region resource" },
    { title: "Patterns of Development, HDI & North-South Divide", subject: "Economic Geography", page: "geo-theory.html#ch4", tags: "economic growth development hdi brandt line north south divide" },
    { title: "Von Thunen Agricultural Location Theory", subject: "Economic Geography", page: "geo-theory.html#ch6", tags: "von thunen agricultural location isolated state concentric rings locational rent" },
    { title: "Alfred Weber Industrial Location Theory", subject: "Economic Geography", page: "geo-theory.html#ch7", tags: "weber industrial location material index mi isodapane agglomeration" },
    { title: "Intensive Subsistence & Commercial Grain Farming", subject: "Economic Geography", page: "geo-theory.html#ch8", tags: "intensive subsistence commercial grain prairies steppes wheat rice" },
    { title: "Plantation Agriculture & Commercial Dairy", subject: "Economic Geography", page: "geo-theory.html#ch10", tags: "plantation tea coffee fazendas commercial dairy farming" },
    { title: "Commercial Fishing & Continental Shelves", subject: "Economic Geography", page: "geo-theory.html#ch12", tags: "commercial fishing grand bank dogger bank plankton overfishing" },
    { title: "Iron Ore, Coal & Petroleum Resources", subject: "Economic Geography", page: "geo-theory.html#ch14", tags: "iron ore hematite coal gondwana bituminous petroleum digboi mumbai high" },
    { title: "Cotton Textile & Petro-Chemical Industry", subject: "Economic Geography", page: "geo-theory.html#ch17", tags: "cotton textile pure raw material petrochemical naphtha jamnagar" },
    { title: "Major World Manufacturing Regions", subject: "Economic Geography", page: "geo-theory.html#ch19", tags: "manufacturing regions rhine ruhr north america tokaido corridor" },
    { title: "Tertiary & Quaternary Activities", subject: "Economic Geography", page: "geo-theory.html#ch20", tags: "tertiary quaternary service sector knowledge economy gold collar" },
    { title: "Modes of Transportation (Road, Rail, Water, Air, Pipeline)", subject: "Economic Geography", page: "geo-theory.html#ch22", tags: "transport road rail water suez canal panama air pipeline" },
    { title: "International Trade Patterns & Trading Blocs", subject: "Economic Geography", page: "geo-theory.html#ch23", tags: "international trade balance of trade surplus deficit eu asean brics" },
    { title: "Information & Communication Technology (ICT) Industry", subject: "Economic Geography", page: "geo-theory.html#ch24", tags: "ict information technology silicon valley bengaluru software digital divide" },

    // Geography Practical (Field Survey Methods, Field Trip & Report Writing - 25 Chapters)
    { title: "Role and Value of Field Work in Geography", subject: "Geography Practical", page: "geo-practical.html#ch1", tags: "field work ground truthing primary data carl sauer david harvey" },
    { title: "Ethics in Field Work", subject: "Geography Practical", page: "geo-practical.html#ch3", tags: "ethics consent privacy cultural sensitivity rapport building" },
    { title: "Defining the 'Field' & 5 Case Studies", subject: "Geography Practical", page: "geo-practical.html#ch4", tags: "defining field case study rural urban physical human environmental" },
    { title: "Sampling Design: Random, Stratified & Systematic", subject: "Geography Practical", page: "geo-practical.html#ch6", tags: "sampling design simple random stratified systematic cluster" },
    { title: "Multistage Household Selection & Sampling Fraction", subject: "Geography Practical", page: "geo-practical.html#ch11", tags: "multistage sampling household selection sampling fraction" },
    { title: "Field Techniques: Observation, Questionnaire & Interview", subject: "Geography Practical", page: "geo-practical.html#ch12", tags: "observation participant questionnaire interview schedule" },
    { title: "Focus Group Discussion (FGD)", subject: "Geography Practical", page: "geo-practical.html#ch15", tags: "fgd focus group discussion moderator qualitative data" },
    { title: "Spatial Survey: Transects & Quadrats", subject: "Geography Practical", page: "geo-practical.html#ch16", tags: "transect quadrat space survey land use vegetation density" },
    { title: "Field Sketching & Slope Profiles", subject: "Geography Practical", page: "geo-practical.html#ch17", tags: "field sketch slope profile eye level landscape panorama" },
    { title: "Field Report Design: Aim, Objectives & Methodology", subject: "Geography Practical", page: "geo-practical.html#ch18", tags: "field report aim objectives smart methodology analysis interpretation" },
    { title: "Complete Model Field Report: Rampur Village Survey", subject: "Geography Practical", page: "geo-practical.html#ch23", tags: "model report sample village survey rampur water supply" },
    { title: "MS Word Formatting for Field Reports", subject: "Geography Practical", page: "geo-practical.html#ch24", tags: "ms word layout margins page setup font formatting" },
    { title: "MS Excel Data Entry, Formulas & Charts", subject: "Geography Practical", page: "geo-practical.html#ch25", tags: "ms excel formulas sum average count countif stdev correl charts bar pie" },
    { title: "150+ Practical Viva Voce Question Bank", subject: "Geography Practical", page: "geo-practical.html#sec-viva", tags: "viva voce oral exam practical questions examiner external" },

    // Hindi (Language Based Course-1 — Paper-755131)
    { title: "Hindi Language: Definition, Nature & Scope (Unit-1)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch1", tags: "hindi bhasha definition characteristics scope grammar linguistics origin" },
    { title: "Evolution of Literary Khari Boli (Unit-1)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch2", tags: "khari boli shauraseni apabhramsha bharatendu dwivedi modern standard hindi" },
    { title: "Amir Khusro: Mukariyān (Tara, Joota, Dhol, Bichhoo)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch3", tags: "amir khusro mukariyan riddles sufi poetry delhi sultanate" },
    { title: "Jaishankar Prasad: 'Aansu' — Lyrical Elegy (Unit-2)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch4", tags: "jaishankar prasad aansu tears chhayavad romanticism viraha elegy" },
    { title: "Harivansh Rai Bachchan: 'Madhushala' — Halavad (Unit-2)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch5", tags: "harivansh rai bachchan madhushala halavad tavern wine rubaiyat" },
    { title: "Ramdhari Singh Dinkar: 'Mere Nagpati Mere Vishal' (Unit-2)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch6", tags: "ramdhari singh dinkar mere nagpati mere vishal himalayas national awakening" },
    { title: "Suryakant Tripathi 'Nirala': 'Bandho Na Naav Is Thanw Bandhu'", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch7", tags: "suryakant tripathi nirala bandho na naav boatman philosophical lyric chhayavad" },
    { title: "Nagarjun: 'Bahut Dinon Tak Choolha Roya' (Unit-2)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch8", tags: "nagarjun choolha roya hearth wept famine hunger progressive realism" },
    { title: "Munshi Premchand: 'Mantra' Short Story (Unit-3)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch9", tags: "premchand mantra bhagat doctor chhadha snakebite morality compassion" },
    { title: "Dr. Ganga Prasad Vimal: 'Siddhartha Ka Lautna' (Story)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch10", tags: "ganga prasad vimal siddhartha ka lautna modern story alienation return" },
    { title: "Acharya Ramchandra Shukla: 'Shraddha aur Bhakti' (Essay)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch11", tags: "ramchandra shukla shraddha aur bhakti reverence devotion ethics chintamani" },
    { title: "Mahavir Prasad Dwivedi: 'Kaviyon Mein Urmila Vishayak Udasinta'", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch12", tags: "mahavir prasad dwivedi urmila ramayana neglect saket dwivedi yug" },
    { title: "Harishankar Parsai: 'Sadachar Ka Tabeez' (Satirical Essay)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch13", tags: "harishankar parsai sadachar ka tabeez bureaucratic corruption satire" },
    { title: "Pratap Narayan Mishra: 'Manoyog' (Essay)", subject: "Hindi (Language Course-1)", page: "hindi-bhasha-1.html#ch14", tags: "pratap narayan mishra manoyog mental focus concentration bharatendu yug" },

    // VAC CTMV
    { title: "Culture vs Civilization (MacIver Definition)", subject: "VAC — CTMV", page: "vac-ctmv.html#u1-1", tags: "culture civilization sanskriti sabhyata maciver page" },
    { title: "Universal Moral Values: Satya, Ahimsa, Karuna", subject: "VAC — CTMV", page: "vac-ctmv.html#u2-1", tags: "moral values satya ahimsa karuna truth nonviolence compassion" },
    { title: "Vasudhaiva Kutumbakam & Nishkama Karma", subject: "VAC — CTMV", page: "vac-ctmv.html#u2-2", tags: "vasudhaiva kutumbakam nishkama karma bhagavad gita upanishads" },
    { title: "Constitutional Values & Article 51A Duties", subject: "VAC — CTMV", page: "vac-ctmv.html#u3-1", tags: "preamble constitutional values article 51a fundamental duties sovereign socialist secular democratic" },
    { title: "Digital Ethics & Cyber Conduct", subject: "VAC — CTMV", page: "vac-ctmv.html#u4-1", tags: "digital ethics cyber morality social media privacy fake news" }
];

function initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('global-search-results') || document.getElementById('search-results-list');
        if (!resultsContainer) return;

        if (query.length < 2) {
            resultsContainer.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--text-subtle); font-size:0.88rem;">Type at least 2 characters to search...</li>';
            return;
        }

        const filtered = searchDatabase.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.tags.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--text-subtle); font-size:0.88rem;">No matching topics found for your search.</li>';
            return;
        }

        resultsContainer.innerHTML = filtered.map(item => `
            <li>
                <a href="./${item.page}" class="search-result-item" onclick="closeSearchModal()">
                    <span class="title">${item.title}</span>
                    <span class="subject">${item.subject}</span>
                </a>
            </li>
        `).join('');
    });
}

function openSearchModal() {
    const modal = document.getElementById('search-modal-overlay');
    const input = document.getElementById('global-search-input');
    if (modal) {
        modal.classList.add('active');
        if (input) {
            input.value = '';
            input.focus();
        }
        const resultsContainer = document.getElementById('global-search-results') || document.getElementById('search-results-list');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--text-subtle); font-size:0.88rem;">Type at least 2 characters to search...</li>';
        }
    }
}

function closeSearchModal() {
    const modal = document.getElementById('search-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

/* Check Question Option In Textbook Quiz */
function checkOption(element, isCorrect, explanationId) {
    const parent = element.parentElement;
    const options = parent.querySelectorAll('.quiz-option');

    options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'wrong');
        opt.disabled = true;
    });

    element.classList.add('selected');
    if (isCorrect) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
        options.forEach(opt => {
            if (opt.getAttribute('data-correct') === 'true') {
                opt.classList.add('correct');
            }
        });
    }

    const exp = document.getElementById(explanationId);
    if (exp) exp.style.display = 'block';
}

/* Check URL query parameters (e.g. ?quiz=geo-theory) on index.html */
function initUrlParamsHandler() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizSubject = urlParams.get('quiz');
    if (quizSubject && typeof startSubjectQuiz === 'function') {
        setTimeout(() => {
            startSubjectQuiz(quizSubject);
        }, 300);
    }
}

function toggleBookAnswer(btn, answerId) {
    const ansEl = document.getElementById(answerId);
    if (!ansEl) return;
    if (ansEl.classList.contains('visible')) {
        ansEl.classList.remove('visible');
        btn.textContent = 'View Answer & Explanation';
    } else {
        ansEl.classList.add('visible');
        btn.textContent = 'Hide Answer';
    }
}

function checkBookOption(optElement, isCorrect, answerId) {
    const parent = optElement.closest('.book-mcq-options');
    if (!parent) return;
    const allOpts = parent.querySelectorAll('.book-mcq-opt');
    allOpts.forEach(o => {
        o.style.fontWeight = 'normal';
    });
    optElement.style.fontWeight = 'bold';
    const ansEl = document.getElementById(answerId);
    if (ansEl) ansEl.classList.add('visible');
}

/* Helper: Throttle */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* --------------------------------------------------------------------------
   LANGUAGE SYSTEM MANAGER & POSITION-PRESERVING SWITCHER
   -------------------------------------------------------------------------- */
function checkFirstTimeVisitor() {
    try {
        const savedLang = localStorage.getItem('ba5_language');
        if (!savedLang) {
            // No saved language yet: Redirect first-time visitor to root landing page
            const path = window.location.pathname;
            const fileName = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
            const currentFolder = path.includes('/hindi/') ? 'hindi' : 'englisg';
            const returnTarget = encodeURIComponent(currentFolder + '/' + fileName + window.location.hash);
            window.location.replace('../index.html?return=' + returnTarget);
        }
    } catch (e) {
        console.error(e);
    }
}

function switchLanguage(targetLang) {
    try {
        if (window.AudioReader) {
            window.AudioReader.stop();
        }
        const isEnglish = window.location.pathname.includes('/englisg/') || document.documentElement.lang === 'en';
        const lang = targetLang || (isEnglish ? 'hi' : 'en');
        
        // Permanently remember selected language
        localStorage.setItem('ba5_language', lang);

        // Get current page filename
        const path = window.location.pathname;
        let fileName = path.substring(path.lastIndexOf('/') + 1);
        if (!fileName || fileName === '') {
            fileName = 'index.html';
        }

        // Detect current section/position
        let targetHash = window.location.hash;
        if (!targetHash) {
            const activeToc = document.querySelector('.toc-link.active');
            if (activeToc && activeToc.getAttribute('href') && activeToc.getAttribute('href').startsWith('#')) {
                targetHash = activeToc.getAttribute('href');
            } else {
                // Find closest section/chapter in view
                const sections = document.querySelectorAll('article[id], section[id], div[id^="ch"], div[id^="u"], div[id^="course-"], div[id^="sec-"], div[id$="-summary"], h1[id], h2[id], h3[id]');
                let closestId = null;
                let minDistance = Infinity;
                sections.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top >= -120 && rect.top <= 450) {
                        if (Math.abs(rect.top) < minDistance) {
                            minDistance = Math.abs(rect.top);
                            closestId = el.id;
                        }
                    }
                });
                if (closestId) {
                    targetHash = '#' + closestId;
                }
            }
        }

        // Save position details in sessionStorage for smooth restoration
        sessionStorage.setItem('ba5_scroll_restore', JSON.stringify({
            scrollY: (document.querySelector(".content-area, .book-page") && window.innerWidth > 991) ? document.querySelector(".content-area, .book-page").scrollTop : window.scrollY,
            hash: targetHash,
            timestamp: Date.now()
        }));

        // Navigate to the same page in the target language directory
        const targetDir = (lang === 'hi') ? '../hindi/' : '../englisg/';
        window.location.href = targetDir + fileName + (targetHash || '');
    } catch (e) {
        console.error(e);
        const fallbackDir = (targetLang === 'hi') ? '../hindi/' : '../englisg/';
        window.location.href = fallbackDir + 'index.html';
    }
}

function restoreReadingPosition() {
    try {
        const raw = sessionStorage.getItem('ba5_scroll_restore');
        if (!raw) return;
        const data = JSON.parse(raw);
        sessionStorage.removeItem('ba5_scroll_restore');

        // Only restore if language switch happened within last 15 seconds
        if (Date.now() - data.timestamp > 15000) return;

        if (data.hash && document.querySelector(data.hash)) {
            const targetEl = document.querySelector(data.hash);
            if (targetEl) {
                setTimeout(() => {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
                return;
            }
        }

        if (data.scrollY && data.scrollY > 40) {
            setTimeout(() => {
                const contentArea = document.querySelector('.content-area, .book-page');
                if (contentArea && window.innerWidth > 991) {
                    contentArea.scrollTo({ top: data.scrollY, behavior: 'smooth' });
                }
                window.scrollTo({ top: data.scrollY, behavior: 'smooth' });
            }, 100);
        }
    } catch (e) {}
}

/* --------------------------------------------------------------------------
   AUDIO READER INITIALIZER
   -------------------------------------------------------------------------- */
function initAudioReader() {
    if (!window.__BA5_AUDIO_READER__ && !document.querySelector('script[src*="audio-reader.js"]')) {
        const s = document.createElement('script');
        s.src = './assets/js/audio-reader.js';
        s.defer = true;
        document.body.appendChild(s);
    }
}

/* --------------------------------------------------------------------------
   DIGITAL BOOKSHELF CATEGORY FILTER CONTROLLER
   -------------------------------------------------------------------------- */
function filterBookshelf(category, btnElement) {
    const filterButtons = document.querySelectorAll('.shelf-filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    }

    const cards = document.querySelectorAll('.digital-book-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('is-filtered-out');
        } else {
            card.classList.add('is-filtered-out');
        }
    });
}





/* --------------------------------------------------------------------------
   SMOOTH SCROLLING FOR CHAPTER & TOPIC ANCHORS
   -------------------------------------------------------------------------- */
function initSmoothScrollAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const hash = this.getAttribute('href');
            if (!hash || hash === '#' || this.classList.contains('quiz-option')) return;
            
            const target = document.querySelector(hash);
            if (target) {
                const contentArea = document.querySelector('.content-area, .book-page, .book-main-column');
                if (window.innerWidth > 991 && contentArea && contentArea.contains(target)) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (history.pushState) {
                        history.pushState(null, null, hash);
                    } else {
                        window.location.hash = hash;
                    }
                }
            }
        });
    });
}

/* --------------------------------------------------------------------------
   AUTO-HIDING STICKY HEADERS CONTROLLER (Desktop & Mobile)
   - Downward scroll: smoothly hides .top-navbar & .sub-header for maximum reading space
   - Upward scroll (even slightly): smoothly reveals both headers immediately
   - Scrolling stops: maintains the current visibility state
   - Top of page (<= 15px): always visible
   - Fixed at top when visible
   - Zero flicker, zero jump, zero layout thrashing
   -------------------------------------------------------------------------- */
function initAutoHidingHeader() {
    const topNavbar = document.querySelector('.top-navbar');
    const subHeader = document.querySelector('.sub-header');
    if (!topNavbar && !subHeader) return;

    const contentArea = document.querySelector('.content-area, .book-page, .book-main-column');
    const isDesktopReading = () => (
        window.innerWidth > 991 &&
        contentArea &&
        Boolean(document.querySelector('.main-wrapper:not(.single-column)'))
    );

    let lastScrollY = isDesktopReading() ? (contentArea ? contentArea.scrollTop : 0) : (window.pageYOffset || document.documentElement.scrollTop || 0);
    let isHidden = false;
    let ticking = false;
    let accumulatedDelta = 0;

    // Configuration thresholds
    const HIDE_MIN_SCROLL = 70;  // Don't auto-hide until scrolled at least 70px from top
    const DOWN_DELTA = 6;        // Cumulative scroll down of >= 6px triggers hide
    const UP_DELTA = -3;         // Cumulative scroll up of <= -3px triggers show immediately

    function showHeaders() {
        if (isHidden) {
            isHidden = false;
            document.body.classList.remove('header-hidden');
        }
        accumulatedDelta = 0;
    }

    function hideHeaders() {
        // Safety checks: don't hide if mobile drawer, mobile menu, or any modal is open
        if (
            document.body.classList.contains('mobile-sidebar-open') ||
            (document.getElementById('nav-menu') && document.getElementById('nav-menu').classList.contains('mobile-open')) ||
            document.querySelector('.syllabus-modal-overlay.active, .search-modal-overlay.active')
        ) {
            showHeaders();
            return;
        }

        if (!isHidden) {
            isHidden = true;
            document.body.classList.add('header-hidden');
        }
        accumulatedDelta = 0;
    }

    function processScroll(currentScroll, maxScroll) {
        // 1. At or near the top: ALWAYS visible
        if (currentScroll <= 15) {
            showHeaders();
            lastScrollY = currentScroll;
            return;
        }

        const delta = currentScroll - lastScrollY;

        // 2. Prevent bottom overscroll bounce from triggering state flips
        if (maxScroll > 0 && currentScroll >= maxScroll - 10 && delta > 0) {
            lastScrollY = currentScroll;
            return;
        }

        // 3. Accumulate delta in same direction, or reset if reversed
        if ((delta > 0 && accumulatedDelta >= 0) || (delta < 0 && accumulatedDelta <= 0)) {
            accumulatedDelta += delta;
        } else {
            accumulatedDelta = delta;
        }

        // 4. Check thresholds
        if (accumulatedDelta >= DOWN_DELTA && currentScroll > HIDE_MIN_SCROLL) {
            hideHeaders();
        } else if (accumulatedDelta <= UP_DELTA) {
            showHeaders();
        }

        lastScrollY = currentScroll;
    }

    // Scroll listener for window (Mobile & Desktop Homepage / single-column)
    window.addEventListener('scroll', () => {
        if (isDesktopReading()) return;

        if (!ticking) {
            requestAnimationFrame(() => {
                const currentScroll = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
                const maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight);
                processScroll(currentScroll, maxScroll);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Scroll listener for contentArea (Desktop Book Reading Pages)
    if (contentArea) {
        contentArea.addEventListener('scroll', () => {
            if (!isDesktopReading()) return;

            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScroll = Math.max(0, contentArea.scrollTop);
                    const maxScroll = Math.max(0, contentArea.scrollHeight - contentArea.clientHeight);
                    processScroll(currentScroll, maxScroll);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // On window resize, re-sync lastScrollY to avoid false delta jumps
    window.addEventListener('resize', () => {
        lastScrollY = isDesktopReading()
            ? (contentArea ? contentArea.scrollTop : 0)
            : Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
        accumulatedDelta = 0;
    });

    // Make sure headers are shown when user clicks anchor links or TOC links or header buttons
    document.querySelectorAll('a[href^="#"], .sidebar-toggle-btn, #nav-menu-toggle, .nav-hamburger').forEach(el => {
        el.addEventListener('click', () => {
            showHeaders();
        });
    });
}
