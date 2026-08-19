/* favorites-engine.js — extracted verbatim from favorites.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const favoritesList = document.getElementById('favoritesList');
            const toast = document.getElementById('toast');

            /* REAL-TIME THEME CONTROLENGINE */
            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                applyTheme(isDarkMode ? 'dark' : 'light');
            }
            function applyTheme(theme) {
                if (theme === 'dark') document.body.classList.add("dark-mode");
                else document.body.classList.remove("dark-mode");
            }
            themeToggle.addEventListener('click', () => {
                const isDarkActive = document.body.classList.contains("dark-mode");
                const targetState = !isDarkActive ? 'enabled' : 'disabled';
                localStorage.setItem("globalDarkMode", targetState);
                applyTheme(!isDarkActive ? 'dark' : 'light');
            });
            window.addEventListener('storage', (e) => { 
                if (e.key === 'globalDarkMode') applyTheme(e.newValue === 'enabled' ? 'dark' : 'light'); 
            });

            // Hardcoded layout catalog sync logs matrix bounds
            const TOOL_DIRECTORY = [
                { id: "std", name: "Standard Calculator", path: "standard.html", icon: "🧮" },
                { id: "sci", name: "Scientific Calculator", path: "scientific.html", icon: "🧪" },
                { id: "prg", name: "Programmer Calculator", path: "programmer.html", icon: "💻" },
                { id: "gst", name: "GST Calculator", path: "gstcal.html", icon: "🧾" },
                { id: "emi", name: "EMI Amortization Solver", path: "emi.html", icon: "💰" }
            ];

            window.renderFavs = function() {
                let activeIds = JSON.parse(localStorage.getItem('pinned_favorite_tools')) || ["std", "gst"];
                const filtered = TOOL_DIRECTORY.filter(t => activeIds.includes(t.id));
                
                if(filtered.length === 0) {
                    favoritesList.innerHTML = `
                        <div class="empty">
                            <i class="fa-solid fa-folder-minus" style="font-size:2.2rem; color: var(--accent-color); margin-bottom:4px;"></i>
                            No pinned interface links in execution state vault yet.
                        </div>`;
                    return;
                }

                favoritesList.innerHTML = filtered.map(t => `
                    <div class="fav-item">
                        <a href="${t.path}" class="fav-meta">
                            <span class="fav-icon-node">${t.icon}</span>
                            <span>${t.name}</span>
                        </a>
                        <button class="remove-fav-btn" onclick="removeFav('${t.id}')" title="Remove from Pinned Favorites"><i class="fa-solid fa-circle-xmark"></i></button>
                    </div>
                `).join('');
            }

            window.removeFav = function(id) {
                let activeIds = JSON.parse(localStorage.getItem('pinned_favorite_tools')) || ["std", "gst"];
                activeIds = activeIds.filter(item => item !== id);
                localStorage.setItem('pinned_favorite_tools', JSON.stringify(activeIds));
                renderFavs();
                showToast("Link Purged Successfully");
            }

            function showToast(msg) { 
                toast.textContent = msg; 
                toast.classList.add('show'); 
                setTimeout(() => toast.classList.remove('show'), 2000); 
            }

            initTheme(); renderFavs();
        });
