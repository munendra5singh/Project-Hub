/**
 * ==========================================================================
 * ExcelSuperGuru - Knowledge Hub Operational Management Engine Scripts
 * ==========================================================================
 * Modular engineering processing handlers governing runtime data tracking layers,
 * storage commits, view filtering, and viewport monitoring indicators.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Structural App Module State Registration Tracking Matrix
    const stateRegistry = {
        bookmarks: JSON.parse(localStorage.getItem("esg_hub_bookmarks")) || [],
        recentViews: JSON.parse(localStorage.getItem("esg_hub_recent_views")) || [],
        readingTimeMinutes: 0
    };

    // Global Component DOM Selectors Map
    const UI = {
        chapters: document.querySelectorAll(".documentation-chapter-card"),
        tocContainer: document.querySelector("#tableOfContentsContainer .toc-root-list"),
        searchInput: document.getElementById("hubSearchInput"),
        suggestionsBox: document.getElementById("searchSuggestionsBox"),
        progressBar: document.getElementById("scrollProgressBar"),
        backToTopBtn: document.getElementById("layoutBackToTopAnchorBtn"),
        themeToggleBtn: document.getElementById("themeToggleBtn"),
        printBtn: document.getElementById("printArticleBtn"),
        bookmarkButtons: document.querySelectorAll(".bookmark-action-toggle-btn"),
        bookmarksList: document.getElementById("bookmarkedNodesOutputList"),
        recentViewsList: document.getElementById("recentViewsOutputList"),
        readingTimeCounter: document.getElementById("docReadingTimeCounter"),
        progressPercentage: document.getElementById("docProgressPercentageCounter"),
        faqHeaders: document.querySelectorAll(".faq-trigger-header-btn")
    };

    /* ==========================================================================
       1. Dynamic Table of Contents (TOC Engine Node Initialization)
       ========================================================================== */
    function buildDynamicTableOfContents() {
        if (!UI.tocContainer || UI.chapters.length === 0) return;
        UI.tocContainer.innerHTML = '';

        UI.chapters.forEach(chapter => {
            const id = chapter.id;
            const headingText = chapter.querySelector("h2").textContent;
            
            // Clean section index sequence title tags
            const cleanTitle = headingText.replace(/^\d+\.\s*/, "");

            const liNode = document.createElement("li");
            const anchor = document.createElement("a");
            anchor.href = `#${id}`;
            anchor.className = "toc-node-link";
            anchor.textContent = cleanTitle;
            anchor.setAttribute("data-target-id", id);

            liNode.appendChild(anchor);
            UI.tocContainer.appendChild(liNode);
        });
    }

    /* ==========================================================================
       2. Real-Time Viewport Monitoring (High Performance ScrollSpy & Progress)
       ========================================================================== */
    function processViewportScrollingMetrics() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // A. Update scroll position percentage bar matrix indicator
        if (UI.progressBar) UI.progressBar.style.width = `${scrollPercent}%`;
        if (UI.progressPercentage) UI.progressPercentage.textContent = `${Math.round(scrollPercent)}%`;

        // B. Handle floating Back to Top button visibility conditions
        if (UI.backToTopBtn) {
            if (scrollTop > 400) {
                UI.backToTopBtn.classList.add("reveal-btn");
            } else {
                UI.backToTopBtn.classList.remove("reveal-btn");
            }
        }

        // C. High velocity intercept tracking optimized ScrollSpy loop logic
        let currentActiveSectionId = "";
        UI.chapters.forEach(chapter => {
            const sectionTop = chapter.offsetTop - 120;
            if (scrollTop >= sectionTop) {
                currentActiveSectionId = chapter.id;
            }
        });

        if (currentActiveSectionId) {
            const allLinks = document.querySelectorAll(".toc-node-link");
            allLinks.forEach(link => {
                if (link.getAttribute("data-target-id") === currentActiveSectionId) {
                    link.classList.add("active-scrollspy-node");
                    logSectionViewHistory(currentActiveSectionId);
                } else {
                    link.classList.remove("active-scrollspy-node");
                }
            });
        }
    }

    /* ==========================================================================
       3. Algorithmic Query Index Processing System (Live Filter Engine Module)
       ========================================================================== */
    function handleLiveQueryFilteringSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        if (query === "") {
            UI.suggestionsBox.style.display = "none";
            UI.chapters.forEach(c => c.style.display = "block");
            return;
        }

        UI.suggestionsBox.innerHTML = '';
        let matchCount = 0;

        UI.chapters.forEach(chapter => {
            const chapterText = chapter.textContent.toLowerCase();
            const headingText = chapter.querySelector("h2").textContent;
            const chapterId = chapter.id;

            if (chapterText.includes(query)) {
                chapter.style.display = "block";
                matchCount++;

                // Build suggestion card link targets dynamically
                if (matchCount <= 5) {
                    const suggestionRow = document.createElement("div");
                    suggestionRow.className = "suggestion-node-item";
                    suggestionRow.textContent = headingText;
                    suggestionRow.addEventListener("click", () => {
                        document.getElementById(chapterId).scrollIntoView({ behavior: "smooth" });
                        UI.suggestionsBox.style.display = "none";
                        UI.searchInput.value = headingText;
                    });
                    UI.suggestionsBox.appendChild(suggestionRow);
                }
            } else {
                chapter.style.display = "none";
            }
        });

        UI.suggestionsBox.style.display = matchCount > 0 ? "block" : "none";
    }

    /* ==========================================================================
       4. LocalStorage Framework Mappings (Bookmarks and History Management Tracking System)
       ========================================================================== */
    function initUserPersistenceManagementMatrix() {
        // Render current bookmark states onto active buttons on data paint load execution
        UI.bookmarkButtons.forEach(btn => {
            const secId = btn.getAttribute("data-sec-id");
            if (stateRegistry.bookmarks.includes(secId)) {
                btn.classList.add("node-bookmarked");
                btn.textContent = "Bookmarked";
            }

            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleContentNodeBookmark(secId, btn);
            });
        });

        renderBookmarksSidebarOutput();
        renderHistorySidebarOutput();
        calculateEstimatedReadingDuration();
    }

    function toggleContentNodeBookmark(sectionId, elementButton) {
        const index = stateRegistry.bookmarks.indexOf(sectionId);
        if (index > -1) {
            stateRegistry.bookmarks.splice(index, 1);
            elementButton.classList.remove("node-bookmarked");
            elementButton.textContent = "Bookmark Node";
        } else {
            stateRegistry.bookmarks.push(sectionId);
            elementButton.classList.add("node-bookmarked");
            elementButton.textContent = "Bookmarked";
        }
        localStorage.setItem("esg_hub_bookmarks", JSON.stringify(stateRegistry.bookmarks));
        renderBookmarksSidebarOutput();
    }

    function renderBookmarksSidebarOutput() {
        if (!UI.bookmarksList) return;
        if (stateRegistry.bookmarks.length === 0) {
            UI.bookmarksList.innerHTML = '<li class="empty-state-notice">No sections bookmarked yet.</li>';
            return;
        }

        UI.bookmarksList.innerHTML = '';
        stateRegistry.bookmarks.forEach(id => {
            const targetCard = document.getElementById(id);
            if (targetCard) {
                const text = targetCard.querySelector("h2").textContent;
                const li = document.createElement("li");
                li.innerHTML = `<a href="#${id}" style="color:inherit; text-decoration:none;">${text}</a>`;
                UI.bookmarksList.appendChild(li);
            }
        });
    }

    function logSectionViewHistory(sectionId) {
        if (stateRegistry.recentViews[0] === sectionId) return; // Ignore duplicate calls
        
        stateRegistry.recentViews = stateRegistry.recentViews.filter(id => id !== sectionId);
        stateRegistry.recentViews.unshift(sectionId);
        
        if (stateRegistry.recentViews.length > 5) stateRegistry.recentViews.pop(); // Capacity limit enforcement
        
        localStorage.setItem("esg_hub_recent_views", JSON.stringify(stateRegistry.recentViews));
        renderHistorySidebarOutput();
    }

    function renderHistorySidebarOutput() {
        if (!UI.recentViewsList) return;
        if (stateRegistry.recentViews.length === 0) {
            UI.recentViewsList.innerHTML = '<li class="empty-state-notice">No tracking logs recorded.</li>';
            return;
        }

        UI.recentViewsList.innerHTML = '';
        stateRegistry.recentViews.forEach(id => {
            const targetCard = document.getElementById(id);
            if (targetCard) {
                const text = targetCard.querySelector("h2").textContent;
                const li = document.createElement("li");
                li.innerHTML = `<a href="#${id}" style="color:inherit; text-decoration:none;">${text}</a>`;
                UI.recentViewsList.appendChild(li);
            }
        });
    }

    function calculateEstimatedReadingDuration() {
        let entireWordsCount = 0;
        UI.chapters.forEach(c => { entireWordsCount += c.textContent.split(/\s+/).length; });
        // Enforce standard analytical execution reading indexing matrix parameter (200 words per minute average metric constants)
        stateRegistry.readingTimeMinutes = Math.ceil(entireWordsCount / 200);
        if (UI.readingTimeCounter) UI.readingTimeCounter.textContent = `~ ${stateRegistry.readingTimeMinutes} Minutes`;
    }

    /* ==========================================================================
       5. UI Utility Controllers (Theme Toggles, Print Managers, Accordions)
       ========================================================================== */
    function toggleGlobalInterfaceTheme() {
        if (document.body.classList.contains("light-theme")) {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
            localStorage.setItem("esg_hub_theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            localStorage.setItem("esg_hub_theme", "light");
        }
    }

    function initGlobalStoredThemeTrackingState() {
        const savedTheme = localStorage.getItem("esg_hub_theme");
        if (savedTheme === "dark") {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
        }
    }

    // FAQ Accordion Slider Panel Panel Toggle Handler Routine Configuration
    UI.faqHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const panel = header.nextElementSibling;
            const indicator = header.querySelector("span");
            const isTargetOpen = panel.style.display === "block";
            
            panel.style.display = isTargetOpen ? "none" : "block";
            indicator.textContent = isTargetOpen ? "+" : "−";
        });
    });

    /* ==========================================================================
       6. Global Event Handlers System Framework Triggers
       ========================================================================== */
    if (UI.themeToggleBtn) UI.themeToggleBtn.addEventListener("click", toggleGlobalInterfaceTheme);
    if (UI.printBtn) UI.printBtn.addEventListener("click", () => window.print());
    if (UI.searchInput) UI.searchInput.addEventListener("input", handleLiveQueryFilteringSearch);
    
    if (UI.backToTopBtn) {
        UI.backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Debounced performance viewport monitoring throttling mechanics optimization setup
    let scrollDebounceThreadToken;
    window.addEventListener("scroll", () => {
        if (scrollDebounceThreadToken) return;
        scrollDebounceThreadToken = setTimeout(() => {
            processViewportScrollingMetrics();
            scrollDebounceThreadToken = null;
        }, 15);
    });

    // Close floating search suggestion containers if clicking outer bounding coordinates blocks
    document.addEventListener("click", (e) => {
        if (UI.suggestionsBox && !UI.searchInput.contains(e.target) && !UI.suggestionsBox.contains(e.target)) {
            UI.suggestionsBox.style.display = "none";
        }
    });

    // Run structural components assembly pipelines on startup sequences
    initGlobalStoredThemeTrackingState();
    buildDynamicTableOfContents();
    initUserPersistenceManagementMatrix();
    processViewportScrollingMetrics();
});