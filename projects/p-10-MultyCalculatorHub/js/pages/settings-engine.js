/* settings-engine.js — extracted verbatim from settings.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const sysPrecision = document.getElementById('sysPrecision');
            const sysHistoryMode = document.getElementById('sysHistoryMode');
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

            /* READ AND SAVE MANAGEMENT STRAPS */
            function saveConfig(key, val) {
                let configs = JSON.parse(localStorage.getItem('system_platform_configs')) || {};
                configs[key] = val;
                localStorage.setItem('system_platform_configs', JSON.stringify(configs));
                showToast("Configurations Synchronized");
            }

            function loadConfigs() {
                let configs = JSON.parse(localStorage.getItem('system_platform_configs')) || { precision: 2, logState: "enabled" };
                sysPrecision.value = configs.precision || 2;
                sysHistoryMode.value = configs.logState || "enabled";
            }

            sysPrecision.addEventListener('change', (e) => saveConfig('precision', e.target.value));
            sysHistoryMode.addEventListener('change', (e) => saveConfig('logState', e.target.value));

            window.triggerFactoryReset = function() {
                if(confirm("CRITICAL WARNING: This action will completely purge all dashboard databases, system metrics, and operational themes. Proceed?")) {
                    localStorage.clear();
                    showToast("Platform memory flushed successfully.");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000);
                }
            }

            function showToast(msg) { 
                toast.textContent = msg; 
                toast.classList.add('show'); 
                setTimeout(() => toast.classList.remove('show'), 2000); 
            }

            initTheme(); loadConfigs();
        });
