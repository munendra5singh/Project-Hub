/* date-engine.js — extracted verbatim from date.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            let historyData = [];

            /* CORE SPEC THEME SYNCS */
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
            window.addEventListener('storage', (e) => { if (e.key === 'globalDarkMode') applyTheme(e.newValue === 'enabled' ? 'dark' : 'light'); });

            /* TOGGLE DIRECTION LABEL TEXT */
            window.toggleDirectionText = function() {
                const toggle = document.getElementById("directionToggle");
                const text = document.getElementById("directionStatusText");
                text.innerHTML = toggle.checked ? "⬅ Go Backward (भूतकाल में जाएँ)" : "➡ Go Forward (भविष्य में जाएँ)";
            }

            /* ENGINE DATE ARITHMETICS */
            window.calculateDate = function() {
                const dateInput = document.getElementById("inputDate").value;
                const days = parseInt(document.getElementById("days").value);
                const isPast = document.getElementById("directionToggle").checked;
                const resultDiv = document.getElementById("result");
                const resultBox = document.getElementById("result-box");

                if (!dateInput || isNaN(days)) {
                    resultBox.style.display = "flex";
                    resultDiv.innerHTML = "<span style='color:var(--danger);'>❗ Please enter a valid date and number of days.</span>";
                    return;
                }

                const date = new Date(dateInput);
                const offsetDays = isPast ? -days : days;
                date.setDate(date.getDate() + offsetDays);

                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();

                const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const dayName = weekdays[date.getDay()];
                const finalDate = `${day}-${month}-${year}`;

                resultBox.style.display = "flex";
                resultDiv.innerHTML = `🔮 <strong>Calculated Date:</strong> <span style="color:var(--accent-color); font-size:1.15rem;"><strong>${finalDate}</strong></span>\n🗓️ <strong>Day of the Week:</strong> <strong>${dayName}</strong>`;

                saveHistoryLog("Date Finder", `${days} Days ${isPast ? 'Back' : 'Fwd'}`, `${finalDate}`);
            }

            window.clearFields = function() {
                document.getElementById("dateForm").reset();
                toggleDirectionText(); 
                const resultBox = document.getElementById("result-box");
                resultBox.style.display = "none";
            }

            /* HISTORY MANAGEMENT RETENTION LOGS */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('date_calculator_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No calculations saved yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div><span class="hist-type">${item.type}</span><div class="hist-expr">${item.expr}</div></div><span class="hist-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>`;
                    el.addEventListener('click', () => {
                        const count = parseInt(item.expr.match(/\d+/)[0]);
                        document.getElementById('days').value = count;
                        document.getElementById('directionToggle').checked = item.expr.includes('Back');
                        toggleDirectionText();
                        // Base date falls back smoothly to today's stamp on frame logs re-clicks if empty
                        if(!document.getElementById('inputDate').value) {
                            document.getElementById('inputDate').value = new Date().toISOString().split('T')[0];
                        }
                        calculateDate();
                        historyPanel.classList.remove('open');
                        showToast("Loaded entry frame parameters!");
                    });
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('date_calculator_history'); renderHistoryLogView(); showToast("Logs Flushed Successfully"); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); try { historyData = JSON.parse(localStorage.getItem('date_calculator_history')) || []; } catch(e){} renderHistoryLogView();
        });
