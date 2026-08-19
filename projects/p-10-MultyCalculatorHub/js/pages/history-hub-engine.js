/* history-hub-engine.js — extracted verbatim from history-hub.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const logsWrapper = document.getElementById('logsWrapper');
            const toast = document.getElementById('toast');

            /* REAL-TIME THEME CONTROL CONFIGS */
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

            /* RENDER LOGS ENGINE */
            window.renderLogs = function() {
                const logs = JSON.parse(localStorage.getItem('global_calculation_logs')) || [];
                if(logs.length === 0) {
                    logsWrapper.innerHTML = `
                        <div class="empty-state">
                            <i class="fa-regular fa-folder-open" style="font-size:2.2rem; color: var(--accent-color); margin-bottom:4px;"></i>
                            No historical calculations recorded across dashboard sessions.
                        </div>`;
                    return;
                }
                
                logsWrapper.innerHTML = logs.map(log => `
                    <div class="log-item">
                        <div class="log-meta">
                            <span class="log-module-badge"><i class="fa-solid fa-cube"></i> ${log.module}</span>
                            <span>${new Date(log.timestamp).toLocaleTimeString()} — ${new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div class="log-data"><strong>Input Parameters:</strong> <span style="color: var(--text-secondary); font-weight:600;">${log.input}</span></div>
                        <div class="log-data"><strong>Output Evaluation:</strong> <span class="log-output-highlight">${log.output}</span></div>
                    </div>
                `).join('');
            }

            window.clearLogs = function() {
                if(confirm("Are you sure you want to hard reset all platform calculation histories permanently?")) {
                    localStorage.removeItem('global_calculation_logs');
                    renderLogs();
                    showToast("Logs Flushed Successfully");
                }
            }

            function showToast(msg) { 
                toast.textContent = msg; 
                toast.classList.add('show'); 
                setTimeout(() => toast.classList.remove('show'), 2000); 
            }

            initTheme(); renderLogs();
        });
