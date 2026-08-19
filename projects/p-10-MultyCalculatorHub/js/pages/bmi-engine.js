/* bmi-engine.js — extracted verbatim from bmi.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            let isImperialMode = false;
            let computedCache = null;
            let historyData = [];

            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            /* THEME HUB MATRIX BINDINGS */
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

            /* IMPERIAL VS METRICS CONFIGURATIONS LINK TOGGLES */
            window.toggleHeightMetrics = function(switchToImperial) {
                isImperialMode = switchToImperial;
                const cmBlock = document.getElementById("blockHeightCm");
                const ftBlock = document.getElementById("blockHeightFt");
                const cmInput = document.getElementById("inputHeightCm");
                const ftInput = document.getElementById("inputHeightFt");
                const inInput = document.getElementById("inputHeightIn");

                if (isImperialMode) {
                    cmBlock.style.display = "none"; ftBlock.style.display = "block";
                    cmInput.removeAttribute("required"); ftInput.setAttribute("required", "true"); inInput.setAttribute("required", "true");
                } else {
                    cmBlock.style.display = "block"; ftBlock.style.display = "none";
                    cmInput.setAttribute("required", "true"); ftInput.removeAttribute("required"); inInput.removeAttribute("required");
                }
            }

            /* LOGICAL BMI EVALUATION ENGINE */
            window.computeBmiEngine = function() {
                const weight = parseFloat(document.getElementById("inputWeight").value);
                const gender = document.querySelector('input[name="gender"]:checked').value;
                const age = document.getElementById("inputAge").value ? parseInt(document.getElementById("inputAge").value) : "N/A";
                let heightCm = 0;

                if (isImperialMode) {
                    const ft = parseFloat(document.getElementById("inputHeightFt").value) || 0;
                    const inch = parseFloat(document.getElementById("inputHeightIn").value) || 0;
                    heightCm = ((ft * 12) + inch) * 2.54;
                } else {
                    heightCm = parseFloat(document.getElementById("inputHeightCm").value);
                }

                if (!weight || !heightCm || heightCm <= 0) return;

                const heightMeters = heightCm / 100;
                const bmi = weight / (heightMeters * heightMeters);
                
                const minHealthyWeight = 18.5 * (heightMeters * heightMeters);
                const maxHealthyWeight = 24.9 * (heightMeters * heightMeters);

                let category = "", elementClass = "", risk = "", guidance = "";

                if (bmi < 18.5) {
                    category = "Underweight"; elementClass = "state-underweight"; risk = "Nutritional Deficiency";
                    guidance = "Focus on a nutrient-rich diet with lean proteins and healthy fats.";
                } else if (bmi >= 18.5 && bmi <= 24.9) {
                    category = "Normal Weight"; elementClass = "state-normal"; risk = "Optimal Minimal Risk Profile";
                    guidance = "Excellent! Maintain your lifestyle with a balanced diet and regular activity.";
                } else if (bmi >= 25 && bmi <= 29.9) {
                    category = "Overweight"; elementClass = "state-overweight"; risk = "Moderate Cardiovascular Risk";
                    guidance = "Consider minor dietary portions reduction and moderate exercises.";
                } else {
                    category = "Obese"; elementClass = "state-obese"; risk = "High Hypertension Profile";
                    guidance = "Prioritize consulting a medical practitioner for metabolic intervention structures.";
                }

                const timestamp = new Date().toLocaleDateString([], {month: 'short', day: 'numeric'}) + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                computedCache = {
                    bmi: bmi.toFixed(1), category, elementClass, weight: weight + " KG",
                    height: heightCm.toFixed(0) + " CM", range: `${minHealthyWeight.toFixed(1)} - ${maxHealthyWeight.toFixed(1)} KG`,
                    risk, guidance, timestamp, gender, age
                };

                renderDashboardOutput();
                saveHistoryLog("BMI Score", `${weight}kg @ ${heightCm.toFixed(0)}cm`, `${bmi.toFixed(1)}`);
            }

            function renderDashboardOutput() {
                if (!computedCache) return;
                const data = computedCache;

                document.getElementById("lblBmiScore").innerText = data.bmi;
                const catLabel = document.getElementById("lblBmiCategory");
                catLabel.innerText = data.category; catLabel.className = data.elementClass;

                document.getElementById("lblHealthyRange").innerText = data.range;
                document.getElementById("lblRiskIndicator").innerText = data.risk;
                document.getElementById("lblGuidanceText").innerText = data.guidance;
                document.getElementById("timestampStamp").innerText = data.timestamp;

                let clampedBmi = Math.max(15, Math.min(35, parseFloat(data.bmi)));
                let percentage = (clampedBmi - 15) / (35 - 15);
                let targetDegrees = -90 + (percentage * 180);
                document.getElementById("gaugeNeedle").style.transform = `translateX(-50%) rotate(${targetDegrees}deg)`;
            }

            /* REUSE CORE LOG HISTORY MODULE HOOKS */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('bmi_suite_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No metric calculations tracked yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div><span class="hist-type">${item.type}</span><div class="hist-expr">${item.expr}</div></div><span class="hist-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>`;
                    el.addEventListener('click', () => {
                        const wtValue = parseFloat(item.expr.split('kg')[0]);
                        document.getElementById('inputWeight').value = wtValue;
                        historyPanel.classList.remove('open'); showToast("Restored context logs frame weights!");
                    });
                    historyList.appendChild(el);
                });
            }

            window.copyBmiReportToClipboard = function() {
                if (!computedCache) { showToast("Execute report creation first."); return; }
                const d = computedCache;
                const textBlock = `📋 BMI DIAGNOSTICS REPORT SUMMARY\n--------------------------------------\nTimestamp: ${d.timestamp}\nHeight: ${d.height} | Weight: ${d.weight}\nComputed Score: ${d.bmi} [${d.category}]\nHealthy Variance Range: ${d.range}\nRisk Profile: ${d.risk}`;
                navigator.clipboard.writeText(textBlock).then(() => showToast("Copied to Clipboard"));
            }

            window.resetEngineConsole = function() {
                document.getElementById("bmiForm").reset(); toggleHeightMetrics(false);
                document.getElementById("lblBmiScore").innerText = "0.0";
                const catLabel = document.getElementById("lblBmiCategory"); catLabel.innerText = "Enter Data"; catLabel.className = "state-normal";
                document.getElementById("lblHealthyRange").innerText = "0.0 - 0.0 KG"; document.getElementById("lblRiskIndicator").innerText = "---";
                document.getElementById("lblGuidanceText").innerText = "Please input parameters to execute diagnostic report overview.";
                document.getElementById("gaugeNeedle").style.transform = `translateX(-50%) rotate(-90deg)`;
                document.getElementById("timestampStamp").innerText = "---"; computedCache = null; showToast("Utilities Cleared perfectly");
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('bmi_suite_history'); renderHistoryLogView(); showToast("Logs Flushed Successfully"); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); try { historyData = JSON.parse(localStorage.getItem('bmi_suite_history')) || []; } catch(e){} renderHistoryLogView(); toggleHeightMetrics(false);
        });
