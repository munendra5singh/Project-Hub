/* electrical-engine.js — extracted verbatim from electrical.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            let historyData = [];

            /* THEME HANDLING */
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

            /* SYNC VISUAL BANDS */
            function updateVisualResistorBands() {
                for (let i = 1; i <= 4; i++) {
                    const selectEl = document.getElementById(`band${i}`);
                    const selectedOpt = selectEl.options[selectEl.selectedIndex];
                    const hexColor = selectedOpt.getAttribute('data-color');
                    document.getElementById(`visual-band${i}`).style.background = hexColor;
                }
            }
            for(let i = 1; i <= 4; i++) {
                document.getElementById(`band${i}`).addEventListener('change', updateVisualResistorBands);
            }

            /* ENGINE CALCULATIONS */
            window.calculateOhmsLaw = function() {
                let v = parseFloat(document.getElementById('ohm-v').value);
                let i = parseFloat(document.getElementById('ohm-i').value);
                let r = parseFloat(document.getElementById('ohm-r').value);
                let title = document.getElementById('res-title');
                let body = document.getElementById('res-body');

                let resStr = "";
                let exprStr = "";

                if (!isNaN(v) && !isNaN(i) && isNaN(r)) {
                    if(i === 0) { showValidationError("Current (I) cannot be zero."); return; }
                    resStr = (v / i).toFixed(2) + " Ω";
                    exprStr = `V = ${v}V, I = ${i}A`;
                    body.innerHTML = `Calculated Resistance (R) = <span style="color:var(--accent-color);">${resStr} (Ohms)</span>`;
                } else if (!isNaN(v) && isNaN(i) && !isNaN(r)) {
                    if(r === 0) { showValidationError("Resistance (R) cannot be zero."); return; }
                    resStr = (v / r).toFixed(3) + " A";
                    exprStr = `V = ${v}V, R = ${r}Ω`;
                    body.innerHTML = `Calculated Current (I) = <span style="color:var(--accent-color);">${resStr} (Amps)</span>`;
                } else if (isNaN(v) && !isNaN(i) && !isNaN(r)) {
                    resStr = (i * r).toFixed(2) + " V";
                    exprStr = `I = ${i}A, R = ${r}Ω`;
                    body.innerHTML = `Calculated Voltage (V) = <span style="color:var(--accent-color);">${resStr} (Volts)</span>`;
                } else {
                    showValidationError("कृपया कोई भी दो इनपुट बॉक्स भरें।");
                    return;
                }
                title.innerText = "Ohm's Law Output Matrix";
                saveHistoryLog("Ohm's Law", exprStr, resStr);
            }

            window.calculateColorCode = function() {
                let b1 = document.getElementById('band1').value;
                let b2 = document.getElementById('band2').value;
                let mult = parseFloat(document.getElementById('band3').value);
                let tolerance = document.getElementById('band4').value;
                let title = document.getElementById('res-title');
                let body = document.getElementById('res-body');

                let baseValue = parseInt(b1 + b2);
                let finalResistance = baseValue * mult;
                let formattedRes = finalResistance;

                if (finalResistance >= 1000000) {
                    formattedRes = (finalResistance / 1000000).toFixed(2) + " MΩ";
                } else if (finalResistance >= 1000) {
                    formattedRes = (finalResistance / 1000).toFixed(2) + " kΩ";
                } else {
                    formattedRes = finalResistance + " Ω";
                }

                let finalOutput = `${formattedRes} ±${tolerance}%`;
                title.innerText = "Resistor Value Output";
                body.innerHTML = `कुल रेजिस्टेंस मान = <span style="color:var(--accent-color);">${finalOutput}</span>`;
                
                saveHistoryLog("Resistor Color", `Bands: ${b1}, ${b2}, Multiplier: x${mult}`, finalOutput);
            }

            function showValidationError(msg) {
                document.getElementById('res-title').innerText = "Validation / Error Status";
                document.getElementById('res-body').innerHTML = `<span style="color:#ef4444; font-size:0.9rem;">${msg}</span>`;
            }

            /* HISTORY LOG ARCHITECTURE STORAGE */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('electrical_station_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No calculations saved yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `
                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <span class="hist-type">${item.type}</span>
                            <span class="hist-expr">${item.expr}</span>
                        </div>
                        <span class="hist-res" style="color:var(--accent-color);">${item.res}</span>
                    `;
                    el.addEventListener('click', () => {
                        // Reuse functionality framework click handles
                        if (item.type === "Ohm's Law") {
                            // Extract values safely back to forms
                            const parts = item.expr.split(', ');
                            document.getElementById('ohm-v').value = parts[0] ? parseFloat(parts[0].replace(/[^\d\.]/g, '')) : '';
                            document.getElementById('ohm-i').value = parts[1] ? parseFloat(parts[1].replace(/[^\d\.]/g, '')) : '';
                            document.getElementById('ohm-r').value = '';
                        }
                        historyPanel.classList.remove('open');
                        showToast("Loaded entry frame logs!");
                    });
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('electrical_station_history'); renderHistoryLogView(); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); updateVisualResistorBands(); try { historyData = JSON.parse(localStorage.getItem('electrical_station_history')) || []; } catch(e){} renderHistoryLogView();
        });
