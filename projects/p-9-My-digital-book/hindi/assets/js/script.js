/* ==========================================================================
   बी.ए. 5वां सेमेस्टर - डिजिटल पाठ्यपुस्तक सेंट्रल जावास्क्रिप्ट इंजन
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
        themeText.textContent = theme === 'dark' ? 'लाइट' : 'डार्क';
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
            if (progressPill) progressPill.innerHTML = `<i class="fa-solid fa-book-open text-accent"></i> प्रगति: ${scrolled}%`;
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
                        <span>पिछला अध्ययन जारी रखें: <strong>${lastReading.title}</strong></span>
                    </div>
                    <a href="./${lastReading.path}" class="nav-btn" style="background:var(--accent-color); border:none; color:#fff;">
                        फिर से शुरू करें <i class="fa-solid fa-arrow-right"></i>
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
            btn.setAttribute('aria-label', isOpen ? 'विषय-सूची छिपाएं' : 'विषय-सूची दिखाएं');
            btn.setAttribute('title', isOpen ? 'विषय-सूची छिपाएं (Ctrl+B)' : 'विषय-सूची दिखाएं (Ctrl+B)');
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
            mainBtn.setAttribute('aria-label', isContentOnly ? 'सामान्य दृश्य पर वापस जाएँ' : 'केवल सामग्री दिखाएँ');
            mainBtn.setAttribute('title', isContentOnly ? 'सामान्य दृश्य पर वापस जाएँ' : 'केवल सामग्री दिखाएँ (पठन मोड)');
        }
        if (exitBtn) {
            exitBtn.setAttribute('aria-label', 'सामान्य दृश्य पर वापस जाएँ');
            exitBtn.setAttribute('title', 'सामान्य दृश्य पर वापस जाएँ');
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
    'eco-elective-1': 'अर्थशास्त्र ऐच्छिक 1 — विकास एवं नीति',
    'eco-skill': 'फील्ड आधारित पाठ्यक्रम (Field Based Course) — उद्योग व उद्यमशीलता',
    'geo-theory': 'भूगोल — आर्थिक भूगोल (Economic Geography)',
    'geo-practical': 'भूगोल प्रायोगिक: फील्ड सर्वे विधियां, फील्ड ट्रिप व रिपोर्ट लेखन',
    'socio-additional': 'समाजशास्त्र (अतिरिक्त विषय)',
    'vac-ctmv': 'मूल्य वर्धित पाठ्यक्रम — CTMV'
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
                        <h3 style="color:#ffffff;">आधिकारिक सिलेबस दस्तावेज़</h3>
                        <p>सिलेबस फ़ाइल: <code>assets/images/syllabus/${currentSyllabusSubject}.png</code></p>
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
    // Economics Elective 1 (भारत में आर्थिक विकास एवं नीतियां - I, 30 अध्याय)
    { title: "Economic Growth vs Economic Development (संवृद्धि बनाम विकास)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch1", tags: "growth development gdp real income kuznets amartya sen संवृद्धि विकास" },
    { title: "Measurement of Economic Development & HDI (विकास का मापन)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch2", tags: "hdi mpi life expectancy education gni per capita ppp मानव विकास सूचकांक" },
    { title: "Goals and Strategy of Indian Planning (भारतीय नियोजन)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch6", tags: "indian planning mahalanobis five year plan mixed economy niti aayog नियोजन नीति आयोग" },
    { title: "Sustainable Development Goals & India (सतत विकास लक्ष्य)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch7", tags: "sdgs 17 goals brundtland sustainable development niti aayog sdg index सतत विकास" },
    { title: "Capital Formation: Physical vs Human (पूंजी निर्माण)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch10", tags: "capital formation physical human capital savings investment पूंजी निर्माण" },
    { title: "Technology, Institutions & Douglass North (संस्थाएं)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch12", tags: "technology institutions douglass north property rights governance संस्थाएं तकनीक" },
    { title: "Foreign Capital, FDI vs FII (हॉट मनी)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch15", tags: "fdi fii foreign direct investment hot money fema foreign capital विदेशी निवेश" },
    { title: "Decadal Growth & 1921 Year of Great Divide (दशकीय वृद्धि)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch17", tags: "decadal growth 1921 great divide census population दशकीय वृद्धि" },
    { title: "Age Composition & Demographic Dividend (जनसांख्यिकी लाभांश)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch18", tags: "age composition dependency ratio demographic dividend working age जनसांख्यिकी लाभांश" },
    { title: "Rural-Urban Migration: Push & Pull Factors (प्रवासन)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch22", tags: "migration push pull factors remittances reverse migration प्रवासन" },
    { title: "Organised vs Unorganised Sector (संगठित व असंगठित)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch26", tags: "occupational structure organised unorganised informal sector संगठित असंगठित" },
    { title: "Unemployment: Open, Under & Disguised (बेरोजगारी)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch28", tags: "unemployment open underemployment disguised marginal productivity mpl zero बेरोजगारी प्रच्छन्न" },
    { title: "MGNREGA & Rural Employment Schemes (मनरेगा)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch29", tags: "mgnrega 100 days guarantee women safety net pmmy pmegp मनरेगा रोजगार योजना" },
    { title: "Macroeconomic Indicators & Critical Analysis (समष्टिगत संकेतक)", subject: "अर्थशास्त्र ऐच्छिक 1", page: "eco-elective-1-policy.html#ch30", tags: "macroeconomic indicators gdp inflation fiscal deficit cad jobless growth समष्टिगत संकेतक" },

    // Field Based Course (फील्ड आधारित पाठ्यक्रम — 25 अध्याय)
    { title: "Field Visit Academic Purpose (फील्ड विजिट उद्देश्य व महत्व)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch1", tags: "field visit purpose real world classroom theory प्राथमिक आंकड़े फील्ड विजिट" },
    { title: "Economic vs Entrepreneurial Activities & Value Addition", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch2", tags: "economic entrepreneurial activity value addition innovation risk मूल्य संवर्धन नवाचार" },
    { title: "Main Economic Agents (मुख्य आर्थिक अभिकर्ता व आरेख)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch3", tags: "producer entrepreneur worker manager consumer आर्थिक अभिकर्ता प्रवाह चित्र" },
    { title: "Small, Medium & Large Scale Industries (उद्योगों की तुलना)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch4", tags: "small medium large scale industries msme comparison table लघु मध्यम वृहत उद्योग" },
    { title: "Interacting with Entrepreneurs, Workers & Managers (संवाद)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch5", tags: "entrepreneur worker manager interview questionnaire संवाद साक्षात्कार प्रश्नावली" },
    { title: "Working Environment Assessment (कार्य-वातावरण मूल्यांकन)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch6", tags: "working environment ventilation lighting noise ppe safety कार्य वातावरण सुरक्षा" },
    { title: "Problems Faced by Producers & Fact vs Assumption Rule", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch7", tags: "problems faced producers raw material power working capital साक्ष्य बनाम अनुमान" },
    { title: "Enterprise Background & Locational Factors (पृष्ठभूमि)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch8", tags: "enterprise background udyam registration locational advantage उद्यम पृष्ठभूमि स्थापना" },
    { title: "Operations & 5-Stage Production Flow (संचालन प्रक्रिया)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch9", tags: "operations production flow quality control packaging रूपांतरण गुणवत्ता नियंत्रण" },
    { title: "Marketing 4Ps & Distribution Channels (विपणन मिश्रण)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch10", tags: "marketing 4ps product price place promotion distribution channel विपणन वितरण" },
    { title: "Inventory Management & FIFO Principle (भंडार प्रबंधन)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch11", tags: "inventory management raw material wip finished goods fifo overstocking भंडार प्रबंधन" },
    { title: "Financial Aspects & Working Capital Cycle (पूंजी चक्र)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch12", tags: "fixed working capital operating cycle cash flow trade credit mudra कार्यशील पूंजी" },
    { title: "Human Resources & Workforce Composition (मानव संसाधन)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch13", tags: "human resources skilled unskilled on the job training labour turnover मानव संसाधन" },
    { title: "Operational Problem Matrix & Coping Strategy (समाधान)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch14", tags: "operational problems root cause coping strategy समाधान तंत्र समस्या मैट्रिक्स" },
    { title: "Three Stages of Fieldwork: Before, During & After (कार्यप्रणाली)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch15", tags: "fieldwork methodology before during after visit क्षेत्रीय कार्यप्रणाली चरण" },
    { title: "Field Observation Checklist (8-आयामी व्यापक चेकलिस्ट)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch16", tags: "field observation checklist audit 8 dimensions चेकलिस्ट अवलोकन" },
    { title: "Field Diary Writing & Authentic Sample Entry (फील्ड डायरी)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch17", tags: "field diary notebook sample entry primary evidence फील्ड डायरी प्रविष्टि" },
    { title: "Ethics, Safety Protocols & No-Fabrication Rule (नैतिकता)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch18", tags: "research ethics informed consent ppe safety no fabrication rule नैतिकता सुरक्षा" },
    { title: "30-Point Standard Field Report Structure (रिपोर्ट प्रारूप)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch19", tags: "30 point report structure master outline format फील्ड रिपोर्ट प्रारूप" },
    { title: "Things Observed vs Things Learned & Reflection (अनुभव)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch20", tags: "things observed things learned student experience reflection देखी गई सीखी गई बातें" },
    { title: "Sample Illustrative Field Report (आदर्श फील्ड रिपोर्ट नमूना)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch21", tags: "sample illustrative report balaji agro flour mill मॉडल रिपोर्ट आदर्श नमूना" },
    { title: "15 Practical Field Exercises (15 व्यावहारिक फील्ड अभ्यास)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch22", tags: "practical field exercises assignments 15 अभ्यास प्रैक्टिकल" },
    { title: "40 High-Yield Viva Voce Q&A Bank (40 वाइवा प्रश्नोत्तर)", subject: "फील्ड आधारित पाठ्यक्रम", page: "eco-skill-course.html#ch23", tags: "viva voce questions answers 40 प्रश्न वाइवा मौखिक परीक्षा" },

    // Geography Theory (आर्थिक भूगोल - 24 अध्याय)
    { title: "Economic Geography: Scope, Approaches & Concepts", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch1", tags: "economic geography chisholm zimmermann production distribution exchange consumption आर्थिक भूगोल परिभाषा" },
    { title: "Approaches of Economic Geography (उपागम)", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch2", tags: "regional systematic spatial ecological historical approach उपागम क्षेत्रीय क्रमबद्ध स्थानिक" },
    { title: "16 Fundamental Concepts (मूलभूत संकल्पनाएं)", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch3", tags: "location situation distance accessibility spatial interaction region resource मूल संकल्पनाएं" },
    { title: "Patterns of Development, HDI & North-South Divide", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch4", tags: "economic growth development hdi brandt line north south divide विकास के प्रतिरूप" },
    { title: "Von Thunen Agricultural Location Theory", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch6", tags: "von thunen agricultural location isolated state concentric rings locational rent वॉन थ्यूनेन कृषि मॉडल" },
    { title: "Alfred Weber Industrial Location Theory", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch7", tags: "weber industrial location material index mi isodapane agglomeration वेबर औद्योगिक मॉडल" },
    { title: "Intensive Subsistence & Commercial Grain Farming", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch8", tags: "intensive subsistence commercial grain prairies steppes wheat rice गहन निर्वाह वाणिज्यिक अनाज" },
    { title: "Plantation Agriculture & Commercial Dairy", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch10", tags: "plantation tea coffee fazendas commercial dairy farming बागानी कृषि दुग्ध कृषि" },
    { title: "Commercial Fishing & Continental Shelves", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch12", tags: "commercial fishing grand bank dogger bank plankton overfishing वाणिज्यिक मत्स्यन" },
    { title: "Iron Ore, Coal & Petroleum Resources", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch14", tags: "iron ore hematite coal gondwana bituminous petroleum digboi mumbai high खनन कोयला लोहा तेल" },
    { title: "Cotton Textile & Petro-Chemical Industry", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch17", tags: "cotton textile pure raw material petrochemical naphtha jamnagar सूती वस्त्र पेट्रोकेमिकल" },
    { title: "Major World Manufacturing Regions", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch19", tags: "manufacturing regions rhine ruhr north america tokaido corridor विनिर्माण प्रदेश रूर" },
    { title: "Tertiary & Quaternary Activities (सेवा व ज्ञान)", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch20", tags: "tertiary quaternary service sector knowledge economy gold collar तृतीयक चतुर्थक सेवाएं" },
    { title: "Modes of Transportation (सड़क, रेल, जल, वायु, पाइपलाइन)", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch22", tags: "transport road rail water suez canal panama air pipeline परिवहन के साधन" },
    { title: "International Trade Patterns & Trading Blocs", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch23", tags: "international trade balance of trade surplus deficit eu asean brics अंतर्राष्ट्रीय व्यापार" },
    { title: "Information & Communication Technology (ICT) Industry", subject: "आर्थिक भूगोल", page: "geo-theory.html#ch24", tags: "ict information technology silicon valley bengaluru software digital divide सूचना प्रौद्योगिकी" },

    // Geography Practical (फील्ड सर्वे विधियां, फील्ड ट्रिप व रिपोर्ट लेखन - 25 अध्याय)
    { title: "Role and Value of Field Work (क्षेत्र कार्य की भूमिका व मूल्य)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch1", tags: "field work ground truthing primary data carl sauer david harvey क्षेत्र कार्य ग्राउंड ट्रूथिंग" },
    { title: "Ethics in Field Work (क्षेत्र कार्य की नैतिकता)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch3", tags: "ethics consent privacy cultural sensitivity rapport building नैतिकता सहमति गोपनीयता" },
    { title: "Defining the 'Field' & 5 Case Studies (केस स्टडीज)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch4", tags: "defining field case study rural urban physical human environmental ग्रामीण नगरीय केस स्टडी" },
    { title: "Sampling Design: Random, Stratified & Systematic", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch6", tags: "sampling design simple random stratified systematic cluster प्रतिदर्शन नमूना चयन" },
    { title: "Multistage Household Selection (बहु-स्तरीय परिवार चयन)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch11", tags: "multistage sampling household selection sampling fraction परिवार चयन प्रतिचयन अनुपात" },
    { title: "Field Techniques: Observation, Questionnaire & Interview", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch12", tags: "observation participant questionnaire interview schedule अवलोकन प्रश्नावली साक्षात्कार अनुसूची" },
    { title: "Focus Group Discussion - FGD (केंद्रित समूह चर्चा)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch15", tags: "fgd focus group discussion moderator qualitative data केंद्रित समूह चर्चा समूह साक्षात्कार" },
    { title: "Space Survey: Transects & Quadrats (ट्रांसेक्ट व क्वाड्रैट)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch16", tags: "transect quadrat space survey land use vegetation density दिक् सर्वेक्षण अनुप्रस्थ काट क्वाड्रैट" },
    { title: "Field Sketching & Slope Profile (स्थलीय स्केच आरेखन)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch17", tags: "field sketch slope profile eye level landscape panorama स्थलीय स्केच ढाल परिच्छेदिका" },
    { title: "Field Report Design: Aim, Objectives & Methodology", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch18", tags: "field report aim objectives smart methodology analysis interpretation रिपोर्ट प्रारूप उद्देश्य प्रविधि" },
    { title: "Complete Model Field Report: Rampur Village (रामपुर रिपोर्ट)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch23", tags: "model report sample village survey rampur water supply जल सर्वेक्षण आदर्श रिपोर्ट" },
    { title: "MS Word Formatting for Field Reports", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch24", tags: "ms word layout margins page setup font formatting वर्ड रिपोर्ट संपादन" },
    { title: "MS Excel Data Entry, Formulas & Charts", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#ch25", tags: "ms excel formulas sum average count countif stdev correl charts bar pie एक्सेल चार्ट सूत्र" },
    { title: "150+ Practical Viva Voce Question Bank (वाइवा प्रश्न बैंक)", subject: "भूगोल प्रायोगिक", page: "geo-practical.html#sec-viva", tags: "viva voce oral exam practical questions examiner external वाइवा मौखिक परीक्षा प्रश्न" },

    // Sociology Additional
    { title: "Auguste Comte: Law of Three Stages (अगस्ट कॉम्ट)", subject: "समाजशास्त्र अतिरिक्त", page: "socio-additional.html#u1-1", tags: "comte three stages theological metaphysical positive प्रत्यक्षवाद तीन स्तर" },
    { title: "Émile Durkheim: Social Facts & Suicide (दुर्खीम)", subject: "समाजशास्त्र अतिरिक्त", page: "socio-additional.html#u1-2", tags: "durkheim social facts suicide सामाजिक तथ्य आत्महत्या" },
    { title: "Karl Marx: Class Struggle (कार्ल मार्क्स)", subject: "समाजशास्त्र अतिरिक्त", page: "socio-additional.html#u1-3", tags: "karl marx class struggle bourgeoisie proletariat वर्ग संघर्ष बुर्जुआ सर्वहारा" },
    { title: "Max Weber: Social Action & Bureaucracy (मैक्स वेबर)", subject: "समाजशास्त्र अतिरिक्त", page: "socio-additional.html#u1-4", tags: "max weber social action ideal type bureaucracy नौकरशाही सामाजिक क्रिया" },
    { title: "M.N. Srinivas: Sanskritization (संस्कृतिकरण)", subject: "समाजशास्त्र अतिरिक्त", page: "socio-additional.html#u2-1", tags: "sanskritization mn srinivas dominant caste संस्कृतिकरण प्रभु जाति" },
    { title: "G.S. Ghurye: Indian Caste System (जाति व्यवस्था)", subject: "समाजशास्त्र अतिरिक्त", page: "socio-additional.html#u2-2", tags: "ghurye caste system hierarchy endogamy जी एस घुर्ये जाति व्यवस्था" },

    // VAC CTMV
    { title: "Culture vs Civilization (संस्कृति बनाम सभ्यता)", subject: "VAC — CTMV", page: "vac-ctmv.html#u1-1", tags: "culture civilization sanskriti sabhyata maciver page संस्कृति सभ्यता" },
    { title: "Universal Moral Values: Satya, Ahimsa, Karuna", subject: "VAC — CTMV", page: "vac-ctmv.html#u2-1", tags: "moral values satya ahimsa karuna सत्य अहिंसा करुणा" },
    { title: "Vasudhaiva Kutumbakam & Nishkama Karma", subject: "VAC — CTMV", page: "vac-ctmv.html#u2-2", tags: "vasudhaiva kutumbakam nishkama karma bhagavad gita वसुधैव कुटुंबकम निष्काम कर्म" },
    { title: "Constitutional Values & Article 51A Duties", subject: "VAC — CTMV", page: "vac-ctmv.html#u3-1", tags: "preamble constitutional values article 51a fundamental duties मौलिक कर्तव्य प्रस्तावना" },
    { title: "Digital Ethics & Cyber Behavior (डिजिटल नैतिकता)", subject: "VAC — CTMV", page: "vac-ctmv.html#u4-1", tags: "digital ethics cyber morality social media privacy साइबर नैतिकता फेक न्यूज" }
];

function initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('global-search-results') || document.getElementById('search-results-list');
        if (!resultsContainer) return;

        if (query.length < 2) {
            resultsContainer.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--text-subtle); font-size:0.88rem;">खोजने के लिए कम से कम 2 अक्षर टाइप करें...</li>';
            return;
        }

        const filtered = searchDatabase.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.tags.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--text-subtle); font-size:0.88rem;">आपकी खोज से मेल खाता हुआ कोई विषय नहीं मिला।</li>';
            return;
        }

        resultsContainer.innerHTML = filtered.map(item => `
            <li>
                <a href="./${item.page}" class="search-result-item" onclick="closeSearchModal()">
                    <span class="title">${item.title}</span>
                    <span class="meta"><i class="fa-solid fa-folder-open" style="color:var(--accent-color); margin-right:4px;"></i> ${item.subject}</span>
                </a>
            </li>
        `).join('');
    });

    // Keyboard shortcut Ctrl+K to open search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
    });
}

function handleSearchInput(val) {
    const input = document.getElementById('global-search-input');
    if (input && input.value !== val) {
        input.value = val;
    }
    const event = new Event('input', { bubbles: true });
    if (input) input.dispatchEvent(event);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSearchModal() {
    const overlay = document.getElementById('search-modal-overlay') || document.getElementById('search-modal');
    const input = document.getElementById('global-search-input');
    if (overlay) {
        overlay.classList.add('active');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function closeSearchModal() {
    const overlay = document.getElementById('search-modal-overlay') || document.getElementById('search-modal');
    if (overlay) overlay.classList.remove('active');
}

/* --------------------------------------------------------------------------
   10. INTERACTIVE WIDGETS (FLASHCARDS, MCQS, AUTO-LAUNCH QUIZ)
   -------------------------------------------------------------------------- */
function flipFlashcard(cardElement) {
    cardElement.classList.toggle('flipped');
}

function selectMcqOption(element, isCorrect, explanationId) {
    const parentOptions = element.closest('.mcq-options');
    if (!parentOptions) return;

    const options = parentOptions.querySelectorAll('.mcq-option');
    options.forEach(opt => opt.style.pointerEvents = 'none');

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

/* Textbook Exercise MCQs Helper */
function toggleBookAnswer(btn, answerId) {
    const ansEl = document.getElementById(answerId);
    if (!ansEl) return;
    if (ansEl.classList.contains('visible')) {
        ansEl.classList.remove('visible');
        btn.textContent = 'उत्तर व व्याख्या देखें';
    } else {
        ansEl.classList.add('visible');
        btn.textContent = 'उत्तर छिपाएं';
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

