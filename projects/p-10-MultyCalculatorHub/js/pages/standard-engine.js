/* standard-engine.js — extracted verbatim from original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const screenInput = document.getElementById('screen-input');
            const screenExpr = document.getElementById('screen-expr');
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const copyBtn = document.getElementById('copy-btn');
            const toast = document.getElementById('toast');
            
            const mClear = document.getElementById('m-clear');
            const mRecall = document.getElementById('m-recall');
            const mPlus = document.getElementById('m-plus');
            const mMinus = document.getElementById('m-minus');
            const mStore = document.getElementById('m-store');

            let currentInput = '0';
            let expressionStr = '';
            let isEvaluationReset = false;
            let memoryValue = 0;
            let historyData = [];

            const tokens = { 'add': '+', 'sub': '-', 'mul': '*', 'div': '/', 'mod': '%' };

            /* THEME SYNC MATRIX WITH MAIN DASHBOARD */
            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                applyTheme(isDarkMode ? 'dark' : 'light');
            }
            
            function applyTheme(theme) {
                if (theme === 'dark') {
                    document.body.classList.add("dark-mode");
                } else {
                    document.body.classList.remove("dark-mode");
                }
            }

            themeToggle.addEventListener('click', () => {
                const isDarkActive = document.body.classList.contains("dark-mode");
                const targetState = !isDarkActive ? 'enabled' : 'disabled';
                localStorage.setItem("globalDarkMode", targetState);
                applyTheme(!isDarkActive ? 'dark' : 'light');
            });

            window.addEventListener('storage', (e) => {
                if (e.key === 'globalDarkMode') {
                    applyTheme(e.newValue === 'enabled' ? 'dark' : 'light');
                }
            });

            /* LAYOUT AND DISPLAYS FORMATTING */
            function updateDisplay() {
                screenInput.textContent = formatDisplayString(currentInput);
                screenExpr.textContent = expressionStr;
                autoScaleOutputText();
            }
            function formatDisplayString(str) {
                if (['Error', 'Infinity', '-Infinity', 'NaN', 'Error: Div by 0'].includes(str) || str.includes('e')) return str;
                let parts = str.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join('.');
            }
            function autoScaleOutputText() {
                const len = screenInput.textContent.length;
                screenInput.style.fontSize = len > 16 ? '1.2rem' : len > 12 ? '1.8rem' : len > 8 ? '2.2rem' : '2.8rem';
            }

            /* CALCULATION EVAL SYSTEM */
            function safeEval(expr) {
                try {
                    if (/[^0-9\+\-\*\/\%\.\(\)\s]/.test(expr)) return 'Error';
                    let result = new Function(`return (${expr})`)();
                    if (result === Infinity || result === -Infinity) return 'Error: Div by 0';
                    return isNaN(result) ? 'Error' : parseFloat(result.toFixed(12)).toString();
                } catch (e) { return 'Error'; }
            }

            function handleEvaluate() {
                if (!currentInput && !expressionStr) return;
                let completeExpr = expressionStr + currentInput;
                let openBrackets = (completeExpr.match(/\(/g) || []).length;
                let closeBrackets = (completeExpr.match(/\)/g) || []).length;
                while (openBrackets > closeBrackets) { completeExpr += ')'; openBrackets--; }

                let normalizedExpr = completeExpr.replace(/×/g, '*').replace(/÷/g, '/');
                let evalResult = safeEval(normalizedExpr);

                if (evalResult.startsWith('Error')) { currentInput = evalResult; expressionStr = ''; }
                else { saveHistoryItem(completeExpr, evalResult); expressionStr = ''; currentInput = evalResult; }
                isEvaluationReset = true;
                updateDisplay();
            }

            function handleValueInput(val) {
                if (isEvaluationReset) { currentInput = val === '.' ? '0.' : val; isEvaluationReset = false; updateDisplay(); return; }
                if (val === '.' && currentInput.includes('.')) return;
                currentInput = (currentInput === '0' && val !== '.') ? val : currentInput + val;
                updateDisplay();
            }

            function handleOperatorInput(opCode) {
                isEvaluationReset = false;
                let mathOp = tokens[opCode] || opCode;
                if (mathOp === '*') mathOp = '×';
                if (mathOp === '/') mathOp = '÷';

                if (currentInput === '' && expressionStr !== '') {
                    const lastChar = expressionStr.trim().slice(-1);
                    if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
                        expressionStr = expressionStr.trim().slice(0, -1) + ' ' + mathOp + ' ';
                        updateDisplay();
                        return;
                    }
                }
                expressionStr += currentInput + ' ' + mathOp + ' ';
                currentInput = '0';
                updateDisplay();
            }

            function handleAction(action) {
                if (action === 'ac') { currentInput = '0'; expressionStr = ''; isEvaluationReset = false; }
                else if (action === 'ce') currentInput = '0';
                else if (action === 'backspace') {
                    if (isEvaluationReset || currentInput.startsWith('Error')) { currentInput = '0'; isEvaluationReset = false; }
                    else currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
                } 
                else if (action === 'sign') {
                    if (currentInput !== '0' && currentInput !== 'Error') {
                        currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
                    }
                }
                else if (action === 'equals') handleEvaluate();
                else processScientificUnary(action);
                updateDisplay();
            }

            function processScientificUnary(type) {
                let val = parseFloat(currentInput);
                if (isNaN(val)) return;
                let result;
                if (type === 'recip') { if (val === 0) { currentInput = "Error: Div by 0"; return; } result = 1 / val; }
                else if (type === 'sqr') result = Math.pow(val, 2);
                else if (type === 'cube') result = Math.pow(val, 3);
                else if (type === 'sqrt') { if (val < 0) { currentInput = "Error"; return; } result = Math.sqrt(val); }
                else if (type === 'cbrt') result = Math.cbrt(val);
                else if (type === 'pow') { handleOperatorInput('^'); return; }
                else if (type === 'percent') result = val / 100;
                
                currentInput = parseFloat(result.toFixed(12)).toString();
                isEvaluationReset = true;
            }

            /* MEMORY CONTROL SYSTEMS */
            function updateMemoryUI() {
                const disabled = memoryValue === 0;
                mClear.toggleAttribute('disabled', disabled);
                mRecall.toggleAttribute('disabled', disabled);
            }
            mStore.addEventListener('click', () => { let v = parseFloat(currentInput); if (!isNaN(v)) { memoryValue = v; isEvaluationReset = true; updateMemoryUI(); showToast("Saved to memory Slot"); } });
            mClear.addEventListener('click', () => { memoryValue = 0; updateMemoryUI(); showToast("Memory register cleared"); });
            mRecall.addEventListener('click', () => { currentInput = memoryValue.toString(); isEvaluationReset = true; updateDisplay(); });
            mPlus.addEventListener('click', () => { let v = parseFloat(currentInput); if (!isNaN(v)) { memoryValue += v; isEvaluationReset = true; updateMemoryUI(); } });
            mMinus.addEventListener('click', () => { let v = parseFloat(currentInput); if (!isNaN(v)) { memoryValue -= v; isEvaluationReset = true; updateMemoryUI(); } });

            /* LOG RETENTION HISTORY SYSTEMS */
            function initHistory() { try { historyData = JSON.parse(localStorage.getItem('calc_history')) || []; } catch(e) { historyData = []; } renderHistory(); }
            function saveHistoryItem(expr, res) { historyData.unshift({ expr, res, id: Date.now() }); if (historyData.length > 100) historyData.pop(); localStorage.setItem('calc_history', JSON.stringify(historyData)); renderHistory(); }
            function renderHistory() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No history frames captured.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div class="history-item-expr">${item.expr} =</div><div class="history-item-res">${item.res}</div>`;
                    el.addEventListener('click', () => { currentInput = item.res; isEvaluationReset = true; updateDisplay(); closeHistoryPanel(); });
                    historyList.appendChild(el);
                });
            }
            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('calc_history'); renderHistory(); });
            function openHistoryPanel() { historyPanel.classList.add('open'); }
            function closeHistoryPanel() { historyPanel.classList.remove('open'); }
            historyToggle.addEventListener('click', openHistoryPanel);
            historyClose.addEventListener('click', closeHistoryPanel);

            /* CLIPBOARD INTERACTION LOGICS */
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
            copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(screenInput.textContent.replace(/,/g, '')).then(() => showToast("Copied Metric Entry")); });
            window.addEventListener('paste', (e) => {
                const text = (e.clipboardData || window.clipboardData).getData('text').trim();
                if (/^-?\d*\.?\d*$/.test(text)) { currentInput = text; isEvaluationReset = false; updateDisplay(); showToast("Input Pasted Securely"); }
            });

            /* STRICT COMPLIANT KEYBOARD HARDWARE LISTENER ENGINES */
            const keyboardMap = {
                '0': { query: '.btn-num[data-val="0"]' }, '1': { query: '.btn-num[data-val="1"]' },
                '2': { query: '.btn-num[data-val="2"]' }, '3': { query: '.btn-num[data-val="3"]' },
                '4': { query: '.btn-num[data-val="4"]' }, '5': { query: '.btn-num[data-val="5"]' },
                '6': { query: '.btn-num[data-val="6"]' }, '7': { query: '.btn-num[data-val="7"]' },
                '8': { query: '.btn-num[data-val="8"]' }, '9': { query: '.btn-num[data-val="9"]' },
                '.': { query: '.btn-num[data-val="."]' }, '(': { query: '.btn-fn[data-val="("]' },
                ')': { query: '.btn-fn[data-val=")"]' }, '+': { query: '.btn-op[data-op="add"]' },
                '-': { query: '.btn-op[data-op="sub"]' }, '*': { query: '.btn-op[data-op="mul"]' },
                '/': { query: '.btn-op[data-op="div"]' }, '%': { query: '.btn-fn[data-action="percent"]' },
                '^': { query: '.btn-fn[data-action="pow"]' }, 'Enter': { query: '#btn-equals' },
                '=': { query: '#btn-equals' }, 'Backspace': { query: '.btn-fn[data-action="backspace"]' },
                'Delete': { query: '.btn-fn[data-action="ce"]' }, 'Escape': { query: '.btn-fn[data-action="ac"]' }
            };

            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) return;
                if (e.ctrlKey && e.key.toLowerCase() === 'h') {
                    e.preventDefault();
                    historyPanel.classList.contains('open') ? closeHistoryPanel() : openHistoryPanel();
                    return;
                }
                const match = keyboardMap[e.key];
                if (match) {
                    e.preventDefault();
                    const targetBtn = document.querySelector(match.query);
                    if (targetBtn) {
                        targetBtn.classList.add('keyboard-active');
                        targetBtn.click();
                        setTimeout(() => targetBtn.classList.remove('keyboard-active'), 120);
                    }
                }
            });

            document.querySelectorAll('.btn').forEach(button => {
                button.addEventListener('click', () => {
                    const val = button.getAttribute('data-val');
                    const op = button.getAttribute('data-op');
                    const action = button.getAttribute('data-action');
                    if (val) handleValueInput(val);
                    else if (op) handleOperatorInput(op);
                    else if (action) handleAction(action);
                });
            });

            initTheme(); initHistory(); updateDisplay();
        });
