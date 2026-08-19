/* programmer-engine.js — extracted verbatim from programmer.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            // Core DOM Elements Cache
            const screenInput = document.getElementById('screen-input');
            const screenExpr = document.getElementById('screen-expr');
            const bitMatrixDisplay = document.getElementById('bit-matrix-display');
            const bitSizeSelect = document.getElementById('bit-size-select');
            const signModeSelect = document.getElementById('sign-mode-select');
            
            const valHex = document.getElementById('val-hex');
            const valDec = document.getElementById('val-dec');
            const valOct = document.getElementById('val-oct');
            const valBin = document.getElementById('val-bin');
            
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const copyBtn = document.getElementById('copy-btn');
            const toast = document.getElementById('toast');

            // Internal State Machine Configuration
            let currentRadixMode = 'DEC'; 
            let bitSize = 64; 
            let isSigned = true; 
            
            let internalValue = 0n; // Core value registry tracked explicitly using BigInt types
            let currentInputStr = '0';
            let expressionStr = '';
            let isEvaluationReset = false;
            let historyData = [];

            const radixBases = { HEX: 16, DEC: 10, OCT: 8, BIN: 2 };

            /* THEME ENGINEERING ENGINE MATRIX */
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
               BIGINT COMPLIANT DATA MASKING & OVERFLOW MANAGEMENT
               ========================================================================== */
            function getBitMask() {
                return (1n << BigInt(bitSize)) - 1n;
            }

            function clampOverflow(val) {
                let mask = getBitMask();
                let uVal = val & mask; // Mask raw bits safely first
                
                if (isSigned) {
                    let maxSigned = (1n << (BigInt(bitSize) - 1n)) - 1n;
                    if (uVal > maxSigned) {
                        uVal = uVal - (1n << BigInt(bitSize));
                    }
                }
                return uVal;
            }

            /* ==========================================================================
               DYNAMIC RADIX CONVERSION & RENDERING VIEWPORTS
               ========================================================================== */
            function renderAllBases() {
                let mask = getBitMask();
                let rawBits = internalValue & mask;

                // Hex representation string extraction
                valHex.textContent = rawBits.toString(16).toUpperCase();
                
                // Dec calculation showing evaluation path mappings contextually
                valDec.textContent = internalValue.toString(10);
                
                // Oct representation extraction
                valOct.textContent = rawBits.toString(8);
                
                // Bin output generation
                let binStr = rawBits.toString(2).padStart(bitSize, '0');
                // Group binary bits into byte fragments visually
                valBin.textContent = binStr.match(/.{1,8}/g).join(' ');

                renderBitMatrix(binStr);
                lockKeypadForCurrentRadix();
            }

            function renderBitMatrix(binStr) {
                bitMatrixDisplay.innerHTML = '';
                // Splitting blocks for 64 / 32 / 16 / 8 architecture views dynamically
                let totalBits = bitSize;
                let reversedBin = binStr.split('').reverse().join('');

                for (let i = totalBits - 1; i >= 0; i--) {
                    const bitState = reversedBin[i] === '1';
                    const node = document.createElement('div');
                    node.className = `bit-node ${bitState ? 'on' : ''}`;
                    node.innerHTML = `
                        <span class="bit-val">${reversedBin[i]}</span>
                        <span class="bit-idx">${i}</span>
                    `;
                    node.addEventListener('click', () => {
                        let bitPosition = BigInt(i);
                        internalValue = internalValue ^ (1n << bitPosition);
                        internalValue = clampOverflow(internalValue);
                        currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                        updateDisplayView();
                    });
                    bitMatrixDisplay.appendChild(node);
                }
            }

            function updateDisplayView() {
                screenInput.textContent = currentInputStr;
                screenExpr.textContent = expressionStr;
                renderAllBases();
            }

            /* KEYPAD INTERFACE RADIX LOCK MECHANISM */
            function lockKeypadForCurrentRadix() {
                document.querySelectorAll('.btn-num').forEach(btn => {
                    const val = btn.getAttribute('data-val');
                    let allowed = false;
                    if (currentRadixMode === 'HEX') allowed = /^[0-9A-F]$/i.test(val);
                    else if (currentRadixMode === 'DEC') allowed = /^[0-9]$/.test(val);
                    else if (currentRadixMode === 'OCT') allowed = /^[0-7]$/.test(val);
                    else if (currentRadixMode === 'BIN') allowed = /^[0-1]$/.test(val);
                    btn.disabled = !allowed;
                });
                document.getElementById('btn-decimal').disabled = (currentRadixMode !== 'DEC');
            }

            // Radix row changes listener engine wireframes
            document.querySelectorAll('.radix-row').forEach(row => {
                row.addEventListener('click', () => {
                    document.querySelectorAll('.radix-row').forEach(r => r.classList.remove('active'));
                    row.classList.add('active');
                    currentRadixMode = row.getAttribute('data-base');
                    currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                    updateDisplayView();
                });
            });

            /* CONFIGURATION STRIP LISTENERS */
            bitSizeSelect.addEventListener('change', () => {
                bitSize = parseInt(bitSizeSelect.value);
                internalValue = clampOverflow(internalValue);
                currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                updateDisplayView();
            });

            signModeSelect.addEventListener('change', () => {
                isSigned = signModeSelect.value === 'signed';
                internalValue = clampOverflow(internalValue);
                currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                updateDisplayView();
            });

            /* ==========================================================================
               INPUT PROCESSING & REUSABLE COMPUTATION ENGINES
               ========================================================================== */
            function parseInputToBigInt(str) {
                try {
                    let base = radixBases[currentRadixMode];
                    if (str === '0' || !str) return 0n;
                    
                    // Handle negative prefixes explicitly for accurate mapping bounds
                    let isNeg = str.startsWith('-');
                    let cleanStr = isNeg ? str.slice(1) : str;
                    
                    let val = BigInt('0x' + (base === 16 ? cleanStr : parseInt(cleanStr, base).toString(16)));
                    if (isNeg) val = -val;
                    return clampOverflow(val);
                } catch (e) {
                    return 0n;
                }
            }

            function handleValueInput(val) {
                if (isEvaluationReset) { currentInputStr = val; isEvaluationReset = false; }
                else if (currentInputStr === '0') { currentInputStr = val; }
                else { currentInputStr += val; }
                
                internalValue = parseInputToBigInt(currentInputStr);
                updateDisplayView();
            }

            function handleOperatorInput(op) {
                isEvaluationReset = false;
                let displayOp = op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mul' ? '×' : op === 'div' ? '÷' : op;
                expressionStr += currentInputStr + ' ' + displayOp + ' ';
                currentInputStr = '0';
                updateDisplayView();
            }

            function handleAction(action) {
                if (action === 'ac') { currentInputStr = '0'; expressionStr = ''; internalValue = 0n; }
                else if (action === 'ce') { currentInputStr = '0'; internalValue = 0n; }
                else if (action === 'backspace') {
                    currentInputStr = currentInputStr.length > 1 ? currentInputStr.slice(0, -1) : '0';
                    internalValue = parseInputToBigInt(currentInputStr);
                }
                else if (action === 'sign') {
                    internalValue = clampOverflow(-internalValue);
                    currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                }
                else if (action === 'equals') {
                    executeEvaluation();
                }
                updateDisplayView();
            }

            function executeEvaluation() {
                if (!expressionStr) return;
                let fullExpr = expressionStr + currentInputStr;
                
                // Parsing and token normalization sequence engine maps rules
                let cleanExpr = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
                let result = 0n;
                
                try {
                    // Normalize token base architectures to standard decimal scales before dynamic execution arrays evaluate safely
                    // Token replacements regex map pattern
                    let tokensArray = cleanExpr.split(' ');
                    let calculatedStr = '';
                    
                    tokensArray.forEach(t => {
                        if (['+', '-', '*', '/', '%', 'mod'].includes(t)) {
                            calculatedStr += (t === 'mod' ? '%' : t);
                        } else if (t.trim() !== '') {
                            let parsedDecimalVal = parseInputToBigInt(t).toString(10);
                            calculatedStr += `BigInt(${parsedDecimalVal})`;
                        }
                    });

                    result = new Function(`return BigInt(${calculatedStr})`)();
                    result = clampOverflow(result);
                    
                    saveHistoryItem(fullExpr, result.toString(radixBases[currentRadixMode]).toUpperCase());
                    internalValue = result;
                    currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                    expressionStr = '';
                    isEvaluationReset = true;
                } catch(e) {
                    currentInputStr = 'Error';
                    expressionStr = '';
                }
            }

            /* BITWISE AND SHIFT LOGIC ROUTERS */
            document.querySelectorAll('[data-sci]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    createRipple(btn);
                    executeSciOperation(btn.getAttribute('data-sci'));
                });
            });

            function executeSciOperation(op) {
                let shiftAmount = 1n; // Default increment scale step parameter mapping allocation rules
                if(['lsh', 'rsh'].includes(op)) {
                    let promptVal = prompt("Enter Shift Bit Positions Count Range [1-63]:", "1");
                    shiftAmount = promptVal ? BigInt(parseInt(promptVal) || 1) : 0n;
                    if(shiftAmount === 0n) return;
                }

                switch (op) {
                    case 'and': internalValue = clampOverflow(internalValue & parseInputToBigInt(prompt("Enter parameter logic balance operand:"))); break;
                    case 'or':  internalValue = clampOverflow(internalValue | parseInputToBigInt(prompt("Enter parameter logic balance operand:"))); break;
                    case 'xor': internalValue = clampOverflow(internalValue ^ parseInputToBigInt(prompt("Enter parameter logic balance operand:"))); break;
                    case 'not': internalValue = clampOverflow(~internalValue); break;
                    case 'nand': internalValue = clampOverflow(~(internalValue & parseInputToBigInt(prompt("Enter matching target value:")))); break;
                    case 'nor':  internalValue = clampOverflow(~(internalValue | parseInputToBigInt(prompt("Enter matching target value:")))); break;
                    case 'xnor': internalValue = clampOverflow(~(internalValue ^ parseInputToBigInt(prompt("Enter matching target value:")))); break;
                    case 'lsh': internalValue = clampOverflow(internalValue << shiftAmount); break;
                    case 'rsh': internalValue = clampOverflow(internalValue >> shiftAmount); break;
                    case 'rol': 
                        let rCount = parseInt(prompt("Enter Rotate Left Bits positions amount:", "1")) || 1;
                        let rStr = (internalValue & getBitMask()).toString(2).padStart(bitSize, '0');
                        rStr = rStr.slice(rCount) + rStr.slice(0, rCount);
                        internalValue = clampOverflow(BigInt('0b' + rStr));
                        break;
                    case 'ror':
                        let rCountR = parseInt(prompt("Enter Rotate Right Bits positions amount:", "1")) || 1;
                        let rStrR = (internalValue & getBitMask()).toString(2).padStart(bitSize, '0');
                        rStrR = rStrR.slice(-rCountR) + rStrR.slice(0, -rCountR);
                        internalValue = clampOverflow(BigInt('0b' + rStrR));
                        break;
                }
                currentInputStr = internalValue.toString(radixBases[currentRadixMode]).toUpperCase();
                updateDisplayView();
            }

            /* ==========================================================================
               HISTORY LOG ENGINE STORAGE SYSTEMS
               ========================================================================== */
            function initHistory() { try { historyData = JSON.parse(localStorage.getItem('prog_history')) || []; } catch(e) { historyData = []; } renderHistory(); }
            function saveHistoryItem(expr, res) { historyData.unshift({ expr, res, id: Date.now() }); if (historyData.length > 100) historyData.pop(); localStorage.setItem('prog_history', JSON.stringify(historyData)); renderHistory(); }
            function renderHistory() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No program traces cached.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div class="history-item-expr">${item.expr} =</div><div class="history-item-res">${item.res}</div>`;
                    el.addEventListener('click', () => { currentInputStr = item.res; internalValue = parseInputToBigInt(currentInputStr); isEvaluationReset = true; updateDisplayView(); closeHistoryPanel(); });
                    historyList.appendChild(el);
                });
            }
            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('prog_history'); renderHistory(); });
            function openHistoryPanel() { historyPanel.classList.add('open'); }
            function closeHistoryPanel() { historyPanel.classList.remove('open'); }
            historyToggle.addEventListener('click', openHistoryPanel);
            historyClose.addEventListener('click', closeHistoryPanel);

            /* CLIPBOARD ACTIONS & INTERACTIVE ALERTS */
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
            copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(currentInputStr).then(() => showToast(`Copied ${currentRadixMode} Base Data Register`)); });

            function createRipple(button) {
                if (!button) return;
                const circle = document.createElement('span');
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${button.clientWidth / 2 - radius}px`; circle.style.top = `${button.clientHeight / 2 - radius}px`;
                circle.className = 'ripple';
                const prevRipple = button.getElementsByClassName('ripple')[0]; if (prevRipple) prevRipple.remove();
                button.appendChild(circle);
            }

            /* ==========================================================================
               100% FAULTLESS HARDWARE KEYBOARD EVENT LISTENER INTERRUPTS BARS
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
                'a': { action: () => handleValueInput('A'), query: '.btn-num[data-val="A"]' },
                'b': { action: () => handleValueInput('B'), query: '.btn-num[data-val="B"]' },
                'c': { action: () => handleValueInput('C'), query: '.btn-num[data-val="C"]' },
                'd': { action: () => handleValueInput('D'), query: '.btn-num[data-val="D"]' },
                'e': { action: () => handleValueInput('E'), query: '.btn-num[data-val="E"]' },
                'f': { action: () => handleValueInput('F'), query: '.btn-num[data-val="F"]' },
                '+': { action: () => handleOperatorInput('add'), query: '.btn-op[data-op="add"]' },
                '-': { action: () => handleOperatorInput('sub'), query: '.btn-op[data-op="sub"]' },
                '*': { action: () => handleOperatorInput('mul'), query: '.btn-op[data-op="mul"]' },
                '/': { action: () => handleOperatorInput('div'), query: '.btn-op[data-op="div"]' },
                'Enter': { action: () => handleAction('equals'), query: '#btn-equals' },
                '=': { action: () => handleAction('equals'), query: '#btn-equals' },
                'Backspace': { action: () => handleAction('backspace'), query: '.btn-fn[data-action="backspace"]' },
                'Delete': { action: () => handleAction('ce'), query: '.btn-fn[data-action="ce"]' },
                'Escape': { action: () => handleAction('ac'), query: '.btn-fn[data-action="ac"]' }
            };

            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) return;
                if (e.ctrlKey && e.key.toLowerCase() === 'h') { e.preventDefault(); historyPanel.classList.contains('open') ? closeHistoryPanel() : openHistoryPanel(); return; }
                
                const handler = keyboardMap[e.key.toLowerCase()];
                if (handler) {
                    const el = document.querySelector(handler.query);
                    if (el && !el.disabled) {
                        e.preventDefault();
                        handler.action();
                        el.classList.add('keyboard-active');
                        createRipple(el);
                        setTimeout(() => el.classList.remove('keyboard-active'), 120);
                    }
                }
            });

            /* HOOK LIFECYCLE CLICKS INTERFACES */
            document.querySelectorAll('.btn-num, .btn-op, .btn-fn').forEach(button => {
                button.addEventListener('click', () => {
                    const val = button.getAttribute('data-val');
                    const op = button.getAttribute('data-op');
                    const action = button.getAttribute('data-action');

                    if (val && !button.disabled) handleValueInput(val);
                    else if (op && !button.disabled) handleOperatorInput(op);
                    else if (action && !button.disabled) handleAction(action);
                });
                button.addEventListener('mousedown', () => createRipple(button));
                button.addEventListener('touchstart', () => createRipple(button));
            });

            // Self booting components configurations maps lines
            initTheme(); setupCategories(); initHistory(); updateDisplayView();
        });
