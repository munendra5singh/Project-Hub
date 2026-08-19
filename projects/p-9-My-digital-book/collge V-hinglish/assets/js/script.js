/* ==========================================================================
   B.A. 5TH SEMESTER DIGITAL TEXTBOOK - CENTRAL JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFontSize();
    initReadingProgress();
    initContinueReading();
    initScrollSpy();
    initMobileSidebar();
    initBackToTop();
    initGlobalSearch();
    initSyllabusModal();
});

/* --------------------------------------------------------------------------
   1. THEME MANAGER (DARK / LIGHT MODE)
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
        themeText.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
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
    currentFontSizeScale = Math.max(13, Math.min(22, currentFontSizeScale + delta));
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
   3. READING PROGRESS BAR
   -------------------------------------------------------------------------- */
function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0) {
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        }
    });
}

/* --------------------------------------------------------------------------
   4. CONTINUE READING TRACKER
   -------------------------------------------------------------------------- */
function initContinueReading() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const pageTitle = document.title.split('|')[0].trim();
    
    // Don't track index.html as a specific subject
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

    // Render resume banner if present on page
    const resumeContainer = document.getElementById('resume-reading-container');
    if (resumeContainer) {
        const lastReading = JSON.parse(localStorage.getItem('ba5_last_reading'));
        if (lastReading && lastReading.path && lastReading.path !== currentPath) {
            resumeContainer.innerHTML = `
                <div class="resume-reading-banner">
                    <div>
                        <i class="fa-solid fa-bookmark text-brand-600"></i>
                        <span>Padhai wahi se start karein: <strong>${lastReading.title}</strong></span>
                    </div>
                    <a href="./${lastReading.path}" class="nav-btn" style="background:var(--accent-color); border:none;">
                        Wapas Padhne Lagien <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }
    }
}

/* --------------------------------------------------------------------------
   5. TABLE OF CONTENTS SCROLL SPY & SIDEBAR
   -------------------------------------------------------------------------- */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], div[id^="u"]');
    const navLinks = document.querySelectorAll('.toc-link');
    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
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
                        // Scroll TOC container to bring active link into view
                        const tocParent = link.closest('.sidebar-toc');
                        if (tocParent) {
                            const linkTop = link.offsetTop;
                            tocParent.scrollTop = linkTop - 100;
                        }
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

function initMobileSidebar() {
    const toggleBtn = document.getElementById('mobile-toc-toggle');
    const sidebar = document.getElementById('sidebar-toc');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeBtn = document.getElementById('sidebar-close');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            if (backdrop) backdrop.classList.add('active');
        });
    }

    const closeSidebar = () => {
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);
}

/* --------------------------------------------------------------------------
   6. READING MODE TOGGLE (DISTRACTION-FREE VIEW)
   -------------------------------------------------------------------------- */
function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    const isReadingMode = document.body.classList.contains('reading-mode');
    const btn = document.getElementById('reading-mode-btn');
    if (btn) {
        btn.classList.toggle('active', isReadingMode);
    }
}

/* --------------------------------------------------------------------------
   7. BACK TO TOP FLOATING BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --------------------------------------------------------------------------
   8. OFFICIAL SYLLABUS LIGHTBOX / MODAL ENGINE (REAL PNG IMAGES)
   -------------------------------------------------------------------------- */
let currentSyllabusSubject = 'eco-elective-1';
let currentZoomLevel = 1;

const subjectTitles = {
    'eco-elective-1': 'Economics Elective 1 — Policy',
    'eco-elective-2': 'Economics Elective 2 — Money',
    'eco-elective-3': 'Economics Elective 3 — Environment',
    'eco-skill': 'Economics Skill Course',
    'geo-theory': 'Geography Theory',
    'geo-practical': 'Geography Practical',
    'socio-additional': 'Sociology Additional',
    'vac-ctmv': 'VAC — CTMV'
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

    const overlay = document.getElementById('syllabus-modal-overlay');
    const selectEl = document.getElementById('syllabus-subject-select');
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

function closeSyllabusModal() {
    const overlay = document.getElementById('syllabus-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function renderSyllabusPage() {
    const imgWrapper = document.getElementById('syllabus-image-wrapper');
    if (!imgWrapper) return;

    imgWrapper.style.transform = `scale(${currentZoomLevel})`;

    // List of candidate paths with automatic extension detection (.png, .jpg, .jpeg) & aliases
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
                    <div class="syllabus-placeholder">
                        <i class="fa-solid fa-file-invoice"></i>
                        <h3>Official Syllabus Document</h3>
                        <p>Expected image in <code>assets/images/syllabus/</code></p>
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
    // Economics Elective 1
    { title: "Economic Growth vs Development", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u1-1", tags: "growth gdp hdi development real income" },
    { title: "HDI & Multi-dimensional Poverty Index (MPI)", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u1-4", tags: "hdi undp mpi life expectancy gni per capita" },
    { title: "NITI Aayog vs Planning Commission", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u1-5", tags: "planning commission niti aayog think tank bottom up" },
    { title: "Sustainable Development Goals (SDGs)", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u1-6", tags: "sdgs brundtland report 17 goals sustainability" },
    { title: "Capital Formation & ICOR", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u2-2", tags: "capital formation icor savings investment harrod domar" },
    { title: "Foreign Capital: FDI vs FII", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u2-4", tags: "fdi fii foreign direct investment hot money" },
    { title: "Demographic Dividend in India", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u3-2", tags: "population working age 15 64 dividend skill india" },
    { title: "Rural-Urban Migration (Push & Pull Factors)", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u3-3", tags: "migration push pull factors harris todaro" },
    { title: "Organised vs Unorganised Sector & MGNREGA", subject: "Eco Elective 1", page: "eco-elective-1-policy.html#u4-2", tags: "organised unorganised plfs mgnrega employment 100 days" },

    // Economics Elective 2
    { title: "Functions of Money & Evolution", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u1-1", tags: "money medium of exchange store of value credit" },
    { title: "Fisher's Quantity Theory of Money (MV=PT)", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u1-2", tags: "fisher quantity theory mv pt price level velocity" },
    { title: "Demand-Pull & Cost-Push Inflation", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u1-4", tags: "inflation demand pull cost push price rise" },
    { title: "Commercial Bank Credit Creation Formula", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u2-1", tags: "commercial bank credit creation primary deposit multiplier" },
    { title: "RBI Monetary Policy (Repo, CRR, SLR, OMO)", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u2-3", tags: "rbi repo rate crr slr omo monetary policy" },
    { title: "Money Supply Measures (M1, M2, M3, M4)", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u3-1", tags: "money supply m1 m2 m3 m4 broad money currency" },
    { title: "Banking Reforms, NPA & IBC 2016", subject: "Eco Elective 2", page: "eco-elective-2-money.html#u4-2", tags: "narasimham npa ibc insolvency bankruptcy upi" },

    // Economics Elective 3
    { title: "Market Failure & Externalities", subject: "Eco Elective 3", page: "eco-elective-3-enviro.html#u1-1", tags: "market failure positive negative externality social cost" },
    { title: "Coase Theorem & Property Rights", subject: "Eco Elective 3", page: "eco-elective-3-enviro.html#u1-2", tags: "coase theorem property rights transaction costs bargaining" },
    { title: "Environmental Kuznets Curve (EKC)", subject: "Eco Elective 3", page: "eco-elective-3-enviro.html#u1-4", tags: "ekc environmental kuznets curve inverted u shape pollution" },
    { title: "Pigouvian Tax & Cap-and-Trade", subject: "Eco Elective 3", page: "eco-elective-3-enviro.html#u2-2", tags: "pigouvian tax polluter pays cap and trade carbon credit" },
    { title: "Paris Climate Agreement & India's Panchamrit", subject: "Eco Elective 3", page: "eco-elective-3-enviro.html#u3-1", tags: "paris agreement cop26 panchamrit climate change renewable" },
    { title: "Environmental Movements & NGT Act 2010", subject: "Eco Elective 3", page: "eco-elective-3-enviro.html#u4-1", tags: "chipko movement narmada bachao ngt national green tribunal" },

    // Economics Skill Course
    { title: "Primary vs Secondary Data & Sampling", subject: "Eco Skill", page: "eco-skill-course.html#u1-1", tags: "primary secondary data questionnaire random sampling stratified" },
    { title: "Graphical Data Presentation (Ogive, Histogram)", subject: "Eco Skill", page: "eco-skill-course.html#u2-2", tags: "histogram ogive pie chart frequency polygon table" },
    { title: "Central Tendency (Mean, Median, Mode)", subject: "Eco Skill", page: "eco-skill-course.html#u3-1", tags: "mean median mode central tendency statistics formulas" },
    { title: "Standard Deviation & Coefficient of Variation", subject: "Eco Skill", page: "eco-skill-course.html#u3-2", tags: "standard deviation variance cv dispersion" },
    { title: "Index Numbers (Laspeyres, Paasche, Fisher)", subject: "Eco Skill", page: "eco-skill-course.html#u4-1", tags: "laspeyres paasche fisher ideal index cpi wpi" },

    // Geography Theory
    { title: "Earth's Interior Structure (Crust, Mantle, Core)", subject: "Geo Theory", page: "geo-theory.html#u1-1", tags: "earth interior sial sima nife crust mantle core seismic waves" },
    { title: "Plate Tectonics & Continental Drift", subject: "Geo Theory", page: "geo-theory.html#u1-2", tags: "plate tectonics convergent divergent transform himalayas" },
    { title: "Atmospheric Layers & Planetary Winds", subject: "Geo Theory", page: "geo-theory.html#u2-1", tags: "troposphere stratosphere trade winds westerlies easterlies" },
    { title: "Alfred Weber's Industrial Location Theory", subject: "Geo Theory", page: "geo-theory.html#u3-1", tags: "weber industrial location material index mi transport cost" },
    { title: "Indian Monsoon Mechanism & Physiography", subject: "Geo Theory", page: "geo-theory.html#u4-1", tags: "monsoon himalayas el nino la nina itcz rainfall" },

    // Geography Practical
    { title: "Geography Field Survey & Study Area Selection", subject: "Geo Practical", page: "geo-practical.html#u1-1", tags: "field visit survey sampling area selection questionnaire" },
    { title: "KoboToolbox, ODK & GPS Survey", subject: "Geo Practical", page: "geo-practical.html#sec-u2-kobo", tags: "kobotoolbox odk gps digital survey mapping qfield" },
    { title: "10-Day Field Tour Plan & Report Template", subject: "Geo Practical", page: "geo-practical.html#sec-tour-plan", tags: "10 day tour plan report template structure chapter format" },
    { title: "Interactive Field Report Quality Checklist", subject: "Geo Practical", page: "geo-practical.html#sec-report-checker", tags: "checklist quality report verification word count maps" },
    { title: "150+ Practical Viva Question Bank", subject: "Geo Practical", page: "geo-practical.html#sec-viva", tags: "viva questions viva voce practical exam qgis vector raster" },

    // Sociology Additional
    { title: "Auguste Comte: Law of Three Stages & Positivism", subject: "Sociology", page: "socio-additional.html#u1-1", tags: "comte three stages theological metaphysical positive positivism" },
    { title: "Émile Durkheim: Social Facts & Suicide Theory", subject: "Sociology", page: "socio-additional.html#u1-2", tags: "durkheim social facts suicide egoistic altruistic anomic" },
    { title: "Karl Marx: Historical Materialism & Class Struggle", subject: "Sociology", page: "socio-additional.html#u1-3", tags: "karl marx class struggle bourgeoisie proletariat alienation" },
    { title: "Max Weber: Social Action & Bureaucracy", subject: "Sociology", page: "socio-additional.html#u1-4", tags: "max weber social action ideal type bureaucracy" },
    { title: "M.N. Srinivas: Sanskritization & Indian Caste System", subject: "Sociology", page: "socio-additional.html#u2-1", tags: "sanskritization mn srinivas caste system varna jati ghurye" },

    // VAC CTMV
    { title: "Culture vs Civilization & Indian Heritage", subject: "VAC CTMV", page: "vac-ctmv.html#u1-1", tags: "culture civilization sanskriti sabhyata unity in diversity" },
    { title: "Universal Moral Values (Satya, Ahimsa, Karuna)", subject: "VAC CTMV", page: "vac-ctmv.html#u2-1", tags: "moral values satya ahimsa karuna dharma ethics" },
    { title: "Vasudhaiva Kutumbakam & Nishkama Karma", subject: "VAC CTMV", page: "vac-ctmv.html#u2-2", tags: "vasudhaiva kutumbakam nishkama karma bhagavad gita" },
    { title: "Constitutional Values (Preamble & Fundamental Duties)", subject: "VAC CTMV", page: "vac-ctmv.html#u3-1", tags: "preamble constitutional values article 51a fundamental duties" },
    { title: "Digital Ethics & Cyber Morality", subject: "VAC CTMV", page: "vac-ctmv.html#u4-1", tags: "digital ethics cyber morality social media privacy fake news" }
];

function initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('global-search-results');
        if (!resultsContainer) return;

        if (query.length < 2) {
            resultsContainer.innerHTML = '<li class="p-4 text-center text-subtle text-sm">Kam se kam 2 characters type karein search karne ke liye...</li>';
            return;
        }

        const filtered = searchDatabase.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.tags.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<li class="p-4 text-center text-subtle text-sm">Aapke search query ke liye koi topic nahi mila. Dusra keyword try karein.</li>';
            return;
        }

        resultsContainer.innerHTML = filtered.map(item => `
            <li>
                <a href="./${item.page}" class="search-result-item" onclick="closeSearchModal()">
                    <span class="title">${item.title}</span>
                    <span class="meta"><i class="fa-solid fa-folder mr-1"></i> ${item.subject}</span>
                </a>
            </li>
        `).join('');
    });
}

function openSearchModal() {
    const overlay = document.getElementById('search-modal-overlay');
    const input = document.getElementById('global-search-input');
    if (overlay) {
        overlay.classList.add('active');
        if (input) input.focus();
    }
}

function closeSearchModal() {
    const overlay = document.getElementById('search-modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

/* --------------------------------------------------------------------------
   10. INTERACTIVE WIDGETS (FLASHCARDS, MCQS, CHECKLIST)
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
