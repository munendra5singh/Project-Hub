/* unit_converter-engine.js — extracted verbatim from unit_converter.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const categorySelect = document.getElementById('category-select');
            const fromUnitSelect = document.getElementById('from-unit-select');
            const toUnitSelect = document.getElementById('to-unit-select');
            const inputValue = document.getElementById('input-value');
            const outputDisplay = document.getElementById('output-display');
            const swapUnitsBtn = document.getElementById('swap-units-btn');
            const precisionSelect = document.getElementById('precision-select');
            const dataStdWrapper = document.getElementById('data-standard-wrapper');
            const dataStdSelect = document.getElementById('data-standard-select');
            const formulaText = document.getElementById('formula-text');
            
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const copyBtn = document.getElementById('copy-btn');
            const clearBtn = document.getElementById('clear-btn');
            const logCalcBtn = document.getElementById('log-calc-btn');
            const toast = document.getElementById('toast');

            let historyData = [];

            const unitDatabase = {
                length: {
                    title: "Length",
                    units: {
                        mm: { name: "Millimeter", factor: 0.001 },
                        cm: { name: "Centimeter", factor: 0.01 },
                        m: { name: "Meter", factor: 1 },
                        km: { name: "Kilometer", factor: 1000 },
                        in: { name: "Inch", factor: 0.0254 },
                        ft: { name: "Foot", factor: 0.3048 },
                        yd: { name: "Yard", factor: 0.9144 },
                        mi: { name: "Mile", factor: 1609.344 },
                        nmi: { name: "Nautical Mile", factor: 1852 }
                    }
                },
                weight: {
                    title: "Weight / Mass",
                    units: {
                        mg: { name: "Milligram", factor: 0.000001 },
                        g: { name: "Gram", factor: 0.001 },
                        kg: { name: "Kilogram", factor: 1 },
                        ton: { name: "Metric Ton", factor: 1000 },
                        oz: { name: "Ounce", factor: 0.028349523125 },
                        lb: { name: "Pound", factor: 0.45359237 },
                        st: { name: "Stone", factor: 6.35029318 }
                    }
                },
                area: {
                    title: "Area",
                    units: {
                        m2: { name: "Square Meter", factor: 1 },
                        km2: { name: "Square Kilometer", factor: 1000000 },
                        ft2: { name: "Square Foot", factor: 0.09290304 },
                        in2: { name: "Square Inch", factor: 0.00064516 },
                        yd2: { name: "Square Yard", factor: 0.83612736 },
                        acre: { name: "Acre", factor: 4046.8564224 },
                        hectare: { name: "Hectare", factor: 10000 }
                    }
                },
                volume: {
                    title: "Volume",
                    units: {
                        ml: { name: "Milliliter", factor: 0.000001 },
                        l: { name: "Liter", factor: 0.001 },
                        m3: { name: "Cubic Meter", factor: 1 },
                        cm3: { name: "Cubic Centimeter", factor: 0.000001 },
                        gal_us: { name: "Gallon (US)", factor: 0.003785411784 },
                        gal_uk: { name: "Gallon (UK)", factor: 0.00454609 },
                        pint: { name: "Pint", factor: 0.000473176473 },
                        cup: { name: "Cup", factor: 0.0002365882365 }
                    }
                },
                speed: {
                    title: "Speed",
                    units: {
                        ms: { name: "Meter/Second", factor: 1 },
                        kmh: { name: "Kilometer/Hour", factor: 1 / 3.6 },
                        mph: { name: "Mile/Hour", factor: 0.44704 },
                        knot: { name: "Knot", factor: 0.514444 },
                        fts: { name: "Foot/Second", factor: 0.3048 }
                    }
                },
                pressure: {
                    title: "Pressure",
                    units: {
                        pa: { name: "Pascal", factor: 1 },
                        kpa: { name: "Kilopascal", factor: 1000 },
                        bar: { name: "Bar", factor: 100000 },
                        psi: { name: "PSI", factor: 6894.757293 },
                        atm: { name: "Atmosphere", factor: 101325 },
                        torr: { name: "Torr", factor: 133.322368 }
                    }
                },
                density: {
                    title: "Density",
                    units: {
                        kgm3: { name: "kg/m³", factor: 1 },
                        gcm3: { name: "g/cm³", factor: 1000 },
                        lbft3: { name: "lb/ft³", factor: 16.018463 },
                        lbin3: { name: "lb/in³", factor: 27679.904 }
                    }
                },
                energy: {
                    title: "Energy",
                    units: {
                        j: { name: "Joule", factor: 1 },
                        kj: { name: "Kilojoule", factor: 1000 },
                        cal: { name: "Calorie", factor: 4.184 },
                        kcal: { name: "Kilocalorie", factor: 4184 },
                        wh: { name: "Watt Hour", factor: 3600 },
                        kwh: { name: "Kilowatt Hour", factor: 3600000 },
                        ev: { name: "Electron Volt", factor: 1.602176634e-19 }
                    }
                },
                power: {
                    title: "Power",
                    units: {
                        w: { name: "Watt", factor: 1 },
                        kw: { name: "Kilowatt", factor: 1000 },
                        hp: { name: "Horsepower", factor: 745.699872 },
                        mw: { name: "Megawatt", factor: 1000000 }
                    }
                },
                force: {
                    title: "Force",
                    units: {
                        n: { name: "Newton", factor: 1 },
                        kn: { name: "Kilonewton", factor: 1000 },
                        lbf: { name: "Pound-force", factor: 4.44822161526 },
                        dyne: { name: "Dyne", factor: 0.00001 }
                    }
                },
                time: {
                    title: "Time",
                    units: {
                        ns: { name: "Nanosecond", factor: 1e-9 },
                        us: { name: "Microsecond", factor: 1e-6 },
                        ms: { name: "Millisecond", factor: 0.001 },
                        s: { name: "Second", factor: 1 },
                        min: { name: "Minute", factor: 60 },
                        hr: { name: "Hour", factor: 3600 },
                        day: { name: "Day", factor: 86400 },
                        week: { name: "Week", factor: 604800 },
                        month: { name: "Month", factor: 2629746 },
                        year: { name: "Year", factor: 31556952 }
                    }
                },
                fuel: {
                    title: "Fuel Economy",
                    units: {
                        kml: { name: "km/L", type: "direct" },
                        l100: { name: "L/100 km", type: "inverse" },
                        mpg_us: { name: "MPG (US)", type: "direct" },
                        mpg_uk: { name: "MPG (UK)", type: "direct" }
                    }
                },
                data: {
                    title: "Data Storage",
                    units: {
                        bit: { name: "Bit", power: 0 },
                        byte: { name: "Byte", power: 1 },
                        kb: { name: "Kilobyte", power: 2 },
                        mb: { name: "Megabyte", power: 3 },
                        gb: { name: "Gigabyte", power: 4 },
                        tb: { name: "Terabyte", power: 5 },
                        pb: { name: "Petabyte", power: 6 }
                    }
                },
                angle: {
                    title: "Angle",
                    units: {
                        deg: { name: "Degree", factor: 1 },
                        rad: { name: "Radian", factor: 180 / Math.PI },
                        grad: { name: "Gradian", factor: 0.9 },
                        rev: { name: "Revolution", factor: 360 }
                    }
                },
                temperature: {
                    title: "Temperature",
                    units: {
                        c: { name: "Celsius" },
                        f: { name: "Fahrenheit" },
                        k: { name: "Kelvin" }
                    }
                }
            };

            /* THEME MODE HARNESS ENGINE */
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

            /* SETUP */
            function setupCategories() {
                categorySelect.innerHTML = '';
                Object.keys(unitDatabase).forEach(key => {
                    const opt = document.createElement('option');
                    opt.value = key; opt.textContent = unitDatabase[key].title;
                    categorySelect.appendChild(opt);
                });
                populateUnits();
            }

            function populateUnits() {
                const category = categorySelect.value;
                const units = unitDatabase[category].units;
                fromUnitSelect.innerHTML = ''; toUnitSelect.innerHTML = '';
                
                Object.keys(units).forEach((key, idx) => {
                    const optFrom = document.createElement('option');
                    optFrom.value = key; optFrom.textContent = units[key].name;
                    fromUnitSelect.appendChild(optFrom);

                    const optTo = document.createElement('option');
                    optTo.value = key; optTo.textContent = units[key].name;
                    if(idx === 1 || Object.keys(units).length === 1) optTo.selected = true;
                    toUnitSelect.appendChild(optTo);
                });

                dataStdWrapper.style.display = (category === 'data') ? 'block' : 'none';
                executeConversion();
            }

            categorySelect.addEventListener('change', populateUnits);
            fromUnitSelect.addEventListener('change', executeConversion);
            toUnitSelect.addEventListener('change', executeConversion);
            inputValue.addEventListener('input', executeConversion);
            precisionSelect.addEventListener('change', executeConversion);
            dataStdSelect.addEventListener('change', executeConversion);

            /* CALCULATIONS */
            function executeConversion() {
                const category = categorySelect.value;
                const fromUnit = fromUnitSelect.value;
                const toUnit = toUnitSelect.value;
                let value = parseFloat(inputValue.value);

                if (isNaN(value)) { outputDisplay.textContent = '0'; formulaText.textContent = 'Awaiting valid numeric input entry...'; return; }

                let result = 0;
                let formulaStr = '';
                const precision = parseInt(precisionSelect.value);

                if (category === 'temperature') {
                    result = convertTemperature(value, fromUnit, toUnit);
                    formulaStr = getTemperatureFormula(fromUnit, toUnit);
                } else if (category === 'data') {
                    const base = parseInt(dataStdSelect.value);
                    result = convertDataStorage(value, fromUnit, toUnit, base);
                    formulaStr = `Multiply by base ${base} step differentials`;
                } else if (category === 'fuel') {
                    result = convertFuelEconomy(value, fromUnit, toUnit);
                    formulaStr = `Fuel conversion factors rules applied`;
                } else {
                    const db = unitDatabase[category].units;
                    const valInBase = value * db[fromUnit].factor;
                    result = valInBase / db[toUnit].factor;
                    formulaStr = `[Value] × ${formatNumber(db[fromUnit].factor)} / ${formatNumber(db[toUnit].factor)}`;
                }

                outputDisplay.textContent = formatNumber(result, precision);
                formulaText.textContent = formulaStr;
            }

            function convertTemperature(v, f, t) {
                if (f === t) return v;
                let c = v;
                if (f === 'f') c = (v - 32) * 5/9;
                if (f === 'k') c = v - 273.15;
                if (t === 'c') return c;
                if (t === 'f') return (c * 9/5) + 32;
                if (t === 'k') return c + 273.15;
                return 0;
            }

            function getTemperatureFormula(f, t) {
                if (f === t) return 'No operation';
                if (f==='c' && t==='f') return '(°C × 9/5) + 32';
                if (f==='c' && t==='k') return '°C + 273.15';
                if (f==='f' && t==='c') return '(°F - 32) × 5/9';
                if (f==='f' && t==='k') return '(°F - 32) × 5/9 + 273.15';
                if (f==='k' && t==='c') return 'K - 273.15';
                if (f==='k' && t==='f') return '(K - 273.15) × 9/5 + 32';
                return '';
            }

            function convertDataStorage(v, f, t, base) {
                const db = unitDatabase.data.units;
                if(f === 'bit' && t !== 'bit') { v = v / 8; f = 'byte'; }
                let bytes = v * Math.pow(base, db[f].power - 1);
                if(t === 'bit') return (bytes * 8);
                return bytes / Math.pow(base, db[t].power - 1);
            }

            function convertFuelEconomy(v, f, t) {
                if (f === t) return v;
                let kml = v;
                if (f === 'l100') kml = 100 / v;
                if (f === 'mpg_us') kml = v * 0.425143707;
                if (f === 'mpg_uk') kml = v * 0.35400619;
                if (t === 'kml') return kml;
                if (t === 'l100') return 100 / kml;
                if (t === 'mpg_us') return kml / 0.425143707;
                if (t === 'mpg_uk') return kml / 0.35400619;
                return 0;
            }

            function formatNumber(num, decimals = 4) {
                if(num === 0) return '0';
                if (Math.abs(num) < 1e-4 || Math.abs(num) > 1e9) return num.toExponential(decimals);
                return parseFloat(num.toFixed(decimals)).toLocaleString('en-US', {maximumFractionDigits: decimals});
            }

            swapUnitsBtn.addEventListener('click', () => {
                const temp = fromUnitSelect.value;
                fromUnitSelect.value = toUnitSelect.value;
                toUnitSelect.value = temp;
                executeConversion();
            });

            clearBtn.addEventListener('click', () => {
                inputValue.value = '1'; executeConversion();
            });

            /* HISTORY LOG SYSTEMS */
            function initHistory() {
                try { historyData = JSON.parse(localStorage.getItem('unit_history')) || []; } catch(e) { historyData = []; }
                renderHistory();
            }

            logCalcBtn.addEventListener('click', () => {
                const catTitle = unitDatabase[categorySelect.value].title;
                const valFrom = inputValue.value;
                const unitFrom = fromUnitSelect.options[fromUnitSelect.selectedIndex].text;
                const valTo = outputDisplay.textContent;
                const unitTo = toUnitSelect.options[toUnitSelect.selectedIndex].text;

                const logItem = {
                    id: Date.now(),
                    meta: catTitle,
                    expr: `${valFrom} ${unitFrom} = ${valTo} ${unitTo}`
                };

                historyData.unshift(logItem);
                if(historyData.length > 100) historyData.pop();
                localStorage.setItem('unit_history', JSON.stringify(historyData));
                renderHistory();
                showToast("Conversion logged successfully");
            });

            function renderHistory() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No metrics conversions logged yet</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `
                        <div class="history-text">
                            <span class="history-meta">${item.meta}</span>
                            <span class="history-expr">${item.expr}</span>
                        </div>
                        <button class="btn-delete-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                    `;
                    el.querySelector('.btn-delete-item').addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteHistoryItem(item.id);
                    });
                    historyList.appendChild(el);
                });
            }

            function deleteHistoryItem(id) {
                historyData = historyData.filter(x => x.id !== id);
                localStorage.setItem('unit_history', JSON.stringify(historyData));
                renderHistory();
            }

            clearHistoryBtn.addEventListener('click', () => {
                historyData = []; localStorage.removeItem('unit_history'); renderHistory();
            });

            function openHistoryPanel() { historyPanel.classList.add('open'); }
            function closeHistoryPanel() { historyPanel.classList.remove('open'); }
            historyToggle.addEventListener('click', openHistoryPanel);
            historyClose.addEventListener('click', closeHistoryPanel);

            /* CLIPBOARD INTERACTION MECHANICS */
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(outputDisplay.textContent).then(() => showToast("Copied result entry"));
            });

            setupCategories(); initTheme(); initHistory();
        });
