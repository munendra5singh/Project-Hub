/* finance-engine.js — extracted verbatim from finance.html's original inline <script>; logic/behavior unchanged, only relocated */
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

            let currentActiveView = 'dash';
            let historyData = [];

            /* THEME ENGINEERING ENGINE SPECIFIC NODE */
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

            /* ==========================================================================
               WORKSPACE STAGE ENGINE ROUTER
               ========================================================================== */
            function routeView(target) {
                currentActiveView = target;
                sidebarItems.forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-target') === target);
                });

                switch (target) {
                    case 'dash': renderDashboardView(); break;
                    case 'emi':  renderEMICalcView(); break;
                    case 'sip':  renderSIPCalcView(); break;
                    case 'fd':   renderFDCalcView(); break;
                    case 'ppf':  renderPPFCalcView(); break;
                    case 'gst':  renderGSTCalcView(); break;
                    case 'retire': renderRetirementView(); break;
                }
            }

            sidebarItems.forEach(item => {
                item.addEventListener('click', () => routeView(item.getAttribute('data-target')));
            });

            /* ==========================================================================
               VIEW RENDER CONTEXT CLOSURES
               ========================================================================== */
            function renderDashboardView() {
                suiteTitleNode.textContent = "Fintech Dashboard";
                stagePane.innerHTML = `
                    <div style="margin-bottom: 6px;">
                        <h2>Welcome, Munendra</h2>
                        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:2px;">Select an optimized algorithmic computing engine below to begin.</p>
                    </div>
                    <div class="module-grid-view">
                        <div class="app-card-node" onclick="window.routeFinanceSuite('emi')">
                            <div class="app-card-icon"><i class="fa-solid fa-landmark"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">EMI Loan Station</span><span class="app-card-desc">Calculate home/personal monthly loans tracks</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeFinanceSuite('sip')">
                            <div class="app-card-icon"><i class="fa-solid fa-chart-line"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">SIP Mutual Wealth</span><span class="app-card-desc">Forecast compound future compound returns</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeFinanceSuite('fd')">
                            <div class="app-card-icon"><i class="fa-solid fa-vault"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">Fixed Deposit (FD)</span><span class="app-card-desc">Process steady riskless yield compounding terms</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeFinanceSuite('ppf')">
                            <div class="app-card-icon"><i class="fa-solid fa-piggy-bank"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">PPF Long Corpus</span><span class="app-card-desc">Tax-free sovereign state statutory asset growth</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeFinanceSuite('gst')">
                            <div class="app-card-icon"><i class="fa-solid fa-receipt"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">GST Fiscal Taxation</span><span class="app-card-desc">Process macro addition/removal fiscal bounds</span></div>
                        </div>
                        <div class="app-card-node" onclick="window.routeFinanceSuite('retire')">
                            <div class="app-card-icon"><i class="fa-solid fa-couch"></i></div>
                            <div class="app-card-meta"><span class="app-card-title">Retirement Vision</span><span class="app-card-desc">Inflation adjusted safety parameters planners</span></div>
                        </div>
                    </div>
                `;
            }

            // Expose globally for inner dashboard triggers safely
            window.routeFinanceSuite = routeView;

            /* MODULE 1: EMI LOAN STATION */
            function renderEMICalcView() {
                suiteTitleNode.textContent = "EMI Loan Station";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Principal Loan Amount (₹)</label><input type="number" id="emi-amount" value="1000000" step="10000"></div>
                            <div class="form-group-item"><label>Rate of Interest (% P.A.)</label><input type="number" id="emi-rate" value="8.5" step="0.1"></div>
                            <div class="form-group-item"><label>Tenure Duration (Years)</label><input type="number" id="emi-years" value="20" step="1"></div>
                            <div class="action-row">
                                <button class="btn-action btn-action-secondary" id="emi-csv-btn"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                                <button class="btn-action btn-action-primary" id="emi-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                            </div>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Monthly EMI Payout</span><span class="metric-val" id="emi-monthly-node" style="color:var(--accent-color); font-size:1.3rem;">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Total Principal</span><span class="metric-val" id="emi-principal-node">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Total Interest Accrued</span><span class="metric-val" id="emi-interest-node">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Gross Cumulative Outlay</span><span class="metric-val total-corpus" id="emi-total-node">₹0</span></div>
                            <div class="chart-box-wrapper"><canvas id="emi-pie-canvas" width="160" height="160"></canvas></div>
                        </div>
                    </div>
                    <div class="table-viewport">
                        <table id="emi-schedule-table">
                            <thead><tr><th>Year</th><th>Principal Paid</th><th>Interest Paid</th><th>Remaining Balance</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `;
                
                // Wire triggers
                const inputs = ['emi-amount', 'emi-rate', 'emi-years'];
                inputs.forEach(id => document.getElementById(id).addEventListener('input', runEMIEngine));
                document.getElementById('emi-save-btn').addEventListener('click', () => logFinCalc('Loan EMI'));
                document.getElementById('emi-csv-btn').addEventListener('click', () => exportTableToCSV('emi-schedule-table', 'EMI_Amortization_Schedule'));
                runEMIEngine();
            }

            function runEMIEngine() {
                let p = parseFloat(document.getElementById('emi-amount').value) || 0;
                let r = (parseFloat(document.getElementById('emi-rate').value) || 0) / 12 / 100;
                let n = (parseFloat(document.getElementById('emi-years').value) || 0) * 12;

                if(p<=0 || r===0 || n<=0) return;

                let emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                let totalPayment = emi * n;
                let totalInterest = totalPayment - p;

                document.getElementById('emi-monthly-node').textContent = `₹${formatMetric(emi.toFixed(0))}`;
                document.getElementById('emi-principal-node').textContent = `₹${formatMetric(p.toFixed(0))}`;
                document.getElementById('emi-interest-node').textContent = `₹${formatMetric(totalInterest.toFixed(0))}`;
                document.getElementById('emi-total-node').textContent = `₹${formatMetric(totalPayment.toFixed(0))}`;

                drawPieChart('emi-pie-canvas', [p, totalInterest], ['#4f46e5', '#db2777']);

                // Generate Amortization Table
                let tbody = document.getElementById('emi-schedule-table').querySelector('tbody');
                tbody.innerHTML = '';
                let balance = p;
                let yearlyPrincipal = 0;
                let yearlyInterest = 0;

                for(let i=1; i<=n; i++) {
                    let intr = balance * r;
                    let prin = emi - intr;
                    balance -= prin;

                    yearlyPrincipal += prin;
                    yearlyInterest += intr;

                    if(i % 12 === 0 || i === n) {
                        let tr = document.createElement('tr');
                        tr.innerHTML = `<td>Year ${Math.ceil(i/12)}</td><td>₹${formatMetric(yearlyPrincipal.toFixed(0))}</td><td>₹${formatMetric(yearlyInterest.toFixed(0))}</td><td>₹${formatMetric(Math.max(0, balance).toFixed(0))}</td>`;
                        tbody.appendChild(tr);
                        yearlyPrincipal = 0; yearlyInterest = 0;
                    }
                }
            }

            /* MODULE 2: SIP WEALTH ACCUMULATOR */
            function renderSIPCalcView() {
                suiteTitleNode.textContent = "SIP Wealth Accumulator";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Monthly Contribution (₹)</label><input type="number" id="sip-monthly" value="10000" step="500"></div>
                            <div class="form-group-item"><label>Expected Return Rate (% P.A.)</label><input type="number" id="sip-yield" value="12" step="0.5"></div>
                            <div class="form-group-item"><label>Time Duration (Years)</label><input type="number" id="sip-years" value="15" step="1"></div>
                            <div class="action-row">
                                <button class="btn-action btn-action-secondary" id="sip-csv-btn"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
                                <button class="btn-action btn-action-primary" id="sip-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                            </div>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Total Capital Invested</span><span class="metric-val" id="sip-invested-node">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Estimated Returns Growth</span><span class="metric-val" id="sip-gains-node" style="color:#059669;">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Future Total Wealth Asset</span><span class="metric-val total-corpus" id="sip-total-node">₹0</span></div>
                            <div class="chart-box-wrapper"><canvas id="sip-pie-canvas" width="160" height="160"></canvas></div>
                        </div>
                    </div>
                    <div class="table-viewport">
                        <table id="sip-growth-table">
                            <thead><tr><th>Year</th><th>Invested Capital</th><th>Estimated Yield</th><th>Total Future Value</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `;
                const inputs = ['sip-monthly', 'sip-yield', 'sip-years'];
                inputs.forEach(id => document.getElementById(id).addEventListener('input', runSIPEngine));
                document.getElementById('sip-save-btn').addEventListener('click', () => logFinCalc('SIP Tracker'));
                document.getElementById('sip-csv-btn').addEventListener('click', () => exportTableToCSV('sip-growth-table', 'SIP_Wealth_Accumulation_Growth'));
                runSIPEngine();
            }

            function runSIPEngine() {
                let m = parseFloat(document.getElementById('sip-monthly').value) || 0;
                let i = (parseFloat(document.getElementById('sip-yield').value) || 0) / 12 / 100;
                let y = parseFloat(document.getElementById('sip-years').value) || 0;

                if(m<=0 || i===0 || y<=0) return;

                let months = y * 12;
                let totalWealth = m * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
                let totalInvested = m * months;
                let estimatedReturns = totalWealth - totalInvested;

                document.getElementById('sip-invested-node').textContent = `₹${formatMetric(totalInvested.toFixed(0))}`;
                document.getElementById('sip-gains-node').textContent = `₹${formatMetric(estimatedReturns.toFixed(0))}`;
                document.getElementById('sip-total-node').textContent = `₹${formatMetric(totalWealth.toFixed(0))}`;

                drawPieChart('sip-pie-canvas', [totalInvested, estimatedReturns], ['#6366f1', '#059669']);

                let tbody = document.getElementById('sip-growth-table').querySelector('tbody');
                tbody.innerHTML = '';
                for(let currentYear=1; currentYear<=y; currentYear++) {
                    let cMonths = currentYear * 12;
                    let cWealth = m * ((Math.pow(1 + i, cMonths) - 1) / i) * (1 + i);
                    let cInvested = m * cMonths;
                    let cGains = cWealth - cInvested;

                    let tr = document.createElement('tr');
                    tr.innerHTML = `<td>Year ${currentYear}</td><td>₹${formatMetric(cInvested.toFixed(0))}</td><td>₹${formatMetric(cGains.toFixed(0))}</td><td>₹${formatMetric(cWealth.toFixed(0))}</td>`;
                    tbody.appendChild(tr);
                }
            }

            /* MODULE 3: FIXED DEPOSIT (FD) */
            function renderFDCalcView() {
                suiteTitleNode.textContent = "Fixed Deposit (FD)";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Initial Principal Deposit (₹)</label><input type="number" id="fd-principal" value="100000" step="5000"></div>
                            <div class="form-group-item"><label>Rate of Interest (% P.A.)</label><input type="number" id="fd-rate" value="7.1" step="0.1"></div>
                            <div class="form-group-item"><label>Duration Window (Years)</label><input type="number" id="fd-years" value="5" step="1"></div>
                            <div class="form-group-item">
                                <label>Compounding Interval Frequency</label>
                                <select id="fd-compound">
                                    <option value="4" selected>Quarterly (Standard)</option>
                                    <option value="12">Monthly</option>
                                    <option value="1">Yearly</option>
                                </select>
                            </div>
                            <button class="btn-action btn-action-primary" id="fd-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Invested Base Capital</span><span class="metric-val" id="fd-invested-node">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Absolute Yield Earned</span><span class="metric-val" id="fd-interest-node" style="color:#06b6d4;">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Total Value At Maturity</span><span class="metric-val total-corpus" id="fd-maturity-node">₹0</span></div>
                            <div class="chart-box-wrapper"><canvas id="fd-pie-canvas" width="160" height="160"></canvas></div>
                        </div>
                    </div>
                `;
                const inputs = ['fd-principal', 'fd-rate', 'fd-years', 'fd-compound'];
                inputs.forEach(id => document.getElementById(id).addEventListener('input', runFDEngine));
                document.getElementById('fd-save-btn').addEventListener('click', () => logFinCalc('Fixed Deposit'));
                runFDEngine();
            }

            function runFDEngine() {
                let p = parseFloat(document.getElementById('fd-principal').value) || 0;
                let r = (parseFloat(document.getElementById('fd-rate').value) || 0) / 100;
                let t = parseFloat(document.getElementById('fd-years').value) || 0;
                let n = parseInt(document.getElementById('fd-compound').value) || 4;

                if(p<=0 || r===0 || t<=0) return;

                let maturityAmount = p * Math.pow(1 + (r / n), n * t);
                let interest = maturityAmount - p;

                document.getElementById('fd-invested-node').textContent = `₹${formatMetric(p.toFixed(0))}`;
                document.getElementById('fd-interest-node').textContent = `₹${formatMetric(interest.toFixed(0))}`;
                document.getElementById('fd-maturity-node').textContent = `₹${formatMetric(maturityAmount.toFixed(0))}`;

                drawPieChart('fd-pie-canvas', [p, interest], ['#3b82f6', '#06b6d4']);
            }

            /* MODULE 4: PUBLIC PROVIDENT FUND (PPF) */
            function renderPPFCalcView() {
                suiteTitleNode.textContent = "PPF Sovereign Long Corpus";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Annual Strategic Investment (₹)</label><input type="number" id="ppf-annual" value="150000" step="5000" max="150000"></div>
                            <div class="form-group-item"><label>Sovereign Interest Rate (% P.A.)</label><input type="number" id="ppf-rate" value="7.1" disabled></div>
                            <div class="form-group-item"><label>Lock-in Window (Years)</label><input type="number" id="ppf-years" value="15" disabled></div>
                            <button class="btn-action btn-action-primary" id="ppf-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Total Capital Deposited</span><span class="metric-val" id="ppf-invested-node">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Tax-Free Interest Accrued</span><span class="metric-val" id="ppf-interest-node" style="color:#eab308;">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Total Maturity Corpus</span><span class="metric-val total-corpus" id="ppf-maturity-node">₹0</span></div>
                            <div class="chart-box-wrapper"><canvas id="ppf-pie-canvas" width="160" height="160"></canvas></div>
                        </div>
                    </div>
                `;
                document.getElementById('ppf-annual').addEventListener('input', runPPFEngine);
                document.getElementById('ppf-save-btn').addEventListener('click', () => logFinCalc('PPF Scheme'));
                runPPFEngine();
            }

            function runPPFEngine() {
                let f = parseFloat(document.getElementById('ppf-annual').value) || 0;
                let r = 7.1 / 100;
                let t = 15;

                if(f<=0) return;

                let totalWealth = 0;
                let totalInvested = f * t;

                for(let year=1; year<=t; year++) {
                    totalWealth = (totalWealth + f) * (1 + r);
                }
                let totalInterest = totalWealth - totalInvested;

                document.getElementById('ppf-invested-node').textContent = `₹${formatMetric(totalInvested.toFixed(0))}`;
                document.getElementById('ppf-interest-node').textContent = `₹${formatMetric(totalInterest.toFixed(0))}`;
                document.getElementById('ppf-maturity-node').textContent = `₹${formatMetric(totalWealth.toFixed(0))}`;

                drawPieChart('ppf-pie-canvas', [totalInvested, totalInterest], ['#a855f7', '#eab308']);
            }

            /* MODULE 5: GST FISCAL TAXATION */
            function renderGSTCalcView() {
                suiteTitleNode.textContent = "GST Fiscal Taxation";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Base Core Value (₹)</label><input type="number" id="gst-amount" value="5000" step="100"></div>
                            <div class="form-group-item">
                                <label>GST Slab Rate</label>
                                <select id="gst-rate">
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18" selected>18% (Standard)</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                            <div class="form-group-item">
                                <label>Tax Vector Operation</label>
                                <select id="gst-type">
                                    <option value="add" selected>Add GST (Exclusive)</option>
                                    <option value="remove">Remove GST (Inclusive)</option>
                                </select>
                            </div>
                            <button class="btn-action btn-action-primary" id="gst-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Net Net Core Value</span><span class="metric-val" id="gst-net-node">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Computed GST Tax Share</span><span class="metric-val" id="gst-tax-node" style="color:#f97316;">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Gross Final Balance Sheet</span><span class="metric-val total-corpus" id="gst-gross-node">₹0</span></div>
                        </div>
                    </div>
                `;
                const inputs = ['gst-amount', 'gst-rate', 'gst-type'];
                inputs.forEach(id => document.getElementById(id).addEventListener('change', runGSTEngine));
                inputs.forEach(id => document.getElementById(id).addEventListener('input', runGSTEngine));
                document.getElementById('gst-save-btn').addEventListener('click', () => logFinCalc('GST Tax'));
                runGSTEngine();
            }

            function runGSTEngine() {
                let amt = parseFloat(document.getElementById('gst-amount').value) || 0;
                let rate = parseFloat(document.getElementById('gst-rate').value) || 0;
                let type = document.getElementById('gst-type').value;

                if(amt<=0) return;

                let tax = 0; let net = 0; let gross = 0;

                if (type === 'add') {
                    tax = (amt * rate) / 100;
                    net = amt;
                    gross = amt + tax;
                } else {
                    gross = amt;
                    net = amt / (1 + (rate / 100));
                    tax = gross - net;
                }

                document.getElementById('gst-net-node').textContent = `₹${formatMetric(net.toFixed(2))}`;
                document.getElementById('gst-tax-node').textContent = `₹${formatMetric(tax.toFixed(2))}`;
                document.getElementById('gst-gross-node').textContent = `₹${formatMetric(gross.toFixed(2))}`;
            }

            /* MODULE 6: RETIREMENT ENGINE PLATFORM */
            function renderRetirementView() {
                suiteTitleNode.textContent = "Retirement Core Planner";
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item"><label>Current Age (Years)</label><input type="number" id="ret-current-age" value="25" min="15" max="65"></div>
                            <div class="form-group-item"><label>Target Retirement Age (Years)</label><input type="number" id="ret-target-age" value="60" min="40" max="75"></div>
                            <div class="form-group-item"><label>Current Monthly Expense (₹)</label><input type="number" id="ret-expense" value="30000" step="1000"></div>
                            <div class="form-group-item"><label>Expected Post-Retirement Inflation (% P.A.)</label><input type="number" id="ret-inflation" value="6" step="0.5"></div>
                            <div class="form-group-item"><label>Pre-Retirement Investment Yield (% P.A.)</label><input type="number" id="ret-yield" value="12" step="0.5"></div>
                            <button class="btn-action btn-action-primary" id="ret-save-btn"><i class="fa-solid fa-bookmark"></i> Save Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Years Left to Save</span><span class="metric-val" id="ret-years-left">0 Yrs</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Adjusted Monthly Expense At 60</span><span class="metric-val" id="ret-adj-expense">₹0</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Target Safety Corpus Required</span><span class="metric-val total-corpus" id="ret-corpus-node">₹0</span></div>
                        </div>
                    </div>
                `;
                const inputs = ['ret-current-age', 'ret-target-age', 'ret-expense', 'ret-inflation', 'ret-yield'];
                inputs.forEach(id => document.getElementById(id).addEventListener('input', runRetirementEngine));
                document.getElementById('ret-save-btn').addEventListener('click', () => logFinCalc('Retirement Planner'));
                runRetirementEngine();
            }

            function runRetirementEngine() {
                let currentAge = parseInt(document.getElementById('ret-current-age').value) || 25;
                let targetAge = parseInt(document.getElementById('ret-target-age').value) || 60;
                let monthlyExp = parseFloat(document.getElementById('ret-expense').value) || 0;
                let inflation = (parseFloat(document.getElementById('ret-inflation').value) || 6) / 100;
                let yieldRate = (parseFloat(document.getElementById('ret-yield').value) || 12) / 100;

                let deferralPeriod = targetAge - currentAge;
                if(deferralPeriod <= 0) {
                    document.getElementById('ret-years-left').textContent = "0 Yrs";
                    document.getElementById('ret-adj-expense').textContent = "₹0";
                    document.getElementById('ret-corpus-node').textContent = "₹0";
                    return;
                }

                // Calculate future adjusted cost of living at time of retirement
                let futureMonthlyExpense = monthlyExp * Math.pow(1 + inflation, deferralPeriod);
                
                // Capitalization target assuming annuity capitalization logic post retirement
                // Safe drawdown assumptions framework rules applied
                let annuitySafeRate = 0.05; // Assuming conservative 5% yield post retirement
                let requiredCorpus = (futureMonthlyExpense * 12) / annuitySafeRate;

                document.getElementById('ret-years-left').textContent = `${deferralPeriod} Yrs`;
                document.getElementById('ret-adj-expense').textContent = `₹${formatMetric(futureMonthlyExpense.toFixed(0))}`;
                document.getElementById('ret-corpus-node').textContent = `₹${formatMetric(requiredCorpus.toFixed(0))}`;
            }

            /* ==========================================================================
               CHART RENDERER GRAPHICS CORE (NETIVE CANVAS)
               ========================================================================== */
            function drawPieChart(canvasId, dataset, colorArray) {
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                let cumulativeSum = dataset.reduce((a, b) => a + b, 0);
                if (cumulativeSum === 0) return;

                let startAngleNode = 0;
                const centerCoordinateX = canvas.width / 2;
                const centerCoordinateY = canvas.height / 2;
                const externalRadius = Math.min(centerCoordinateX, centerCoordinateY) - 4;

                dataset.forEach((val, idx) => {
                    let sliceAngle = (val / cumulativeSum) * 2 * Math.PI;
                    ctx.fillStyle = colorArray[idx];
                    ctx.beginPath();
                    ctx.moveTo(centerCoordinateX, centerCoordinateY);
                    ctx.arc(centerCoordinateX, centerCoordinateY, externalRadius, startAngleNode, startAngleNode + sliceAngle);
                    ctx.closePath();
                    ctx.fill();
                    startAngleNode += sliceAngle;
                });

                // Inner Glass Donut Cutout
                ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff';
                ctx.beginPath();
                ctx.arc(centerCoordinateX, centerCoordinateY, externalRadius * 0.55, 0, 2 * Math.PI);
                ctx.fill();
            }

            /* ==========================================================================
               EXPORT OPTIONS COMPONENT INTEGRATION
               ========================================================================== */
            function exportTableToCSV(tableId, filename) {
                const table = document.getElementById(tableId);
                if (!table) return;
                let csvRowsString = [];
                const tableRows = table.querySelectorAll('tr');
                
                tableRows.forEach(row => {
                    let columnsData = [];
                    const items = row.querySelectorAll('th, td');
                    items.forEach(item => columnsData.push(`"${item.textContent.replace(/"/g, '""')}"`));
                    csvRowsString.push(columnsData.join(','));
                });

                const csvBlobData = new Blob([csvRowsString.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const transientAnchorNode = document.createElement('a');
                transientAnchorNode.href = URL.createObjectURL(csvBlobData);
                transientAnchorNode.setAttribute('download', `${filename}_2026.csv`);
                document.body.appendChild(transientAnchorNode);
                transientAnchorNode.click();
                document.body.removeChild(transientAnchorNode);
                showToast("CSV Sheet exported successfully!");
            }

            /* ==========================================================================
               HISTORY UTILITY LOG RETENTION PLATFORM
               ========================================================================== */
            function logFinCalc(moduleMeta) {
                let finalPrimaryValue = stagePane.querySelector('.total-corpus')?.textContent || "₹0";
                const logItem = {
                    id: Date.now(),
                    meta: moduleMeta,
                    res: finalPrimaryValue,
                    timestamp: new Date().toLocaleTimeString()
                };

                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('fin_suite_history', JSON.stringify(historyData));
                renderHistory();
                showToast("Calculation frame logged!");
            }

            function renderHistory() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No logs logged yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `
                        <div class="history-item-meta">${item.meta}</div>
                        <div class="history-item-expr">Timestamp Track: ${item.timestamp}</div>
                        <div class="history-item-res">${item.res}</div>
                    `;
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => {
                historyData = []; localStorage.removeItem('fin_suite_history'); renderHistory();
            });

            function openHistoryPanel() { historyPanel.classList.add('open'); }
            function closeHistoryPanel() { historyPanel.classList.remove('open'); }
            historyToggle.addEventListener('click', openHistoryPanel);
            historyClose.addEventListener('click', closeHistoryPanel);

            function formatMetric(str) {
                return parseFloat(str).toLocaleString('en-IN');
            }
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            // Boot suite modules
            initTheme(); routeView('dash'); try { historyData = JSON.parse(localStorage.getItem('fin_suite_history')) || []; } catch(e){} renderHistory();
        });
