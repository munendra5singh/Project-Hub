/**
 * ==========================================================================
 * ExcelSuperGuru - Full Reactive Math-Engine Spreadsheet Simulator
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 20 rows by 10 columns (A-J) standard sheet setup
    ExcelGridEngine.init(20, 10); 
});

const ExcelGridEngine = (() => {
    // Core Engine States
    let dataStore = {}; 
    let activeCellId = "A1";
    let totalRows = 0;
    let totalCols = 0;
    
    // Selection and Edit Tracking States
    let isEditMode = false;
    let selectionStartId = null;
    let selectedCells = new Set(["A1"]);
    let clipboardData = null; 
    
    // History Architecture
    let undoStack = [];
    let redoStack = [];

    // DOM Cache Elements
    const dom = {
        table: document.getElementById('simulatorGridTable'),
        formulaBar: document.getElementById('formulaBar'),
        activeLabel: document.getElementById('activeCellLabel')
    };

    // Helper: Converts column index (0-indexed) to Excel alpha column label
    const getColumnLabel = (index) => {
        let label = '';
        let temp = index;
        while (temp >= 0) {
            label = String.fromCharCode((temp % 26) + 65) + label;
            temp = Math.floor(temp / 26) - 1;
        }
        return label;
    };

    // Helper: Converts Excel column label back to 0-indexed column integer
    const getColumnIndex = (label) => {
        let index = 0;
        const cleaned = label.replace(/[^A-Z]/g, '');
        for (let i = 0; i < cleaned.length; i++) {
            index = index * 26 + (cleaned.charCodeAt(i) - 64);
        }
        return index - 1;
    };

    // Helper: Splits cell ID into structure parts
    const parseCellId = (id) => {
        const match = id.match(/^([A-Z]+)([0-9]+)$/i);
        if (!match) return null;
        return {
            colLabel: match[1].toUpperCase(),
            row: parseInt(match[2], 10),
            colIdx: getColumnIndex(match[1].toUpperCase())
        };
    };

    /**
     * Engine Initializers & Table Layout Builder
     */
    const generateTableGrid = () => {
        if (!dom.table) return;

        let headerRowHTML = '<thead><tr><th class="row-header-cell"></th>';
        for (let c = 0; c < totalCols; c++) {
            headerRowHTML += `<th>${getColumnLabel(c)}</th>`;
        }
        headerRowHTML += '</tr></thead><tbody>';

        let tableBodyHTML = '';
        for (let r = 1; r <= totalRows; r++) {
            tableBodyHTML += `<tr><td class="row-header-cell" style="background-color:#f3f3f3; text-align:center;">${r}</td>`;
            for (let c = 0; c < totalCols; c++) {
                const cellId = `${getColumnLabel(c)}${r}`;
                tableBodyHTML += `
                    <td class="grid-data-cell" data-cell-id="${cellId}" style="position:relative; padding:0; border:1px solid #d3d3d3;">
                        <input type="text" id="input-${cellId}" data-id="${cellId}" autocomplete="off" 
                            style="width:100%; height:100%; border:none; padding: 4px; box-sizing:border-box; outline:none; background:transparent;">
                    </td>
                `;
            }
            tableBodyHTML += '</tr>';
        }
        tableBodyHTML += '</tbody>';
        dom.table.innerHTML = headerRowHTML + tableBodyHTML;
    };

    /**
     * LocalStorage Workbook Operations
     */
    const saveStateToStorage = () => {
        try {
            localStorage.setItem('excel_simulator_store', JSON.stringify(dataStore));
        } catch (e) {
            console.error("Failed storing structural data to LocalStorage", e);
        }
    };

    const loadStateFromStorage = () => {
        try {
            const stored = localStorage.getItem('excel_simulator_store');
            if (stored) {
                dataStore = JSON.parse(stored);
                evaluateGlobalWorksheetDependencyGraph();
                renderAllCells();
            }
        } catch (e) {
            console.error("Failed retrieving data from LocalStorage", e);
        }
    };

    /**
     * History Tracking Manager (Undo / Redo)
     */
    const captureHistoryState = () => {
        undoStack.push(JSON.stringify(dataStore));
        redoStack = []; 
    };

    const performUndo = () => {
        if (undoStack.length === 0) return;
        redoStack.push(JSON.stringify(dataStore));
        dataStore = JSON.parse(undoStack.pop());
        evaluateGlobalWorksheetDependencyGraph();
        renderAllCells();
        updateUIFocus();
    };

    const performRedo = () => {
        if (redoStack.length === 0) return;
        undoStack.push(JSON.stringify(dataStore));
        dataStore = JSON.parse(redoStack.pop());
        evaluateGlobalWorksheetDependencyGraph();
        renderAllCells();
        updateUIFocus();
    };

    /**
     * Parsing Framework for Ranges and Core Mathematical Evaluation
     */
    const parseRangeCoordinates = (rangeStr) => {
        const parts = rangeStr.split(':');
        if (parts.length === 1) return [parts[0].trim().toUpperCase()];
        if (parts.length !== 2) return [];

        const start = parseCellId(parts[0].trim());
        const end = parseCellId(parts[1].trim());

        if (!start || !end) return [];

        const cells = [];
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.colIdx, end.colIdx);
        const maxCol = Math.max(start.colIdx, end.colIdx);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                cells.push(`${getColumnLabel(c)}${r}`);
            }
        }
        return cells;
    };

    const resolveSingleValue = (token) => {
        const cleaned = token.trim();
        if (!cleaned) return 0;

        if (/^[A-Z]+[0-9]+$/i.test(cleaned)) {
            const node = dataStore[cleaned.toUpperCase()];
            if (!node) return 0;
            if (node.value && String(node.value).startsWith('#')) return node.value;
            
            // Try parsing date or numbers
            const valStr = String(node.value);
            if (!isNaN(Date.parse(valStr)) && valStr.includes('-')) return valStr;
            const parsed = parseFloat(node.value);
            return isNaN(parsed) ? node.value : parsed;
        }

        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            return cleaned.slice(1, -1);
        }

        const num = parseFloat(cleaned);
        return isNaN(num) ? cleaned : num;
    };

    const tokenizeExpression = (src) => {
        const tokens = [];
        let i = 0;
        while (i < src.length) {
            let ch = src[i];
            if (/\s/.test(ch)) { i++; continue; }
            if (ch === '"') {
                let str = '"'; i++;
                while (i < src.length && src[i] !== '"') { str += src[i]; i++; }
                if (i < src.length) { str += '"'; i++; }
                tokens.push(str); continue;
            }
            if ('(),:+-*/^='.includes(ch)) {
                tokens.push(ch); i++; continue;
            }
            if (/[A-Za-z0-9.]/.test(ch)) {
                let matchStr = '';
                while (i < src.length && /[A-Za-z0-9._]/.test(src[i])) { matchStr += src[i]; i++; }
                tokens.push(matchStr); continue;
            }
            tokens.push(ch); i++;
        }
        return tokens;
    };

    const processEvaluatedFunction = (name, args) => {
        const cmd = name.toUpperCase();
        const getNumbersOnly = (arr) => arr.map(v => parseFloat(v)).filter(v => !isNaN(v));

        // Expand Ranges inside Function Contexts
        let flatArgs = [];
        args.forEach(arg => {
            if (typeof arg === 'string' && arg.includes(':')) {
                const rangeCells = parseRangeCoordinates(arg);
                rangeCells.forEach(cell => {
                    const node = dataStore[cell];
                    flatArgs.push(node ? node.value : "");
                });
            } else {
                flatArgs.push(arg);
            }
        });

        switch (cmd) {
            case 'SUM':
                return getNumbersOnly(flatArgs).reduce((a, b) => a + b, 0);
            case 'AVERAGE':
                const nums = getNumbersOnly(flatArgs);
                return nums.length === 0 ? "#DIV/0!" : nums.reduce((a, b) => a + b, 0) / nums.length;
            case 'COUNT':
                return flatArgs.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).length;
            case 'COUNTA':
                return flatArgs.filter(v => v !== "" && v !== null && v !== undefined).length;
            case 'MIN':
                const minN = getNumbersOnly(flatArgs);
                return minN.length === 0 ? 0 : Math.min(...minN);
            case 'MAX':
                const maxN = getNumbersOnly(flatArgs);
                return maxN.length === 0 ? 0 : Math.max(...maxN);
            case 'ABS':
                return flatArgs.length === 0 ? "#VALUE!" : Math.abs(parseFloat(flatArgs[0]) || 0);
            case 'ROUND':
                if (flatArgs.length < 2) return "#VALUE!";
                return (parseFloat(flatArgs[0]) || 0).toFixed(parseInt(flatArgs[1], 10) || 0);
            case 'LEN':
                return flatArgs.length === 0 ? 0 : String(flatArgs[0]).length;
            case 'LEFT':
                if (flatArgs.length === 0) return "";
                return String(flatArgs[0]).substring(0, parseInt(flatArgs[1], 10) || 1);
            case 'RIGHT':
                if (flatArgs.length === 0) return "";
                const rStr = String(flatArgs[0]);
                const rLen = parseInt(flatArgs[1], 10) || 1;
                return rStr.substring(rStr.length - rLen);
            case 'IF':
                if (flatArgs.length < 2) return "#N/A";
                return flatArgs[0] ? flatArgs[1] : (flatArgs[2] !== undefined ? flatArgs[2] : "");
            case 'TODAY':
                return new Date().toLocaleDateString();
            case 'NOW':
                return new Date().toLocaleString();
            case 'DATEDIF':
                if (flatArgs.length < 3) return "#VALUE!";
                const d1 = new Date(flatArgs[0]);
                const d2 = new Date(flatArgs[1]);
                const unit = String(flatArgs[2]).toLowerCase();
                if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return "#VALUE!";
                
                const dayDiff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
                if (unit === 'd') return dayDiff;
                if (unit === 'm') return (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
                if (unit === 'y') return d2.getFullYear() - d1.getFullYear();
                return "#VALUE!";
            default:
                return "#NAME?";
        }
    };

    const computeExpressionValue = (expression, visiting = new Set()) => {
        if (!expression || !String(expression).startsWith('=')) return expression;
        
        try {
            const rawTokens = tokenizeExpression(expression.substring(1));
            
            // Evaluates mathematical structures or handles functions hierarchically
            const parseStructure = () => {
                let tokenList = [];
                
                for (let idx = 0; idx < rawTokens.length; idx++) {
                    let tok = rawTokens[idx];
                    
                    if (/[A-Z]+/i.test(tok) && rawTokens[idx + 1] === '(') {
                        // Gather function boundaries cleanly
                        let fnName = tok;
                        idx += 2; 
                        let depth = 1;
                        let fnBodyTokens = [];
                        while (idx < rawTokens.length && depth > 0) {
                            if (rawTokens[idx] === '(') depth++;
                            if (rawTokens[idx] === ')') depth--;
                            if (depth > 0) fnBodyTokens.push(rawTokens[idx]);
                            idx++;
                        }
                        idx--; 

                        // Parse parameter divisions
                        let args = [];
                        let currArg = [];
                        fnBodyTokens.forEach(ft => {
                            if (ft === ',') {
                                args.push(currArg.join(''));
                                currArg = [];
                            } else {
                                currArg.push(ft);
                            }
                        });
                        if (currArg.length > 0) args.push(currArg.join(''));
                        
                        // Check range specs
                        let evaluatedArgs = args.map(a => {
                            if (a.includes(':')) return a; 
                            return computeExpressionValue('=' + a, visiting);
                        });

                        tokenList.push(processEvaluatedFunction(fnName, evaluatedArgs));
                    } else {
                        tokenList.push(tok);
                    }
                }

                // Resolve references to safe values
                let evaluableString = tokenList.map(t => {
                    if (/^[A-Z]+[0-9]+$/i.test(String(t))) {
                        if (visiting.has(t.toUpperCase())) return "#REF!";
                        let resolved = resolveSingleValue(t);
                        if (!isNaN(Date.parse(resolved)) && String(resolved).includes('-')) {
                            return String(new Date(resolved).getTime() / (1000*60*60*24)); // Convert date to serial representation days
                        }
                        return isNaN(parseFloat(resolved)) ? `"${resolved}"` : resolved;
                    }
                    return t;
                }).join('');

                // Secure JavaScript dynamic calculation sandbox
                const result = new Function(`return (${evaluableString});`)();
                return result !== undefined ? result.toString() : "";
            };

            return parseStructure();
        } catch (err) {
            return "#VALUE!";
        }
    };

    const evaluateGlobalWorksheetDependencyGraph = () => {
        const cellIds = Object.keys(dataStore);
        const processing = new Set();
        const processed = new Set();

        const evaluateNode = (id) => {
            if (processed.has(id)) return;
            if (processing.has(id)) {
                dataStore[id].value = "#REF!";
                return;
            }

            processing.add(id);
            const node = dataStore[id];
            
            if (node && node.raw.startsWith('=')) {
                const cellsFound = node.raw.toUpperCase().match(/[A-Z]+[0-9]+/g) || [];
                cellsFound.forEach(depId => {
                    if (dataStore[depId]) evaluateNode(depId);
                });
                
                node.value = computeExpressionValue(node.raw, processing);
            } else if (node) {
                node.value = node.raw;
            }

            processing.delete(id);
            processed.add(id);
        };

        cellIds.forEach(id => evaluateNode(id));
    };

    /**
     * Interface Rendering Operations
     */
    const renderCell = (id) => {
        const inputEl = document.getElementById(`input-${id}`);
        if (!inputEl) return;

        const node = dataStore[id];
        let displayValue = node ? (node.raw.startsWith('=') ? node.value : node.raw) : "";
        
        if (id === activeCellId && isEditMode) {
            inputEl.value = node ? node.raw : "";
        } else {
            inputEl.value = displayValue;
        }
    };

    const renderAllCells = () => {
        for (let r = 1; r <= totalRows; r++) {
            for (let c = 0; c < totalCols; c++) {
                renderCell(`${getColumnLabel(c)}${r}`);
            }
        }
        applyUIGridHighlightClasses();
    };

    const applyUIGridHighlightClasses = () => {
        const cells = dom.table.querySelectorAll('td.grid-data-cell');
        cells.forEach(td => {
            td.style.outline = 'none';
            td.style.zIndex = 'auto';
            td.style.backgroundColor = 'transparent';
        });

        selectedCells.forEach(id => {
            const inputEl = document.getElementById(`input-${id}`);
            if (inputEl && inputEl.parentElement) {
                inputEl.parentElement.style.backgroundColor = 'rgba(33, 115, 70, 0.08)';
            }
        });

        const activeInput = document.getElementById(`input-${activeCellId}`);
        if (activeInput && activeInput.parentElement) {
            const parent = activeInput.parentElement;
            parent.style.outline = '2px solid #217346';
            parent.style.zIndex = '10';
        }
    };

    const updateUIFocus = () => {
        if (dom.activeLabel) dom.activeLabel.textContent = activeCellId;
        
        const node = dataStore[activeCellId];
        const rawFormulaStr = node ? node.raw : "";
        if (dom.formulaBar && document.activeElement !== dom.formulaBar) {
            dom.formulaBar.value = rawFormulaStr;
        }

        renderAllCells();

        const activeInput = document.getElementById(`input-${activeCellId}`);
        if (activeInput && !isEditMode) {
            activeInput.focus();
            activeInput.parentElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    };

    /**
     * Cell Editing States
     */
    const enterEditMode = () => {
        if (isEditMode) return;
        isEditMode = true;
        const inputEl = document.getElementById(`input-${activeCellId}`);
        if (inputEl) {
            const node = dataStore[activeCellId];
            inputEl.value = node ? node.raw : "";
            inputEl.focus();
            const len = inputEl.value.length;
            inputEl.setSelectionRange(len, len);
        }
    };

    const exitAndCommitEditMode = () => {
        if (!isEditMode) return;
        isEditMode = false;
        const inputEl = document.getElementById(`input-${activeCellId}`);
        if (inputEl) {
            const nextValue = inputEl.value;
            const previousRecord = dataStore[activeCellId];
            
            if (!previousRecord || previousRecord.raw !== nextValue) {
                captureHistoryState();
                if (!dataStore[activeCellId]) dataStore[activeCellId] = { raw: "", value: "" };
                dataStore[activeCellId].raw = nextValue;
                evaluateGlobalWorksheetDependencyGraph();
                saveStateToStorage();
            }
        }
        updateUIFocus();
    };

    const cancelEditMode = () => {
        if (!isEditMode) return;
        isEditMode = false;
        updateUIFocus();
    };

    const shiftActiveCellPosition = (rowOffset, colOffset) => {
        const parsed = parseCellId(activeCellId);
        if (!parsed) return;

        let nextRow = parsed.row + rowOffset;
        let nextColIdx = parsed.colIdx + colOffset;

        if (nextRow < 1) nextRow = 1;
        if (nextRow > totalRows) nextRow = totalRows;
        if (nextColIdx < 0) nextColIdx = 0;
        if (nextColIdx >= totalCols) nextColIdx = totalCols - 1;

        activeCellId = `${getColumnLabel(nextColIdx)}${nextRow}`;
        selectionStartId = activeCellId;
        selectedCells = new Set([activeCellId]);
        
        updateUIFocus();
    };

    const expandSelectionArrayToTarget = (targetId) => {
        if (!selectionStartId) selectionStartId = activeCellId;
        const start = parseCellId(selectionStartId);
        const end = parseCellId(targetId);
        if (!start || !end) return;

        const newSelection = new Set();
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.colIdx, end.colIdx);
        const maxCol = Math.max(start.colIdx, end.colIdx);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                newSelection.add(`${getColumnLabel(c)}${r}`);
            }
        }
        selectedCells = newSelection;
        applyUIGridHighlightClasses();
    };

    /**
     * Clipboard Utilities (Copy / Cut / Paste Engine)
     */
    const transformFormulaReferences = (formula, rowOffset, colOffset) => {
        if (!formula.startsWith('=')) return formula;
        return formula.replace(/([A-Z]+)([0-9]+)/g, (match, colStr, rowStr) => {
            const r = parseInt(rowStr, 10);
            const cIdx = getColumnIndex(colStr);
            return `${getColumnLabel(cIdx + colOffset)}${r + rowOffset}`;
        });
    };

    const executeClipboardCopyOperation = (isCut = false) => {
        clipboardData = {
            type: isCut ? 'cut' : 'copy',
            startCell: activeCellId,
            matrix: {}
        };
        selectedCells.forEach(id => {
            if (dataStore[id]) {
                clipboardData.matrix[id] = { ...dataStore[id] };
            }
        });
    };

    const executeClipboardPasteOperation = (pasteValuesOnly = false) => {
        if (!clipboardData) return;
        captureHistoryState();

        const srcPivot = parseCellId(clipboardData.startCell);
        const destPivot = parseCellId(activeCellId);
        if (!srcPivot || !destPivot) return;

        const rowDiff = destPivot.row - srcPivot.row;
        const colDiff = destPivot.colIdx - srcPivot.colIdx;

        Object.keys(clipboardData.matrix).forEach(srcId => {
            const srcCell = parseCellId(srcId);
            const targetRow = srcCell.row + rowDiff;
            const targetColStr = getColumnLabel(srcCell.colIdx + colDiff);
            const targetId = `${targetColStr}${targetRow}`;

            const checkCell = parseCellId(targetId);
            if (!checkCell || checkCell.row > totalRows || checkCell.colIdx >= totalCols) return;

            const nodeData = clipboardData.matrix[srcId];
            if (!dataStore[targetId]) dataStore[targetId] = { raw: "", value: "" };

            if (pasteValuesOnly) {
                dataStore[targetId].raw = nodeData.value;
                dataStore[targetId].value = nodeData.value;
            } else {
                if (clipboardData.type === 'copy') {
                    dataStore[targetId].raw = transformFormulaReferences(nodeData.raw, rowDiff, colDiff);
                } else {
                    dataStore[targetId].raw = nodeData.raw;
                }
            }

            if (clipboardData.type === 'cut') {
                delete dataStore[srcId];
                const srcInput = document.getElementById(`input-${srcId}`);
                if (srcInput) srcInput.value = "";
            }
        });

        if (clipboardData.type === 'cut') clipboardData = null;

        evaluateGlobalWorksheetDependencyGraph();
        saveStateToStorage();
        renderAllCells();
    };

    /**
     * Event Binding Interceptors
     */
    const bindInteractiveEventLayer = () => {
        if (dom.table) {
            dom.table.addEventListener('mousedown', (e) => {
                const targetInput = e.target.closest('input');
                if (!targetInput) return;

                const cellId = targetInput.getAttribute('data-id');
                if (!cellId) return;

                if (e.shiftKey) {
                    expandSelectionArrayToTarget(cellId);
                } else {
                    if (cellId !== activeCellId && isEditMode) {
                        exitAndCommitEditMode();
                    }
                    activeCellId = cellId;
                    selectionStartId = cellId;
                    selectedCells = new Set([cellId]);
                    updateUIFocus();
                }

                const runMouseDragMove = (moveEvent) => {
                    const dragInput = moveEvent.target.closest('input');
                    if (dragInput) {
                        expandSelectionArrayToTarget(dragInput.getAttribute('data-id'));
                    }
                };

                const clearMouseDragTrack = () => {
                    window.removeEventListener('mousemove', runMouseDragMove);
                    window.removeEventListener('mouseup', clearMouseDragTrack);
                };

                window.addEventListener('mousemove', runMouseDragMove);
                window.addEventListener('mouseup', clearMouseDragTrack);
            });

            dom.table.addEventListener('dblclick', (e) => {
                const targetInput = e.target.closest('input');
                if (targetInput) enterEditMode();
            });

            dom.table.addEventListener('keydown', (e) => {
                const targetInput = e.target.closest('input');
                if (!targetInput) return;

                if (isEditMode) {
                    if (e.key === 'Enter') {
                        e.preventDefault(); exitAndCommitEditMode(); shiftActiveCellPosition(1, 0);
                    } else if (e.key === 'Tab') {
                        e.preventDefault(); exitAndCommitEditMode(); shiftActiveCellPosition(0, e.shiftKey ? -1 : 1);
                    } else if (e.key === 'Escape') {
                        e.preventDefault(); cancelEditMode();
                    }
                    return;
                }

                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                    e.preventDefault(); executeClipboardCopyOperation(false); return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
                    e.preventDefault(); executeClipboardCopyOperation(true); return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                    e.preventDefault(); executeClipboardPasteOperation(e.shiftKey); return; 
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                    e.preventDefault(); performUndo(); return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                    e.preventDefault(); performRedo(); return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                    e.preventDefault();
                    const allCells = new Set();
                    for (let r=1; r<=totalRows; r++) {
                        for (let c=0; c<totalCols; c++) allCells.add(`${getColumnLabel(c)}${r}`);
                    }
                    selectedCells = allCells; applyUIGridHighlightClasses(); return;
                }

                switch (e.key) {
                    case 'ArrowUp': e.preventDefault(); shiftActiveCellPosition(-1, 0); break;
                    case 'ArrowDown': e.preventDefault(); shiftActiveCellPosition(1, 0); break;
                    case 'ArrowLeft': e.preventDefault(); shiftActiveCellPosition(0, -1); break;
                    case 'ArrowRight': e.preventDefault(); shiftActiveCellPosition(0, 1); break;
                    case 'Enter':
                        e.preventDefault();
                        if (e.shiftKey) shiftActiveCellPosition(-1, 0);
                        else shiftActiveCellPosition(1, 0);
                        break;
                    case 'Tab':
                        e.preventDefault();
                        if (e.shiftKey) shiftActiveCellPosition(0, -1);
                        else shiftActiveCellPosition(0, 1);
                        break;
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        captureHistoryState();
                        selectedCells.forEach(id => { delete dataStore[id]; });
                        evaluateGlobalWorksheetDependencyGraph();
                        saveStateToStorage();
                        renderAllCells();
                        break;
                    case 'F2': e.preventDefault(); enterEditMode(); break;
                    case 'Escape': e.preventDefault(); cancelEditMode(); break;
                    case 'Home':
                        e.preventDefault();
                        if (e.ctrlKey) shiftActiveCellPosition(-totalRows, -totalCols);
                        else shiftActiveCellPosition(0, -parseCellId(activeCellId).colIdx);
                        break;
                    case 'End':
                        e.preventDefault(); if (e.ctrlKey) shiftActiveCellPosition(totalRows, totalCols); break;
                    case 'PageUp': e.preventDefault(); shiftActiveCellPosition(-10, 0); break;
                    case 'PageDown': e.preventDefault(); shiftActiveCellPosition(10, 0); break;
                    default:
                        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                            enterEditMode();
                        }
                        break;
                }
            });
        }

        if (dom.formulaBar) {
            dom.formulaBar.addEventListener('input', () => {
                const activeInput = document.getElementById(`input-${activeCellId}`);
                if (activeInput) {
                    // Instantly sync value inside active cell
                    activeInput.value = dom.formulaBar.value;
                    if (!isEditMode) isEditMode = true;
                }
            });

            dom.formulaBar.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    captureHistoryState();
                    if (!dataStore[activeCellId]) dataStore[activeCellId] = { raw: "", value: "" };
                    dataStore[activeCellId].raw = dom.formulaBar.value;
                    isEditMode = false;
                    evaluateGlobalWorksheetDependencyGraph();
                    saveStateToStorage();
                    dom.formulaBar.blur();
                    shiftActiveCellPosition(1, 0);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    isEditMode = false;
                    dom.formulaBar.blur();
                    updateUIFocus();
                }
            });
        }
    };

    return {
        init: (rows, cols) => {
            totalRows = rows;
            totalCols = cols;
            generateTableGrid();
            bindInteractiveEventLayer();
            loadStateFromStorage();
            updateUIFocus();
            console.log(`Excel Simulator Engine initialized mapping grid fields sized: [${rows}x${cols}]`);
        }
    };
})();

export { ExcelGridEngine };