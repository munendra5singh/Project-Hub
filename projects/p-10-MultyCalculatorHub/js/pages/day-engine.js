/* day-engine.js — extracted verbatim from day.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            let historyData = [];

            const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const hindiDays = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

            /* CORE SPRECTRUM THEME SYNCS */
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

            /* TOGGLE BEHAVIORS EXPLICIT */
            window.toggleDirectionText = function() {
                const toggle = document.getElementById("directionToggle");
                const text = document.getElementById("directionStatusText");
                text.innerHTML = toggle.checked ? "⬅ Backward (पीछे जाएँ)" : "➡ Forward (आगे जाएँ)";
            }

            /* ENGINE ARITHMETICS */
            window.calculateDay = function() {
                const dayIndex = parseInt(document.getElementById("startDay").value);
                const dayCount = parseInt(document.getElementById("dayCount").value);
                const isBackward = document.getElementById("directionToggle").checked;
                const resultDiv = document.getElementById("result");
                const resultBox = document.getElementById("result-box");

                if (isNaN(dayCount)) {
                    resultBox.style.display = "flex";
                    resultDiv.innerHTML = "<span style='color:var(--danger);'>❗ Please enter a valid number of days.</span>";
                    return;
                }

                const offset = isBackward ? -dayCount : dayCount;
                let finalIndex = (dayIndex + offset) % 7;
                if (finalIndex < 0) finalIndex += 7;

                const finalEnglish = englishDays[finalIndex];
                const finalHindi = hindiDays[finalIndex];
                const directionWord = isBackward ? 'before' : 'later';

                resultBox.style.display = "flex";
                resultDiv.innerHTML = `🔮 <strong>Result:</strong>\n${dayCount} days ${directionWord} will be:\n\n🗓️ <span style="color:var(--accent-color); font-size:1.25rem;"><strong>${finalEnglish} (${finalHindi})</strong></span>`;

                saveHistoryLog("Day Finder", `${dayCount} Days ${isBackward ? 'Back' : 'Fwd'}`, `${finalEnglish}`);
            }

            window.clearFields = function() {
                document.getElementById("dayForm").reset();
                toggleDirectionText(); 
                const resultBox = document.getElementById("result-box");
                resultBox.style.display = "none";
            }

            /* HISTORY CORES BINDINGS */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('day_calculator_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No metric calculations tracked yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div><span class="hist-type">${item.type}</span><div class="hist-expr">${item.expr}</div></div><span class="hist-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>`;
                    el.addEventListener('click', () => {
                        // Extract frames back safely
                        const count = parseInt(item.expr.match(/\d+/)[0]);
                        document.getElementById('dayCount').value = count;
                        document.getElementById('directionToggle').checked = item.expr.includes('Back');
                        toggleDirectionText();
                        calculateDay();
                        historyPanel.classList.remove('open');
                        showToast("Loaded entry frame parameters!");
                    });
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('day_calculator_history'); renderHistoryLogView(); showToast("Logs Flushed Successfully"); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); try { historyData = JSON.parse(localStorage.getItem('day_calculator_history')) || []; } catch(e){} renderHistoryLogView();
        });
