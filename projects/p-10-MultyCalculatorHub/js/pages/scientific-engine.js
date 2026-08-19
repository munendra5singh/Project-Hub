/* scientific-engine.js — extracted verbatim from scientific.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const calcElement = document.getElementById('calculator');
            const screenInput = document.getElementById('screen-input');
            const screenExpr = document.getElementById('screen-expr');
            const previewDisplay = document.getElementById('preview-display');
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const copyBtn = document.getElementById('copy-btn');
            const degRadToggle = document.getElementById('deg-rad-toggle');
            
            const mClear = document.getElementById('m-clear');
            const mRecall = document.getElementById('m-recall');
            const mPlus = document.getElementById('m-plus');
            const mMinus = document.getElementById('m-minus');
            const mStore = document.getElementById('m-store');

            let currentInput = '0';
            let expressionStr = '';
            let isEvaluationReset = false;
            let isRadMode = true; 
            let memoryValue = 0;
            let historyData = [];

            const tokens = { 'add': '+', 'sub': '-', 'mul': '*', 'div': '/' };

            /* THEME MODE LOOP STATE */
            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                applyTheme(isDarkMode ? 'dark' : 'light');
            }
            function applyTheme(theme) {
                if (theme === 'dark') {
                    document.body.classList.add("dark-mode");
                    calcElement.setAttribute('data-theme', 'dark');
                } else {
                    document.body.classList.remove("dark-mode");
                    calcElement.removeAttribute('data-theme');
                }
            }
            themeToggle.addEventListener('click', () => {
                const isDarkActive = document.body.classList.contains("dark-mode");
                const targetState = !isDarkActive ? 'enabled' : 'disabled';
                localStorage.setItem("globalDarkMode", targetState);
                applyTheme(!isDarkActive ? 'dark' : 'light');
            });
            window.addEventListener('storage', (e) => { if (e.key === 'globalDarkMode') applyTheme(e.newValue === 'enabled' ? 'dark' : 'light'); });

            /* DEG / RAD MODE RULES */
            degRadToggle.addEventListener('click', () => {
                isRadMode = !isRadMode;
                degRadToggle.textContent = isRadMode ? 'RAD' : 'DEG';
                runLivePreview();
            });

            /* LAYOUT RENDERING MAPS */
            function updateDisplay() {
                screenInput.textContent = formatDisplayString(currentInput);
                screenExpr.textContent = expressionStr;
                runLivePreview();
            }
            function formatDisplayString(str) {
                if (['Error', 'Infinity', '-Infinity', 'NaN', 'Syntax Error'].includes(str) || str.includes('e')) return str;
                let parts = str.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join('.');
            }

            function runLivePreview() {
                if(!expressionStr) { previewDisplay.textContent = ''; return; }
                let tempExpr = expressionStr + currentInput;
                let res = safeEval(parseScientificSymbols(tempExpr));
                previewDisplay.textContent = (isNaN(res) || res === 'Error') ? '' : `= ${formatDisplayString(res)}`;
            }

            function parseScientificSymbols(expr) {
                let s = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
                s = s.replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E');
                return s;
            }

            function safeEval(expr) {
                try {
                    let balanced = expr;
                    let openB = (balanced.match(/\(/g) || []).length;
                    let closeB = (balanced.match(/\)/g) || []).length;
                    while(openB > closeB) { balanced += ')'; openB--; }
                    let res = new Function(`return (${balanced})`)();
                    if(res === Infinity || res === -Infinity) return 'Error';
                    return isNaN(res) ? 'Error' : parseFloat(res.toFixed(10)).toString();
                } catch(e) { return 'Error'; }
            }

            function handleEvaluate() {
                let parsed = parseScientificSymbols(expressionStr + currentInput);
                let finalRes = safeEval(parsed);
                if (finalRes === 'Error') { currentInput = 'Syntax Error'; }
                else {
                    saveHistoryItem(expressionStr + currentInput, finalRes);
                    currentInput = finalRes;
                }
                expressionStr = ''; isEvaluationReset = true; updateDisplay();
            }

            /* CORE EVENT HANDLERS PUMP */
            function handleValueInput(val) {
                if (isEvaluationReset || currentInput === 'Syntax Error') { currentInput = val === '.' ? '0.' : val; isEvaluationReset = false; updateDisplay(); return; }
                if (val === '.' && currentInput.includes('.')) return;
                currentInput = (currentInput === '0' && val !== '.') ? val : currentInput + val;
                updateDisplay();
            }

            function handleOperatorInput(opCode) {
                isEvaluationReset = false;
                let mathOp = tokens[opCode] || opCode;
                expressionStr += currentInput + ' ' + (mathOp === '*' ? '×' : mathOp === '/' ? '÷' : mathOp) + ' ';
                currentInput = '0'; updateDisplay();
            }

            function handleAction(action) {
                if (action === 'ac') { currentInput = '0'; expressionStr = ''; isEvaluationReset = false; }
                else if (action === 'ce') currentInput = '0';
                else if (action === 'backspace') {
                    if (isEvaluationReset || currentInput === 'Syntax Error') { currentInput = '0'; isEvaluationReset = false; }
                    else currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
                }
                else if (action === 'sign') {
                    if (currentInput !== '0' && currentInput !== 'Syntax Error') {
                        currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
                    }
                }
                else if (action === 'equals') handleEvaluate();
                updateDisplay();
            }

            /* SCI OVERLAY TRANSLATIONS */
            function processScientificFunction(func) {
                let val = parseFloat(currentInput);
                if(isNaN(val)) return;
                const toRad = (v) => isRadMode ? v : (v * Math.PI / 180);
                const fromRad = (v) => isRadMode ? v : (v * 180 / Math.PI);
                let res;
                try {
                    switch(func) {
                        case 'sin': res = Math.sin(toRad(val)); break;
                        case 'cos': res = Math.cos(toRad(val)); break;
                        case 'tan': res = Math.tan(toRad(val)); break;
                        case 'asin': res = fromRad(Math.asin(val)); break;
                        case 'acos': res = fromRad(Math.acos(val)); break;
                        case 'atan': res = fromRad(Math.atan(val)); break;
                        case 'sinh': res = Math.sinh(val); break;
                        case 'cosh': res = Math.cosh(val); break;
                        case 'tanh': res = Math.tanh(val); break;
                        case 'sec': res = 1 / Math.cos(toRad(val)); break;
                        case 'cosec': res = 1 / Math.sin(toRad(val)); break;
                        case 'cot': res = 1 / Math.tan(toRad(val)); break;
                        case 'ln': res = Math.log(val); break;
                        case 'log': res = Math.log10(val); break;
                        case 'log2': res = Math.log2(val); break;
                        case 'sqrt': res = Math.sqrt(val); break;
                        case 'cbrt': res = Math.cbrt(val); break;
                        case 'sqr': res = Math.pow(val, 2); break;
                        case 'cube': res = Math.pow(val, 3); break;
                        case 'recip': res = 1 / val; break;
                        case 'pi': res = Math.PI; isEvaluationReset = true; break;
                        case 'e': res = Math.E; isEvaluationReset = true; break;
                        case 'fact':
                            if(val < 0 || !Number.isInteger(val)) res = 'Error';
                            else { let f = 1; for(let i = 2; i <= val; i++) f *= i; res = f; }
                            break;
                        default: return;
                    }
                    currentInput = (res === 'Error' || isNaN(res)) ? 'Syntax Error' : parseFloat(res.toFixed(10)).toString();
                    isEvaluationReset = true; updateDisplay();
                } catch(err) { currentInput = 'Syntax Error'; updateDisplay(); }
            }

            /* MEMORY TRACES */
            function updateMemoryUI() {
                const disabled = memoryValue === 0;
                mClear.toggleAttribute('disabled', disabled);
                mRecall.toggleAttribute('disabled', disabled);
            }
            mStore.addEventListener('click', () => { let v = parseFloat(currentInput); if (!isNaN(v)) { memoryValue = v; isEvaluationReset = true; updateMemoryUI(); showToast("Saved to Memory Register"); } });
            mClear.addEventListener('click', () => { memoryValue = 0; updateMemoryUI(); showToast("Memory Flushed"); });
            mRecall.addEventListener('click', () => { currentInput = memoryValue.toString(); isEvaluationReset = true; updateDisplay(); });
            mPlus.addEventListener('click', () => { let v = parseFloat(currentInput); if (!isNaN(v)) { memoryValue += v; isEvaluationReset = true; updateMemoryUI(); } });
            mMinus.addEventListener('click', () => { let v = parseFloat(currentInput); if (!isNaN(v)) { memoryValue -= v; isEvaluationReset = true; updateMemoryUI(); } });

            /* DATA HISTORY SYSTEMS */
            function initHistory() { try { historyData = JSON.parse(localStorage.getItem('sci_history')) || []; } catch(e) { historyData = []; } renderHistory(); }
            function saveHistoryItem(expr, res) { historyData.unshift({ expr, res, id: Date.now() }); if (historyData.length > 100) historyData.pop(); localStorage.setItem('sci_history', JSON.stringify(historyData)); renderHistory(); }
            function renderHistory() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No logs logged.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div class="history-item-expr">${item.expr} =</div><div class="history-item-res">${item.res}</div>`;
                    el.addEventListener('click', () => { currentInput = item.res; isEvaluationReset = true; updateDisplay(); closeHistoryPanel(); });
                    historyList.appendChild(el);
                });
            }
            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('sci_history'); renderHistory(); });
            function openHistoryPanel() { historyPanel.classList.add('open'); }
            function closeHistoryPanel() { historyPanel.classList.remove('open'); }
            historyToggle.addEventListener('click', openHistoryPanel);
            historyClose.addEventListener('click', closeHistoryPanel);

            /* TOASTS BINDERS */
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
            copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(screenInput.textContent.replace(/,/g, '')).then(() => showToast("Copied Metric Result")); });
            
            function createRipple(button) {
                if (!button) return;
                const circle = document.createElement('span');
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${button.clientWidth / 2 - radius}px`; 
                circle.style.top = `${button.clientHeight / 2 - radius}px`;
                circle.className = 'ripple';
                const prevRipple = button.getElementsByClassName('ripple')[0];
                if (prevRipple) prevRipple.remove();
                button.appendChild(circle);
            }

            /* ==========================================================================
               STRENGTHENED HARDWARE KEYBOARD ROUTER
               ========================================================================== */
            const keyboardMap = {
                '0': { action: () => handleValueInput('0'), query: '.btn-num[data-val="0"]' },
                '1': { action: () => handleValueInput('1'), query: '.btn-num[data-val="1"]' },
                '2': { action: () => handleValueInput('2'), query: '.btn-num[data-val="2"]' },
                '3': { action: () => handleValueInput('3'), query: '.btn-num[data-val="3"]' },
                '4': { action: () => handleValueInput('4'), query: '.btn-num[data-val="4"]' },
                '5': { action: () => handleValueInput('5'), query: '.btn-num[data-val="5"]' },
                '6': { action: () => handleValueInput('6'), query: '.btn-num[data-val="6"]' },
                '7': { action: () => handleValueInput('7'), query: '.btn-num[data-val="7"]' },
                '8': { action: () => handleValueInput('8'), query: '.btn-num[data-val="8"]' },
                '9': { action: () => handleValueInput('9'), query: '.btn-num[data-val="9"]' },
                '.': { action: () => handleValueInput('.'), query: '.btn-num[data-val="."]' },
                '(': { action: () => handleValueInput('('), query: '.btn-sci[data-val="("]' },
                ')': { action: () => handleValueInput(')'), query: '.btn-sci[data-val=")"]' },
                '+': { action: () => handleOperatorInput('add'), query: '.btn-op[data-op="add"]' },
                '-': { action: () => handleOperatorInput('sub'), query: '.btn-op[data-op="sub"]' },
                '*': { action: () => handleOperatorInput('mul'), query: '.btn-op[data-op="mul"]' },
                '/': { action: () => handleOperatorInput('div'), query: '.btn-op[data-op="div"]' },
                '%': { action: () => handleAction('percent'), query: '.btn-fn[data-action="percent"]' },
                'Enter': { action: () => handleAction('equals'), query: '#btn-equals' },
                '=': { action: () => handleAction('equals'), query: '#btn-equals' },
                'Backspace': { action: () => handleAction('backspace'), query: '.btn-fn[data-action="backspace"]' },
                'Delete': { action: () => handleAction('ce'), query: '.btn-fn[data-action="ce"]' },
                'Escape': { action: () => handleAction('ac'), query: '.btn-fn[data-action="ac"]' }
            };

            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) return;
                if (e.ctrlKey && e.key.toLowerCase() === 'h') {
                    e.preventDefault();
                    historyPanel.classList.contains('open') ? closeHistoryPanel() : openHistoryPanel();
                    return;
                }
                
                const handler = keyboardMap[e.key];
                if (handler) {
                    e.preventDefault();
                    handler.action();
                    const el = document.querySelector(handler.query);
                    if (el) {
                        el.classList.add('keyboard-active');
                        createRipple(el);
                        setTimeout(() => el.classList.remove('keyboard-active'), 120);
                    }
                }
            });

            /* ATTACH DOM OPERATORS CLICK TRIGGERS */
            document.querySelectorAll('.btn').forEach(button => {
                button.addEventListener('click', () => {
                    const val = button.getAttribute('data-val');
                    const op = button.getAttribute('data-op');
                    const action = button.getAttribute('data-action');
                    const sci = button.getAttribute('data-sci');

                    if (val) handleValueInput(val);
                    else if (op) handleOperatorInput(op);
                    else if (action) handleAction(action);
                    else if (sci) processScientificFunction(sci);
                });
                button.addEventListener('mousedown', () => createRipple(button));
                button.addEventListener('touchstart', () => createRipple(button));
            });

            initTheme(); initHistory(); updateDisplay();
        });
