/* math-engine.js — extracted verbatim from math.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const matrixSizeSelect = document.getElementById('matrix-size');
            const toast = document.getElementById('toast');

            let historyData = [];

            /* THEME HANDLING MECHANISM HOOKS */
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

            /* SWITCH TAB SYSTEMS MODULES */
            window.switchTab = function(tabId) {
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                
                document.getElementById(tabId).classList.add('active');
                event.currentTarget.classList.add('active');
                clearResult();
                if(tabId === 'matrix-tab') generateMatrixGrid();
            }

            function showResult(title, text) {
                document.getElementById('res-title').innerText = title;
                document.getElementById('res-body').innerHTML = text;
            }

            function clearResult() {
                document.getElementById('res-title').innerText = "Output Result";
                document.getElementById('res-body').innerText = "इनपुट भरें और ऊपर दिए एक्शन बटन्स पर क्लिक करें।";
            }

            /* CORES ARITHMETICS */
            function parseNumbers() {
                let val = document.getElementById('num-inputs').value;
                return val.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            }

            const gcdTwo = (a, b) => b ? gcdTwo(b, a % b) : Math.abs(a);
            const lcmTwo = (a, b) => (a === 0 || b === 0) ? 0 : (Math.abs(a * b) / gcdTwo(a, b));

            window.runLCM = function() {
                let nums = parseNumbers();
                if (nums.length < 2) return showResult("Validation / Error Status", "कृपया गणना के लिए कम से कम 2 नंबर दर्ज करें।");
                let ans = nums.reduce(lcmTwo);
                let resStr = `LCM = ${ans}`;
                showResult("LCM Result Matrix", `दिए गए संख्याओं का लघुत्तम समापवर्त्य (LCM) = <span style="color:var(--accent-color);">${ans}</span>`);
                saveHistoryLog("LCM Module", nums.join(','), resStr);
            }

            window.runGCD = function() {
                let nums = parseNumbers();
                if (nums.length < 2) return showResult("Validation / Error Status", "कृपया गणना के लिए कम से कम 2 नंबर दर्ज करें।");
                let ans = nums.reduce(gcdTwo);
                let resStr = `GCD = ${ans}`;
                showResult("GCD / HCF Result Matrix", `दिए गए संख्याओं का महत्तम समापवर्तक (GCD/HCF) = <span style="color:var(--accent-color);">${ans}</span>`);
                saveHistoryLog("GCD Module", nums.join(','), resStr);
            }

            window.runPrimeFactors = function() {
                let nums = parseNumbers();
                if (nums.length === 0) return showResult("Validation / Error Status", "कृपया एक सही नंबर दर्ज करें।");
                let n = nums[0];
                if (n < 2) return showResult("Prime Factorization Output", `${n} का कोई प्राइम फैक्टर नहीं होता।`);
                
                let org = n; let factors = []; let d = 2;
                let temp = n;
                while (temp > 1) {
                    while (temp % d === 0) { factors.push(d); temp /= d; }
                    d++;
                    if (d * d > temp && temp > 1) { factors.push(temp); break; }
                }
                let resStr = factors.join(' × ');
                showResult("Prime Factorization Output", `${org} के अभाज्य गुणनखंड = <span style="color:var(--accent-color);">${resStr}</span>`);
                saveHistoryLog("Prime Factors", `Factors of ${org}`, resStr);
            }

            /* EQUATIONS TERMINALS SOLUTIONS */
            window.solveQuadratic = function() {
                let a = parseFloat(document.getElementById('quad-a').value);
                let b = parseFloat(document.getElementById('quad-b').value);
                let c = parseFloat(document.getElementById('quad-c').value);

                if (isNaN(a) || isNaN(b) || isNaN(c)) return showResult("Validation / Error Status", "कृपया a, b और c तीनों के वैल्यू भरें।");
                if (a === 0) return showResult("Validation / Error Status", "'a' का मान 0 नहीं हो सकता (यह द्विघात समीकरण नहीं रहेगा)।");

                let disc = b*b - 4*a*c;
                let r1, r2, finalOutputStr;

                if (disc > 0) {
                    r1 = ((-b + Math.sqrt(disc)) / (2*a)).toFixed(4);
                    r2 = ((-b - Math.sqrt(disc)) / (2*a)).toFixed(4);
                    finalOutputStr = `x₁ = ${r1}, x₂ = ${r2}`;
                    showResult("Quadratic Equation Roots", `मूल वास्तविक और भिन्न हैं (Real & Distinct):<br>x₁ = <span style="color:var(--accent-color);">${r1}</span><br>x₂ = <span style="color:var(--accent-color);">${r2}</span>`);
                } else if (disc === 0) {
                    r1 = (-b / (2*a)).toFixed(4);
                    finalOutputStr = `x₁ = x₂ = ${r1}`;
                    showResult("Quadratic Equation Roots", `मूल वास्तविक और समान हैं (Real & Equal):<br>x₁ = x₂ = <span style="color:var(--accent-color);">${r1}</span>`);
                } else {
                    let real = (-b / (2*a)).toFixed(4);
                    let imag = (Math.sqrt(-disc) / (2*a)).toFixed(4);
                    finalOutputStr = `Complex Roots Matrix`;
                    showResult("Quadratic Equation Roots", `मूल काल्पनिक हैं (Complex/Imaginary):<br>x₁ = <span style="color:var(--accent-color);">${real} + ${imag}i</span><br>x₂ = <span style="color:var(--accent-color);">${real} - ${imag}i</span>`);
                }
                saveHistoryLog("Quadratic", `${a}x²+(${b})x+(${c})=0`, finalOutputStr);
            }

            /* DYNAMICS MATRIX LAB RUNDOWN CLOSURES */
            window.generateMatrixGrid = function() {
                let size = parseInt(matrixSizeSelect.value);
                let container = document.getElementById('matrix-a-grid');
                if(!container) return;
                container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
                container.innerHTML = '';

                for (let i = 0; i < size * size; i++) {
                    let input = document.createElement('input');
                    input.type = 'number'; input.className = 'matrix-input';
                    input.value = Math.floor(Math.random() * 9) + 1;
                    input.id = `m-a-${i}`;
                    container.appendChild(input);
                }
            }
            matrixSizeSelect.addEventListener('change', generateMatrixGrid);

            window.calculateDeterminant = function() {
                let size = parseInt(matrixSizeSelect.value);
                let m = [];
                for(let i=0; i<size*size; i++) {
                    let val = parseFloat(document.getElementById(`m-a-${i}`).value);
                    if(isNaN(val)) return showResult("Validation / Error Status", "कृपया मैट्रिक्स के सभी सेल्स को सही नंबर से भरें।");
                    m.push(val);
                }

                let det = 0;
                if (size === 2) { det = m[0]*m[3] - m[1]*m[2]; } 
                else if (size === 3) {
                    det = m[0]*(m[4]*m[8] - m[5]*m[7]) - m[1]*(m[3]*m[8] - m[5]*m[6]) + m[2]*(m[3]*m[7] - m[4]*m[6]);
                }
                showResult("Matrix Determinant Result Matrix", `इस मैट्रिक्स का Determinant |A| = <span style="color:var(--accent-color);">${det}</span>`);
                saveHistoryLog(`${size}x${size} Matrix`, `Det array computation parameters`, `|A| = ${det}`);
            }

            /* PERSISTENCE HISTORY STACKS HOOKS */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, timestamp: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('math_suite_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No calculations logs captured.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `
                        <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
                            <span class="history-item-meta">${item.type}</span>
                            <span class="history-item-expr">${item.expr}</span>
                        </div>
                        <span class="history-item-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>
                    `;
                    el.addEventListener('click', () => {
                        if (item.type === "Numbers Engine" || item.type === "LCM Module" || item.type === "GCD Module") {
                            switchTab('numbers-tab');
                            document.getElementById('num-inputs').value = item.expr;
                        }
                        historyPanel.classList.remove('open');
                        showToast("Restored context logs frame!");
                    });
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('math_suite_history'); renderHistoryLogView(); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); generateMatrixGrid(); try { historyData = JSON.parse(localStorage.getItem('math_suite_history')) || []; } catch(e){} renderHistoryLogView();
        });
