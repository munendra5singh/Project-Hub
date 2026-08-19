/* emi-engine.js — extracted verbatim from emi.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            let emiChart = null;
            let historyData = [];

            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            function formatToINR(amount) { return '₹' + Math.round(amount).toLocaleString('en-IN'); }

            /* CORE SPECTRUM GLOBAL DARK MODES */
            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                applyTheme(isDarkMode ? 'dark' : 'light');
            }
            function applyTheme(theme) {
                if (theme === 'dark') document.body.classList.add("dark-mode");
                else document.body.classList.remove("dark-mode");
                if (emiChart) calculateLoanEMI(); // Re-trigger chart rendering for color mutations
            }
            themeToggle.addEventListener('click', () => {
                const isDarkActive = document.body.classList.contains("dark-mode");
                const targetState = !isDarkActive ? 'enabled' : 'disabled';
                localStorage.setItem("globalDarkMode", targetState);
                applyTheme(!isDarkActive ? 'dark' : 'light');
            });
            window.addEventListener('storage', (e) => { if (e.key === 'globalDarkMode') applyTheme(e.newValue === 'enabled' ? 'dark' : 'light'); });

            function validateInputs(amount, rate, tenure) {
                let isValid = true;
                if (isNaN(amount) || amount <= 0) { document.getElementById("amountError").style.display = "block"; isValid = false; }
                else { document.getElementById("amountError").style.display = "none"; }
                if (isNaN(rate) || rate <= 0 || rate > 100) { document.getElementById("rateError").style.display = "block"; isValid = false; }
                else { document.getElementById("rateError").style.display = "none"; }
                if (isNaN(tenure) || tenure <= 0) { document.getElementById("tenureError").style.display = "block"; isValid = false; }
                else { document.getElementById("tenureError").style.display = "none"; }
                return isValid;
            }

            /* PRIMARY MATHEMATICAL COMPUTATIONS ENGINE */
            window.calculateLoanEMI = function(shouldLog = false) {
                const loanAmount = parseFloat(document.getElementById("loanAmount").value);
                const annualRate = parseFloat(document.getElementById("interestRate").value);
                const tenureInput = parseInt(document.getElementById("loanTenure").value);
                const isMonths = document.getElementById("tenureToggle").checked;

                if (!validateInputs(loanAmount, annualRate, tenureInput)) return;

                const totalMonths = isMonths ? tenureInput : tenureInput * 12;
                const monthlyRate = annualRate / 12 / 100;

                let monthlyEmi = 0;
                if (monthlyRate === 0) { monthlyEmi = loanAmount / totalMonths; } 
                else { monthlyEmi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1); }

                const totalAmountPayable = monthlyEmi * totalMonths;
                const totalInterestPayable = totalAmountPayable - loanAmount;

                document.getElementById("monthlyEmi").innerText = formatToINR(monthlyEmi);
                document.getElementById("totalInterest").innerText = formatToINR(totalInterestPayable);
                document.getElementById("totalPayment").innerText = formatToINR(totalAmountPayable);

                updatePieChart(loanAmount, totalInterestPayable);
                generateAmortizationSchedule(loanAmount, monthlyRate, monthlyEmi, totalMonths);

                if (shouldLog) {
                    saveHistoryLog("EMI Loan", `${formatToINR(loanAmount)} @ ${annualRate}%`, formatToINR(monthlyEmi));
                }
            }

            function updatePieChart(principal, interest) {
                const ctx = document.getElementById('emiPieChart').getContext('2d');
                if (emiChart) emiChart.destroy();

                const labelColor = document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#0f172a';

                emiChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Principal Amount', 'Total Interest'],
                        datasets: [{
                            data: [principal, interest],
                            backgroundColor: ['#3b82f6', '#fd7e14'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: labelColor, font: { family: 'Plus Jakarta Sans', weight: '700', size: 12 } } }
                        }
                    }
                });
            }

            function generateAmortizationSchedule(principal, monthlyRate, emi, totalMonths) {
                const tbody = document.getElementById("amortizationBody");
                tbody.innerHTML = "";
                let remainingBalance = principal;

                for (let i = 1; i <= totalMonths; i++) {
                    let interestPaid = remainingBalance * monthlyRate;
                    let principalPaid = emi - interestPaid;
                    remainingBalance -= principalPaid;
                    if (remainingBalance < 0) remainingBalance = 0;

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><strong>#${i}</strong></td>
                        <td>${formatToINR(emi)}</td>
                        <td>${formatToINR(principalPaid)}</td>
                        <td style="color: #fd7e14; font-weight:600;">${formatToINR(interestPaid)}</td>
                        <td><strong>${formatToINR(remainingBalance)}</strong></td>
                    `;
                    tbody.appendChild(row);
                }
            }

            /* REGISTER LISTENER BINDINGS FOR REAL-TIME CALCULATIONS */
            ["loanAmount", "interestRate", "loanTenure"].forEach(id => {
                document.getElementById(id).addEventListener("input", () => calculateLoanEMI(false));
                document.getElementById(id).addEventListener("blur", () => calculateLoanEMI(true));
            });

            document.getElementById("tenureToggle").addEventListener("change", function() {
                const statusText = document.getElementById("tenureTypeText");
                const tenureInput = document.getElementById("loanTenure");
                if (this.checked) {
                    statusText.innerHTML = "📅 Duration in: Months (महीने)";
                    tenureInput.value = parseInt(tenureInput.value) * 12 || "";
                } else {
                    statusText.innerHTML = "📅 Duration in: Years (वर्ष)";
                    tenureInput.value = Math.round(parseInt(tenureInput.value) / 12) || "1";
                }
                calculateLoanEMI(true);
            });

            window.resetCalculator = function() {
                document.getElementById("loanAmount").value = "1000000";
                document.getElementById("interestRate").value = "8.5";
                document.getElementById("loanTenure").value = "5";
                document.getElementById("tenureToggle").checked = false;
                document.getElementById("tenureTypeText").innerHTML = "📅 Duration in: Years (वर्ष)";
                calculateLoanEMI(false);
                showToast("Fields Reset Perfectly");
            }

            /* RETENTION STORE CONTROL ARRAYS LOG CONTEXTS */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('emi_suite_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No dynamic loan logs captured yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div><span class="hist-type">${item.type}</span><div class="hist-expr">${item.expr}</div></div><span class="hist-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>`;
                    el.addEventListener('click', () => {
                        const amt = parseFloat(item.expr.replace(/[^0-9.]/g, '').split('@')[0]);
                        const rate = parseFloat(item.expr.split('@')[1]);
                        document.getElementById('loanAmount').value = amt;
                        document.getElementById('interestRate').value = rate;
                        calculateLoanEMI(false);
                        historyPanel.classList.remove('open');
                        showToast("Loaded entry frame parameters!");
                    });
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('emi_suite_history'); renderHistoryLogView(); showToast("Logs Flushed Successfully"); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            initTheme(); try { historyData = JSON.parse(localStorage.getItem('emi_suite_history')) || []; } catch(e){} renderHistoryLogView(); calculateLoanEMI(false);
        });
