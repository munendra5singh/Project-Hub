/**
 * ==========================================================================
 * ExcelSuperGuru - Core Application Bootstrapper & State Coordinator
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    ExcelSuperGuruApp.init();
});

const ExcelSuperGuruApp = (() => {
    // Application State Matrix
    const state = {
        theme: 'light',
        currentRoute: window.location.pathname,
        isSandboxInitialized: false
    };

    // DOM Element Reference Cache
    const ui = {
        themeToggleBtn: document.getElementById('themeToggle'),
        body: document.body,
        navLinks: document.querySelectorAll('.nav-link')
    };

    /**
     * Initializes global theme orientation checking localStorage values
     * or looking at fallback system preferences.
     */
    const initThemeEngine = () => {
        const savedTheme = localStorage.getItem('esg_theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setTheme('dark');
        } else {
            setTheme('light');
        }

        if (ui.themeToggleBtn) {
            ui.themeToggleBtn.addEventListener('click', handleThemeToggle);
        }
    };

    /**
     * Handles explicit dark/light mutations across application bindings
     * @param {string} targetTheme - 'light' | 'dark'
     */
    const setTheme = (targetTheme) => {
        state.theme = targetTheme;
        if (targetTheme === 'dark') {
            ui.body.classList.add('dark-mode');
            if (ui.themeToggleBtn) {
                ui.themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
            }
        } else {
            ui.body.classList.remove('dark-mode');
            if (ui.themeToggleBtn) {
                ui.themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }
        localStorage.setItem('esg_theme', targetTheme);
    };

    /**
     * Context callback invoked on theme button interaction event loop
     */
    const handleThemeToggle = () => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    };

    /**
     * Evaluates route variations to highlight specific navigational states
     */
    const synchroniseNavigationStates = () => {
        const currentPath = window.location.pathname;
        ui.navLinks.forEach(link => {
            const hrefAttr = link.getAttribute('href');
            if (hrefAttr && currentPath.endsWith(hrefAttr)) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    };

    /**
     * Global Exception Handling Watcher for local monitoring
     */
    const registerGlobalErrorCatchers = () => {
        window.addEventListener('error', (event) => {
            console.error('ExcelSuperGuru System Fault Logged:', event.error);
        });
    };

    return {
        init: () => {
            initThemeEngine();
            synchroniseNavigationStates();
            registerGlobalErrorCatchers();
            console.log('ExcelSuperGuru Shell Layer Successfully Executed.');
        },
        getState: () => ({ ...state })
    };
})();

// ==========================================================================
// Smart Navbar Hide/Show on Scroll Logic
// ==========================================================================

const header = document.querySelector(".site-header");
let lastScrollY = window.scrollY;
const scrollThreshold = 10; // न्यूनतम पिक्सेल जो स्क्रॉल करने पर इफ़ेक्ट ट्रिगर होगा

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // अगर यूजर पेज के बिल्कुल टॉप पर है, तो डिफ़ॉल्ट स्टेट रखें
    if (currentScrollY <= 0) {
        header.classList.remove("scroll-down");
        header.classList.remove("scroll-up");
        return;
    }

    // स्क्रॉल का अंतर चेक करें (ताकि बहुत छोटे शेक पर हेडर गायब न हो)
    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) {
        return;
    }

    // स्क्रॉल डाउन और स्क्रॉल अप का लॉजिक
    if (currentScrollY > lastScrollY && !header.classList.contains("scroll-down")) {
        // नीचे स्क्रॉल करने पर छुपाएं
        header.classList.remove("scroll-up");
        header.classList.add("scroll-down");
    } else if (currentScrollY < lastScrollY && header.classList.contains("scroll-down")) {
        // थोड़ा सा भी ऊपर स्क्रॉल करने पर वापस दिखाएं
        header.classList.remove("scroll-down");
        header.classList.add("scroll-up");
    }

    // करंट पोजीशन को सेव करें
    lastScrollY = currentScrollY;
});