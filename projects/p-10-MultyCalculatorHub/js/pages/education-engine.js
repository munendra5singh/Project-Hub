/* education-engine.js — extracted verbatim from education.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const stagePane = document.getElementById('stage-viewport-pane');
            const suiteTitleNode = document.getElementById('suite-title-node');
            const sidebarItems = document.querySelectorAll('.sidebar-item');
            
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            let historyData = [];

            /* THEME HANDLING ENGINE SPECIFIC NODE */
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

            /* WORKSPACE STAGE ENGINE ROUTER */
            function routeView(target) {
                sidebarItems.forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-target') === target);
                });

                switch (target) {
                    case 'dash': renderDashboardView(); break;
                    case 'pct':  renderPercentageView(); break;
                    case 'cgpa': renderCGPAView(); break;
                    case 'gpa':  renderGPAView(); break;
                    case 'attend': renderAttendanceView(); break;
                    case 'average': renderAverageView(); break;
                }
            }

            window.routeEduSuite = routeView;

            sidebarItems.forEach(item => {
                item.addEventListener('click', () => routeView(item.getAttribute('data-target')));
            });

            function renderDashboardView() {
                suiteTitleNode.textContent = "Academic Dashboard";
                stagePane.innerHTML = `
                    <div>
                        <h2>Academic Portal Engine</h2>
                        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:2px;">Advanced metrics solvers optimized for scholastic evaluation matrices.</p>
                    </div>
                    <div class="module-grid-view">
                        <div class="app-card-node" onclick="window.routeEduSuite('pct')">
                            <div class="app-card-icon"><i class="fa-solid fa-percent"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">Marks Percentage</span><span class="app-card-desc">Calculate grade aggregates and parameters</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeEduSuite('cgpa')">
                            <div class="app-card-icon"><i class="fa-solid fa-award"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">CGPA Base Transmuter</span><span class="app-card-desc">CBSE / Custom conversion formula blocks</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeEduSuite('gpa')">
                            <div class="app-card-icon"><i class="fa-solid fa-book-bookmark"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">SGPA Credit Hub</span><span class="app-card-desc">Unlimited dynamic subject grade allocation matrices</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeEduSuite('attend')">
                            <div class="app-card-icon"><i class="fa-solid fa-calendar-check"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">Attendance Forecaster</span><span class="app-card-desc">Calculate consecutive targets limits</span></div>
                        </div>
                    </div>
                `;
            }

            function renderPercentageView() {
                suiteTitleNode.textContent = "Percentage Analyzer";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item">
                                <label for="pct-obt">Obtained Marks</label>
                                <input type="number" id="pct-obt" value="435" placeholder="Enter score...">
                            </div>
                            <div class="form-group-item">
                                <label for="pct-max">Total Maximum Marks</label>
                                <input type="number" id="pct-max" value="500" placeholder="Enter max marks...">
                            </div>
                            <button class="btn-action btn-action-primary" id="pct-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Derived Percentage</span><span class="metric-val total-corpus" id="pct-node-val">0%</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Calculated Grade</span><span class="metric-val" id="pct-grade-node">-</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Status Framework</span><span class="metric-val" id="pct-status-node">-</span></div>
                            <div class="progress-bar-track"><div class="progress-bar-fill" id="pct-progress-fill"></div></div>
                        </div>
                    </div>
                `;
                
                document.getElementById('pct-obt').addEventListener('input', runPctEngine);
                document.getElementById('pct-max').addEventListener('input', runPctEngine);
                document.getElementById('pct-save-btn').addEventListener('click', () => logEduItem('Percentage Solver', document.getElementById('pct-node-val').textContent));
                
                runPctEngine();
            }

            function runPctEngine() {
                let obtInput = document.getElementById('pct-obt');
                let maxInput = document.getElementById('pct-max');
                if(!obtInput || !maxInput) return;

                let obt = parseFloat(obtInput.value) || 0;
                let max = parseFloat(maxInput.value) || 1;
                
                if(max <= 0) return;
                let pct = (obt / max) * 100;
                if(pct > 100) pct = 100;

                document.getElementById('pct-node-val').textContent = `${pct.toFixed(2)}%`;
                document.getElementById('pct-progress-fill').style.width = `${pct}%`;
                
                let grade = 'F'; let status = 'Fail';
                if(pct >= 90) { grade = 'A+'; status = 'Pass'; }
                else if(pct >= 80) { grade = 'A'; status = 'Pass'; }
                else if(pct >= 70) { grade = 'B+'; status = 'Pass'; }
                else if(pct >= 60) { grade = 'B'; status = 'Pass'; }
                else if(pct >= 33) { grade = 'C'; status = 'Pass'; }
                
                document.getElementById('pct-grade-node').textContent = grade;
                document.getElementById('pct-status-node').textContent = status;
                document.getElementById('pct-status-node').style.color = status === 'Pass' ? '#0d9488' : '#ef4444';
            }

            function renderCGPAView() {
                suiteTitleNode.textContent = "CGPA Base Transmuter";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Cumulative CGPA Input</label><input type="number" id="cgpa-val" value="9.5" step="0.01" max="10"></div>
                            <div class="form-group-item">
                                <label>Formula Standard Blueprint</label>
                                <select id="cgpa-formula">
                                    <option value="9.5" selected>CBSE Metric (× 9.5)</option>
                                    <option value="10">Standard Scale (× 10.0)</option>
                                </select>
                            </div>
                            <button class="btn-action btn-action-primary" id="cgpa-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Equivalent Percentage</span><span class="metric-val total-corpus" id="cgpa-res-node">0%</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Equation Parameter</span><span class="metric-val" id="cgpa-eq-node">CGPA × 9.5</span></div>
                        </div>
                    </div>
                `;
                ['cgpa-val', 'cgpa-formula'].forEach(id => document.getElementById(id).addEventListener('change', runCGPAEngine));
                ['cgpa-val', 'cgpa-formula'].forEach(id => document.getElementById(id).addEventListener('input', runCGPAEngine));
                document.getElementById('cgpa-save-btn').addEventListener('click', () => logEduItem('CGPA Conversion', document.getElementById('cgpa-res-node').textContent));
                runCGPAEngine();
            }

            function runCGPAEngine() {
                let cgpa = parseFloat(document.getElementById('cgpa-val').value) || 0;
                let factor = parseFloat(document.getElementById('cgpa-formula').value) || 9.5;
                let res = cgpa * factor;
                if(res > 100) res = 100;
                document.getElementById('cgpa-res-node').textContent = `${res.toFixed(2)}%`;
                document.getElementById('cgpa-eq-node').textContent = `CGPA × ${factor}`;
            }

            function renderGPAView() {
                suiteTitleNode.textContent = "SGPA Credit Hub";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="dynamic-list-container" id="gpa-rows-box"></div>
                            <div class="action-row">
                                <button class="btn-action btn-action-secondary" id="gpa-add-row-btn"><i class="fa-solid fa-plus"></i> Add Subject</button>
                                <button class="btn-action btn-action-primary" id="gpa-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                            </div>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Cumulative Semester GPA</span><span class="metric-val total-corpus" id="gpa-total-index">0.00</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Total Credits Calculated</span><span class="metric-val" id="gpa-total-credits">0</span></div>
                        </div>
                    </div>
                `;
                document.getElementById('gpa-add-row-btn').addEventListener('click', () => appendGPARow());
                document.getElementById('gpa-save-btn').addEventListener('click', () => logEduItem('GPA Calculation', document.getElementById('gpa-total-index').textContent));
                
                appendGPARow("Mathematics", 4, 10);
                appendGPARow("Physics Science", 3, 9);
                appendGPARow("Computer System", 4, 9);
            }

            function appendGPARow(name='', credits=3, point=9) {
                const container = document.getElementById('gpa-rows-box');
                if(!container) return;
                const row = document.createElement('div');
                row.className = 'dynamic-row-item';
                row.innerHTML = `
                    <input type="text" placeholder="Subject name..." value="${name}" class="gpa-row-name">
                    <input type="number" placeholder="Credits" value="${credits}" class="gpa-row-credits" min="1">
                    <select class="gpa-row-point">
                        <option value="10" ${point===10?'selected':''}>O (10)</option>
                        <option value="9" ${point===9?'selected':''}>A+ (9)</option>
                        <option value="8" ${point===8?'selected':''}>A (8)</option>
                        <option value="7" ${point===7?'selected':''}>B+ (7)</option>
                        <option value="6" ${point===6?'selected':''}>B (6)</option>
                        <option value="0" ${point===0?'selected':''}>F (0)</option>
                    </select>
                    <button class="icon-btn remove-row-action" style="color:#ef4444;"><i class="fa-solid fa-circle-xmark"></i></button>
                `;
                row.querySelector('.remove-row-action').addEventListener('click', () => { row.remove(); runGPAEngine(); });
                row.querySelectorAll('input, select').forEach(el => el.addEventListener('input', runGPAEngine));
                container.appendChild(row);
                runGPAEngine();
            }

            function runGPAEngine() {
                const rows = document.querySelectorAll('.dynamic-row-item');
                let totalPoints = 0; let totalCredits = 0;
                rows.forEach(row => {
                    let credit = parseFloat(row.querySelector('.gpa-row-credits').value) || 0;
                    let pt = parseFloat(row.querySelector('.gpa-row-point').value) || 0;
                    totalPoints += (credit * pt);
                    totalCredits += credit;
                });
                let index = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
                document.getElementById('gpa-total-index').textContent = index.toFixed(2);
                document.getElementById('gpa-total-credits').textContent = totalCredits;
            }

            function renderAttendanceView() {
                suiteTitleNode.textContent = "Attendance Forecaster";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Total Classes Conducted</label><input type="number" id="attend-total" value="50"></div>
                            <div class="form-group-item"><label>Attended Classes Count</label><input type="number" id="attend-val" value="32"></div>
                            <button class="btn-action btn-action-primary" id="attend-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Current Attendance Status</span><span class="metric-val total-corpus" id="attend-percentage-node">0%</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Consecutive Action Report</span><span class="metric-val" id="attend-report-node" style="font-size:0.9rem; font-weight:600;">Processing logs...</span></div>
                            <div class="progress-bar-track"><div class="progress-bar-fill" id="attend-progress-fill"></div></div>
                        </div>
                    </div>
                `;
                ['attend-total', 'attend-val'].forEach(id => document.getElementById(id).addEventListener('input', runAttendanceEngine));
                document.getElementById('attend-save-btn').addEventListener('click', () => logEduItem('Attendance Tracking', document.getElementById('attend-percentage-node').textContent));
                runAttendanceEngine();
            }

            function runAttendanceEngine() {
                let total = parseInt(document.getElementById('attend-total').value) || 0;
                let attend = parseInt(document.getElementById('attend-val').value) || 0;

                if(total <= 0 || attend > total) {
                    document.getElementById('attend-percentage-node').textContent = '0%';
                    document.getElementById('attend-report-node').textContent = 'Invalid boundaries setup parameters.';
                    return;
                }

                let pct = (attend / total) * 100;
                document.getElementById('attend-percentage-node').textContent = `${pct.toFixed(1)}%`;
                document.getElementById('attend-progress-fill').style.width = `${pct}%`;

                if (pct >= 75) {
                    let safeMiss = 0; let tempTotal = total; let tempAttend = attend;
                    while (((tempAttend) / (tempTotal + 1)) * 100 >= 75) { safeMiss++; tempTotal++; }
                    document.getElementById('attend-report-node').textContent = `Status Safe! You can safely skip next ${safeMiss} classes consecutively.`;
                    document.getElementById('attend-report-node').style.color = '#0d9488';
                } else {
                    let reqClasses = 0; let tempTotal = total; let tempAttend = attend;
                    while ((tempAttend / tempTotal) * 100 < 75) { reqClasses++; tempTotal++; tempAttend++; }
                    document.getElementById('attend-report-node').textContent = `Action Required: Attend next ${reqClasses} classes consecutively to hit 75%.`;
                    document.getElementById('attend-report-node').style.color = '#ef4444';
                }
            }

            function renderAverageView() {
                suiteTitleNode.textContent = "Average Analyzer";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item">
                                <label>Numeric Sequence Streams (Comma separated)</label>
                                <input type="text" id="avg-sequence" value="85, 92, 78, 90, 88">
                            </div>
                            <button class="btn-action btn-action-primary" id="avg-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Arithmetic Mean Average</span><span class="metric-val total-corpus" id="avg-mean-node">0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Total Sequence Count</span><span class="metric-val" id="avg-count-node">0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Cumulative Value Sum</span><span class="metric-val" id="avg-sum-node">0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Highest Boundary Max</span><span class="metric-val" id="avg-max-node">0</span></div>
                        </div>
                    </div>
                `;
                document.getElementById('avg-sequence').addEventListener('input', runAverageEngine);
                document.getElementById('avg-save-btn').addEventListener('click', () => logEduItem('Average Analysis', document.getElementById('avg-mean-node').textContent));
                runAverageEngine();
            }

            function runAverageEngine() {
                let raw = document.getElementById('avg-sequence').value;
                let arr = raw.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));

                if(arr.length === 0) {
                    document.getElementById('avg-mean-node').textContent = '0';
                    document.getElementById('avg-count-node').textContent = '0';
                    document.getElementById('avg-sum-node').textContent = '0';
                    document.getElementById('avg-max-node').textContent = '0';
                    return;
                }

                let sum = arr.reduce((a,b) => a+b, 0);
                let mean = sum / arr.length;
                let max = Math.max(...arr);

                document.getElementById('avg-mean-node').textContent = mean.toLocaleString('en-US', {maximumFractionDigits:2});
                document.getElementById('avg-count-node').textContent = arr.length;
                document.getElementById('avg-sum-node').textContent = sum.toLocaleString('en-US');
                document.getElementById('avg-max-node').textContent = max.toLocaleString('en-US');
            }

            function logEduItem(metaName, resultMetric) {
                const item = {
                    id: Date.now(),
                    meta: metaName,
                    res: resultMetric,
                    timestamp: new Date().toLocaleTimeString()
                };
                historyData.unshift(item);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('edu_suite_history', JSON.stringify(historyData));
                renderHistory();
                showToast("Academic calculation logged!");
            }

            function renderHistory() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No scholastic logs stored.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `
                        <div>
                            <div class="history-item-meta">${item.meta}</div>
                            <div class="history-item-expr">Timestamp: ${item.timestamp}</div>
                        </div>
                        <div class="history-item-res">${item.res}</div>
                    `;
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => {
                historyData = []; localStorage.removeItem('edu_suite_history'); renderHistory();
            });

            function openHistoryPanel() { historyPanel.classList.add('open'); }
            function closeHistoryPanel() { historyPanel.classList.remove('open'); }
            historyToggle.addEventListener('click', openHistoryPanel);
            historyClose.addEventListener('click', closeHistoryPanel);

            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); routeView('dash'); try { historyData = JSON.parse(localStorage.getItem('edu_suite_history')) || []; } catch(e){} renderHistory();
        });
