/* ==========================================================================
   B.A. 5TH SEMESTER - DIGITAL TEXTBOOK CENTRAL JAVASCRIPT ENGINE
   CENTRAL JAVASCRIPT CONTROLLER & INTERACTIVE FEATURES
   Features: Theme, Typography Scale, Live Topic Progress, Real Focus Mode,
   Official Syllabus Lightbox, Global Search, Subject Quiz Auto-Launch
   ========================================================================== */

// Check for first-time visitor immediately
checkFirstTimeVisitor();

document.addEventListener('DOMContentLoaded', () => {
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
    restoreReadingPosition();
});

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

    window.addEventListener('scroll', throttle(() => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0) {
            const scrolled = Math.min(100, Math.round((winScroll / height) * 100));
            if (progressBar) progressBar.style.width = scrolled + '%';
            if (progressPill) progressPill.innerHTML = `<i class="fa-solid fa-book-open text-accent"></i> Progress: ${scrolled}%`;
        }
    }, 100));
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
    const sections = document.querySelectorAll('article[id], section[id], div[id^="u"], div[id^="course-"], div[id^="sec-"], div[id$="-summary"]');
    const navLinks = document.querySelectorAll('.toc-link');
    const breadcrumbTopic = document.getElementById('breadcrumb-active-topic');
    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '-15% 0px -70% 0px',
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
                        }

                        // Scroll sidebar to ensure active link is visible
                        const tocParent = link.closest('.sidebar-toc');
                        if (tocParent) {
                            const linkTop = link.offsetTop;
                            tocParent.scrollTop = linkTop - 80;
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
                const backdrop = document.getElementById('sidebar-backdrop');
                const sidebar = document.getElementById('sidebar-toc');
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
    const sidebar = document.getElementById('sidebar-toc');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggleBtns = document.querySelectorAll('#sidebar-toggle-btn, #mobile-toc-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    
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

    function toggleSidebar() {
        if (isDesktop()) {
            const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
            try {
                localStorage.setItem('ba5_sidebar_desktop', isCollapsed ? 'collapsed' : 'open');
            } catch (e) {}
            updateToggleAria(!isCollapsed);
        } else {
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

            const isOpen = document.body.classList.toggle('mobile-sidebar-open');
            sidebar.classList.toggle('open', isOpen);
            if (backdrop) backdrop.classList.toggle('active', isOpen);
            updateToggleAria(isOpen);
        }
    }

    function closeMobileSidebar() {
        document.body.classList.remove('mobile-sidebar-open');
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        updateToggleAria(false);
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileSidebar();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeMobileSidebar);
    }

    // Close mobile drawer when clicking any TOC link on mobile
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!isDesktop()) {
                closeMobileSidebar();
            }
        });
    });

    // Handle screen resize smoothly (e.g., orientation change or window resize)
    window.addEventListener('resize', throttle(() => {
        if (isDesktop()) {
            if (document.body.classList.contains('mobile-sidebar-open')) {
                closeMobileSidebar();
            }
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

    // Clean up mobile drawer states on window resize to desktop
    window.addEventListener('resize', () => {
        if (isDesktop()) {
            document.body.classList.remove('mobile-sidebar-open');
            sidebar.classList.remove('open');
            if (backdrop) backdrop.classList.remove('active');
            const isCollapsed = document.body.classList.contains('sidebar-collapsed');
            updateToggleAria(!isCollapsed);
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
    'socio-additional': 'Sociology (Additional Subject)',
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

    // Sociology Additional
    { title: "Auguste Comte: Law of Three Stages", subject: "Sociology (Additional)", page: "socio-additional.html#u1-1", tags: "comte three stages theological metaphysical positive positivism" },
    { title: "Émile Durkheim: Social Facts & Theory of Suicide", subject: "Sociology (Additional)", page: "socio-additional.html#u1-2", tags: "durkheim social facts suicide egoistic altruistic anomic" },
    { title: "Karl Marx: Class Struggle & Historical Materialism", subject: "Sociology (Additional)", page: "socio-additional.html#u1-3", tags: "karl marx class struggle bourgeoisie proletariat alienation" },
    { title: "Max Weber: Social Action & Ideal Type Bureaucracy", subject: "Sociology (Additional)", page: "socio-additional.html#u1-4", tags: "max weber social action ideal type bureaucracy authority verstehen" },
    { title: "M.N. Srinivas: Sanskritization & Dominant Caste", subject: "Sociology (Additional)", page: "socio-additional.html#u2-1", tags: "sanskritization mn srinivas dominant caste westernization" },
    { title: "G.S. Ghurye: Indian Caste System Features", subject: "Sociology (Additional)", page: "socio-additional.html#u2-2", tags: "ghurye caste system hierarchy endogamy segmental division" },

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

/* --------------------------------------------------------------------------
   10. SCROLL SPY & READING TOPIC BREADCRUMB
   -------------------------------------------------------------------------- */
function initScrollSpy() {
    const headings = document.querySelectorAll('.topic-heading, .chapter-section h2');
    const crumbTopic = document.getElementById('breadcrumb-active-topic');
    if (!headings.length || !crumbTopic) return;

    window.addEventListener('scroll', throttle(() => {
        let currentHeading = '';
        const scrollPos = window.scrollY + 120;

        headings.forEach(h => {
            if (h.offsetTop <= scrollPos) {
                currentHeading = h.textContent.trim();
            }
        });

        if (currentHeading) {
            crumbTopic.textContent = currentHeading;
            crumbTopic.style.display = 'inline-block';
        }
    }, 150));
}

/* --------------------------------------------------------------------------
   11. MOBILE DRAWER NAVIGATION MENU
   -------------------------------------------------------------------------- */
function initMobileNavMenu() {
    const hamburger = document.getElementById('nav-menu-toggle') || document.querySelector('.nav-hamburger');
    const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('mobile-open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const icon = hamburger.querySelector('i');
        if (icon) {
            icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('mobile-open')) {
            navMenu.classList.remove('mobile-open');
            hamburger.setAttribute('aria-expanded', 'false');
            const icon = hamburger.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            scrollY: window.scrollY,
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
                window.scrollTo({ top: data.scrollY, behavior: 'smooth' });
            }, 100);
        }
    } catch (e) {}
}

