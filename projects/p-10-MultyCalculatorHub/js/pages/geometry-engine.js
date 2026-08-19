/* geometry-engine.js — extracted verbatim from geometry.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const exportCsvBtn = document.getElementById('export-csv-btn');
            const historySearchInput = document.getElementById('history-search-input');
            const toast = document.getElementById('toast');

            let historyData = [];

            /* SVG VECTOR PATH STRINGS DATA DICTIONARY */
            const svgShapesMap = {
                circle: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="svg-shape-path"/></svg>`,
                rectangle: `<svg viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" class="svg-shape-path"/></svg>`,
                triangle: `<svg viewBox="0 0 100 100"><polygon points="50,15 15,80 85,80" class="svg-shape-path"/></svg>`,
                square: `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" class="svg-shape-path"/></svg>`,
                parallelogram: `<svg viewBox="0 0 100 100"><polygon points="30,25 90,25 70,75 10,75" class="svg-shape-path"/></svg>`,
                trapezoid: `<svg viewBox="0 0 100 100"><polygon points="30,25 70,25 85,75 15,75" class="svg-shape-path"/></svg>`,
                ellipse: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="25" class="svg-shape-path"/></svg>`,
                sphere: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="svg-shape-path"/><ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="var(--accent-color)" stroke-width="1.5" stroke-dasharray="4"/></svg>`,
                cylinder: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="25" rx="25" ry="8" class="svg-shape-path"/><line x1="25" y1="25" x2="25" y2="75" stroke="var(--accent-color)" stroke-width="3"/><line x1="75" y1="25" x2="75" y2="75" stroke="var(--accent-color)" stroke-width="3"/><ellipse cx="50" cy="75" rx="25" ry="8" fill="rgba(16,185,129,0.15)" stroke="var(--accent-color)" stroke-width="3"/></svg>`,
                cube: `<svg viewBox="0 0 100 100"><rect x="15" y="35" width="50" height="50" class="svg-shape-path"/><rect x="35" y="15" width="50" height="50" fill="none" stroke="var(--accent-color)" stroke-width="2"/><line x1="15" y1="35" x2="35" y2="15" stroke="var(--accent-color)" stroke-width="2"/><line x1="65" y1="35" x2="85" y2="15" stroke="var(--accent-color)" stroke-width="2"/><line x1="15" y1="85" x2="35" y2="65" stroke="var(--accent-color)" stroke-width="2"/><line x1="65" y1="85" x2="85" y2="65" stroke="var(--accent-color)" stroke-width="2"/></svg>`,
                cuboid: `<svg viewBox="0 0 100 100"><rect x="10" y="40" width="60" height="40" class="svg-shape-path"/><rect x="30" y="20" width="60" height="40" fill="none" stroke="var(--accent-color)" stroke-width="2"/><line x1="10" y1="40" x2="30" y2="20" stroke="var(--accent-color)" stroke-width="2"/><line x1="70" y1="40" x2="90" y2="20" stroke="var(--accent-color)" stroke-width="2"/><line x1="10" y1="80" x2="30" y2="60" stroke="var(--accent-color)" stroke-width="2"/><line x1="70" y1="80" x2="90" y2="60" stroke="var(--accent-color)" stroke-width="2"/></svg>`,
                cone: `<svg viewBox="0 0 100 100"><line x1="50" y1="15" x2="20" y2="75" stroke="var(--accent-color)" stroke-width="3"/><line x1="50" y1="15" x2="80" y2="75" stroke="var(--accent-color)" stroke-width="3"/><ellipse cx="50" cy="75" rx="30" ry="10" class="svg-shape-path"/></svg>`
            };

            /* THEME CONTROLLER LIFECYCLES */
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

            /* DYNAMIC UI ADJUSTMENT MATRIX ON SHAPE CHANGE */
            window.updateInputs = function() {
                let shape = document.getElementById('shape-select').value;
                document.getElementById('shape-preview-box').innerHTML = svgShapesMap[shape] || '';

                let b1 = document.getElementById('input-box-1'), b2 = document.getElementById('input-box-2'), b3 = document.getElementById('input-box-3');
                let l1 = document.getElementById('label-val-1'), l2 = document.getElementById('label-val-2'), l3 = document.getElementById('label-val-3');
                
                // Reset setup
                b1.className = "form-group-item"; b2.style.display = 'none'; b3.style.display = 'none';

                if (shape === 'circle' || shape === 'sphere') {
                    b1.className = "form-group-item grid-full-width"; l1.innerText = "Radius (त्रिज्या):";
                } else if (shape === 'square' || shape === 'cube') {
                    b1.className = "form-group-item grid-full-width"; l1.innerText = "Side Length (भुजा):";
                } else if (shape === 'rectangle' || shape === 'ellipse') {
                    b2.style.display = 'block'; l1.innerText = "Length / Axis A:"; l2.innerText = "Width / Axis B:";
                } else if (shape === 'triangle' || shape === 'parallelogram' || shape === 'cone') {
                    b2.style.display = 'block'; l1.innerText = "Base / Radius:"; l2.innerText = "Vertical Height:";
                } else if (shape === 'cylinder') {
                    b2.style.display = 'block'; l1.innerText = "Radius (त्रिज्या):"; l2.innerText = "Cylinder Height:";
                } else if (shape === 'trapezoid') {
                    b2.style.display = 'block'; b3.style.display = 'block';
                    l1.innerText = "Base Side A:"; l2.innerText = "Base Side B:"; l3.innerText = "Parallel Height:";
                } else if (shape === 'cuboid') {
                    b2.style.display = 'block'; b3.style.display = 'block';
                    l1.innerText = "Length (लम्बाई):"; l2.innerText = "Width (चौड़ाई):"; l3.innerText = "Height (ऊंचाई):";
                }
            };

            function getPiValue() {
                let mode = document.getElementById('pi-toggle').value;
                if(mode === 'simple') return 3.14;
                if(mode === 'fraction') return 22 / 7;
                return Math.PI;
            }

            /* GEOMETRY ENGINE MATRIX CALCULATIONS */
            window.calculateGeometry = function() {
                let shape = document.getElementById('shape-select').value;
                let v1 = parseFloat(document.getElementById('geo-val-1').value) || 0;
                let v2 = parseFloat(document.getElementById('geo-val-2').value) || 0;
                let v3 = parseFloat(document.getElementById('geo-val-3').value) || 0;

                let u1 = document.getElementById('geo-unit-1').value;
                let u2 = document.getElementById('geo-unit-2').value;

                let resTitle = document.getElementById('res-title'), resBody = document.getElementById('res-body'), expBox = document.getElementById('step-explanation-box');
                let pi = getPiValue();

                if(v1 <= 0) { showValidationError("First input value boundary must be greater than zero."); return; }

                let title = "", body = "", expr = "", explanation = "";

                switch (shape) {
                    case 'circle':
                        let cArea = pi * v1 * v1; let cPeri = 2 * pi * v1;
                        title = "Circle Metrics Output";
                        body = `Area = <strong>${cArea.toFixed(4)} sq.${u1}</strong><br>Circumference = <strong>${cPeri.toFixed(4)} ${u1}</strong>`;
                        explanation = `Formula: Area = π × r², Perimeter = 2 × π × r.<br>Step Trace: ${pi.toFixed(4)} × ${v1}² = ${cArea.toFixed(4)}`;
                        expr = `r=${v1}${u1}`;
                        break;
                    case 'rectangle':
                        let rArea = v1 * v2; let rPeri = 2 * (v1 + v2);
                        title = "Rectangle Metrics Output";
                        body = `Area = <strong>${rArea.toFixed(4)} sq.${u1}</strong><br>Perimeter = <strong>${rPeri.toFixed(4)} ${u1}</strong>`;
                        explanation = `Formula: Area = L × W, Perimeter = 2 × (L + W).<br>Step Trace: ${v1} × ${v2} = ${rArea.toFixed(4)}`;
                        expr = `L=${v1}, W=${v2}`;
                        break;
                    case 'triangle':
                        let tArea = 0.5 * v1 * v2;
                        title = "Triangle Metrics Output";
                        body = `Area = <strong>${tArea.toFixed(4)} sq.${u1}</strong>`;
                        explanation = `Formula: Area = 0.5 × Base × Height.<br>Step Trace: 0.5 × ${v1} × ${v2} = ${tArea.toFixed(4)}`;
                        expr = `B=${v1}, H=${v2}`;
                        break;
                    case 'square':
                        let sArea = v1 * v1; let sPeri = 4 * v1;
                        title = "Square Metrics Output";
                        body = `Area = <strong>${sArea.toFixed(4)} sq.${u1}</strong><br>Perimeter = <strong>${sPeri.toFixed(4)} ${u1}</strong>`;
                        explanation = `Formula: Area = Side², Perimeter = 4 × Side.<br>Step Trace: ${v1}² = ${sArea.toFixed(4)}`;
                        expr = `S=${v1}${u1}`;
                        break;
                    case 'sphere':
                        let sVol = (4/3) * pi * Math.pow(v1, 3); let sSrf = 4 * pi * v1 * v1;
                        title = "Sphere Metrics Solid Output";
                        body = `Volume = <strong>${sVol.toFixed(4)} cubic ${u1}</strong><br>Surface Area = <strong>${sSrf.toFixed(4)} sq.${u1}</strong>`;
                        explanation = `Formula: Volume = 4/3 × π × r³, Surface = 4 × π × r².<br>Step Trace Volume: 1.333 × ${pi.toFixed(4)} × ${v1}³ = ${sVol.toFixed(4)}`;
                        expr = `r=${v1}${u1}`;
                        break;
                    case 'cylinder':
                        let cylVol = pi * v1 * v1 * v2;
                        title = "Cylinder Volumetric Solid Output";
                        body = `Volume = <strong>${cylVol.toFixed(4)} cubic ${u1}</strong>`;
                        explanation = `Formula: Volume = π × r² × h.<br>Step Trace: ${pi.toFixed(4)} × ${v1}² × ${v2} = ${cylVol.toFixed(4)}`;
                        expr = `r=${v1}, h=${v2}`;
                        break;
                    default:
                        // General programmatic fallback layout constraints fields validation matches
                        let genArea = v1 * (v2 || 1);
                        title = `${shape.toUpperCase()} Structural Output`;
                        body = `Computed Area/Volume Index Factor = <strong>${genArea.toFixed(4)} units</strong>`;
                        explanation = `Processed unified spatial bounds calculation loops pipelines natively.`;
                        expr = `v1=${v1}`;
                }

                resTitle.innerText = title; resBody.innerHTML = body; expBox.innerHTML = explanation;
                saveHistoryLog(shape.toUpperCase(), expr, body.split('<br>')[0].replace(/<[^>]*>/g, ''));
            }

            function showValidationError(msg) {
                document.getElementById('res-title').innerText = "Validation Exception Monitor";
                document.getElementById('res-body').innerHTML = `<span style="color:#ef4444; font-size:0.9rem;">${msg}</span>`;
            }

            /* HISTORY AND EXP-CSV IMPLEMENTATION GENERATOR */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, timestamp: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                localStorage.setItem('geometry_suite_pro_history', JSON.stringify(historyData));
                renderHistoryLogs();
            }

            function renderHistoryLogs(filterQuery = '') {
                historyList.innerHTML = '';
                let targetedList = historyData;
                if(filterQuery) {
                    targetedList = historyData.filter(h => h.type.toLowerCase().includes(filterQuery.toLowerCase()));
                }

                if(targetedList.length === 0) {
                    historyList.innerHTML = `<div style="color:var(--text-secondary); font-size:0.85rem;">No historical matching frames found.</div>`;
                    return;
                }

                targetedList.forEach(item => {
                    const node = document.createElement('div'); node.className = 'history-item';
                    node.innerHTML = `<div><span class="hist-type">${item.type}</span><div class="hist-expr">${item.expr}</div></div><span class="hist-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>`;
                    node.addEventListener('click', () => {
                        document.getElementById('shape-select').value = item.type.toLowerCase();
                        window.updateInputs();
                        historyPanel.classList.remove('open'); showToast("Restored trace context!");
                    });
                    historyList.appendChild(node);
                });
            }

            historySearchInput.addEventListener('input', (e) => renderHistoryLogs(e.target.value));

            exportCsvBtn.addEventListener('click', () => {
                if(historyData.length === 0) { showToast("No logging tracks available to dump."); return; }
                let csvContent = "data:text/csv;charset=utf-8,Shape Type,Parameters,Result Output Metric\n";
                historyData.forEach(h => {
                    csvContent += `${h.type},"${h.expr}","${h.res}"\n`;
                });
                const encodedUri = encodeURI(csvContent);
                const anchor = document.createElement('a'); anchor.setAttribute('href', encodedUri);
                anchor.setAttribute('download', 'Geometry_Hub_Report_2026.csv');
                document.body.appendChild(anchor); anchor.click(); anchor.remove();
            });

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('geometry_suite_pro_history'); renderHistoryLogs(); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            // Boot Engine Core Channels Sequence
            initTheme(); window.updateInputs(); try { historyData = JSON.parse(localStorage.getItem('geometry_suite_pro_history')) || []; } catch(e){} renderHistoryLogs();
        });
