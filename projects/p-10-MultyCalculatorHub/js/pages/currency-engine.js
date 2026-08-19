/* currency-engine.js — extracted verbatim from currency.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            const stagePane = document.getElementById('stage-viewport-pane');
            const cacheWarningStrip = document.getElementById('cache-warning-strip');
            
            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');
            const toast = document.getElementById('toast');

            let historyData = [];
            let currentFromCode = 'USD';
            let currentToCode = 'INR';

            const countryCurrencies = [
                {code: "USD", name: "USD - US Dollar"},
                {code: "INR", name: "INR - Indian Rupee"},
                {code: "EUR", name: "EUR - Euro"},
                {code: "GBP", name: "GBP - British Pound"},
                {code: "JPY", name: "JPY - Japanese Yen"},
                {code: "AUD", name: "AUD - Australian Dollar"},
                {code: "CAD", name: "CAD - Canadian Dollar"},
                {code: "CHF", name: "CHF - Swiss Franc"},
                {code: "CNY", name: "CNY - Chinese Yuan"},
                {code: "SGD", name: "SGD - Singapore Dollar"},
                {code: "AED", name: "AED - UAE Dirham"},
                {code: "SAR", name: "SAR - Saudi Riyal"},
                {code: "NZD", name: "NZD - New Zealand Dollar"},
                {code: "PKR", name: "PKR - Pakistani Rupee"},
                {code: "BDT", name: "BDT - Bangladeshi Taka"},
                {code: "NPR", name: "NPR - Nepalese Rupee"},
                {code: "LKR", name: "LKR - Sri Lankan Rupee"},
                {code: "ZAR", name: "ZAR - South African Rand"},
                {code: "RUB", name: "RUB - Russian Ruble"},
                {code: "BRL", name: "BRL - Brazilian Real"},
                {code: "MXN", name: "MXN - Mexican Peso"},
                {code: "TRY", name: "TRY - Turkish Lira"},
                {code: "THB", name: "THB - Thai Baht"},
                {code: "MYR", name: "MYR - Malaysian Ringgit"},
                {code: "HKD", name: "HKD - Hong Kong Dollar"},
                {code: "KRW", name: "KRW - South Korean Won"},
                {code: "KWD", name: "KWD - Kuwaiti Dinar"},
                {code: "BHD", name: "BHD - Bahraini Dinar"},
                {code: "OMR", name: "OMR - Omani Rial"},
                {code: "QAR", name: "QAR - Qatari Riyal"},
                {code: "IDR", name: "IDR - Indonesian Rupiah"},
                {code: "PHP", name: "PHP - Philippine Peso"},
                {code: "TWD", name: "TWD - Taiwan Dollar"},
                {code: "VND", name: "VND - Vietnamese Dong"},
                {code: "EGP", name: "EGP - Egyptian Pound"},
                {code: "ILS", name: "ILS - Israeli Shekel"},
                {code: "ARS", name: "ARS - Argentine Peso"},
                {code: "CLP", name: "CLP - Chilean Peso"},
                {code: "COP", name: "COP - Colombian Peso"},
                {code: "PEN", name: "PEN - Peruvian Sol"},
                {code: "NGN", name: "NGN - Nigerian Naira"},
                {code: "AFN", name: "AFN - Afghan Afghani"},
                {code: "ALL", name: "ALL - Albanian Lek"},
                {code: "AMD", name: "AMD - Armenian Dram"},
                {code: "ANG", name: "ANG - Netherlands Antillean Guilder"},
                {code: "AOA", name: "AOA - Angolan Kwanza"},
                {code: "AWG", name: "AWG - Aruban Florin"},
                {code: "AZN", name: "AZN - Azerbaijani Manat"},
                {code: "BAM", name: "BAM - Bosnia-Herzegovina Convertible Mark"},
                {code: "BBB", name: "BBD - Barbadian Dollar"},
                {code: "BGN", name: "BGN - Bulgarian Lev"},
                {code: "BIF", name: "BIF - Burundian Franc"},
                {code: "BMD", name: "BMD - Bermudan Dollar"},
                {code: "BND", name: "BND - Brunei Dollar"},
                {code: "BOB", name: "BOB - Bolivian Boliviano"},
                {code: "BSD", name: "BSD - Bahamian Dollar"},
                {code: "BTN", name: "BTN - Bhutanese Ngultrum"},
                {code: "BWP", name: "BWP - Botswanan Pula"},
                {code: "BYN", name: "BYN - Belarusian Ruble"},
                {code: "BZE", name: "BZD - Belize Dollar"},
                {code: "CDF", name: "CDF - Congolese Franc"},
                {code: "CRC", name: "CRC - Costa Rican Colón"},
                {code: "CUC", name: "CUC - Cuban Convertible Peso"},
                {code: "CUP", name: "CUP - Cuban Peso"},
                {code: "CVE", name: "CVE - Cape Verdean Escudo"},
                {code: "CZK", name: "CZK - Czech Koruna"},
                {code: "DJF", name: "DJF - Djiboutian Franc"},
                {code: "DKK", name: "DKK - Danish Krone"},
                {code: "DOP", name: "DOP - Dominican Peso"},
                {code: "DZD", name: "DZD - Algerian Dinar"},
                {code: "ERN", name: "ERN - Eritrean Nakfa"},
                {code: "ETB", name: "ETB - Ethiopian Birr"},
                {code: "FJD", name: "FJD - Fijian Dollar"},
                {code: "FKP", name: "FKP - Falkland Islands Pound"},
                {code: "GEL", name: "GEL - Georgian Lari"},
                {code: "GGP", name: "GGP - Guernsey Pound"},
                {code: "GHS", name: "GHS - Ghanaian Cedi"},
                {code: "GIP", name: "GIP - Gibraltar Pound"},
                {code: "GMD", name: "GMD - Gambian Dalasi"},
                {code: "GNF", name: "GNF - Guinean Franc"},
                {code: "GTQ", name: "GTQ - Guatemalan Quetzal"},
                {code: "GYD", name: "GYD - Guyanaese Dollar"},
                {code: "HNL", name: "HNL - Honduran Lempira"},
                {code: "HRK", name: "HRK - Croatian Kuna"},
                {code: "HTG", name: "HTG - Haitian Gourde"},
                {code: "HUF", name: "HUF - Hungarian Forint"},
                {code: "IMP", name: "IMP - Isle of Man Pound"},
                {code: "IQD", name: "IQD - Iraqi Dinar"},
                {code: "IRR", name: "IRR - Iranian Rial"},
                {code: "ISK", name: "ISK - Icelandic Króna"},
                {code: "JEP", name: "JEP - Jersey Pound"},
                {code: "JMD", name: "JMD - Jamaican Dollar"},
                {code: "JOD", name: "JOD - Jordanian Dinar"},
                {code: "KES", name: "KES - Kenyan Shilling"},
                {code: "KGS", name: "KGS - Kyrgyzstani Som"},
                {code: "KHR", name: "KHR - Cambodian Riel"},
                {code: "KMF", name: "KMF - Comorian Franc"},
                {code: "KPW", name: "KPW - North Korean Won"},
                {code: "KYD", name: "KYD - Cayman Islands Dollar"},
                {code: "KZT", name: "KZT - Kazakhstani Tenge"},
                {code: "LAK", name: "LAK - Laotian Kip"},
                {code: "LBP", name: "LBP - Lebanese Pound"},
                {code: "LRD", name: "LRD - Liberian Dollar"},
                {code: "LSL", name: "LSL - Lesotho Loti"},
                {code: "LYD", name: "LYD - Libyan Dinar"},
                {code: "MAD", name: "MAD - Moroccan Dirham"},
                {code: "MDL", name: "MDL - Moldovan Leu"},
                {code: "MGA", name: "MGA - Malagasy Ariary"},
                {code: "MKD", name: "MKD - Macedonian Denar"},
                {code: "MMK", name: "MMK - Myanmar Kyat"},
                {code: "MNT", name: "MNT - Mongolian Tugrik"},
                {code: "MOP", name: "MOP - Macanese Pataca"},
                {code: "MRU", name: "MRU - Mauritanian Ouguiya"},
                {code: "MUR", name: "MUR - Mauritian Rupee"},
                {code: "MVR", name: "MVR - Maldivian Rufiyaa"},
                {code: "MWK", name: "MWK - Malawian Kwacha"},
                {code: "MZN", name: "MZN - Mozambican Metical"},
                {code: "NAD", name: "NAD - Namibian Dollar"},
                {code: "NIO", name: "NIO - Nicaraguan Córdoba"},
                {code: "NOK", name: "NOK - Norwegian Krone"},
                {code: "PAB", name: "PAB - Panamanian Balboa"},
                {code: "PGK", name: "PGK - Papua New Guinean Kina"},
                {code: "PLN", name: "PLN - Polish Zloty"},
                {code: "PYG", name: "PYG - Paraguayan Guarani"},
                {code: "RON", name: "RON - Romanian Leu"},
                {code: "RSD", name: "RSD - Serbian Dinar"},
                {code: "RWF", name: "RWF - Rwandan Franc"},
                {code: "SBD", name: "SBD - Solomon Islands Dollar"},
                {code: "SCR", name: "SCR - Seychellois Rupee"},
                {code: "SDG", name: "SDG - Sudanese Pound"},
                {code: "SEK", name: "SEK - Swedish Krona"},
                {code: "SHP", name: "SHP - St. Helena Pound"},
                {code: "SLL", name: "SLL - Sierra Leonean Leone"},
                {code: "SOS", name: "SOS - Somali Shilling"},
                {code: "SRD", name: "SRD - Surinamese Dollar"},
                {code: "SSP", name: "SSP - South Sudanese Pound"},
                {code: "STN", name: "STN - São Tomé & Príncipe Dobra"},
                {code: "SVC", name: "SVC - Salvadoran Colón"},
                {code: "SYP", name: "SYP - Syrian Pound"},
                {code: "SZL", name: "SZL - Swazi Lilangeni"},
                {code: "TJS", name: "TJS - Tajikistani Somoni"},
                {code: "TMT", name: "TMT - Turkmenistani Manat"},
                {code: "TND", name: "TND - Tunisian Dinar"},
                {code: "TOP", name: "TOP - Tongan Paʻanga"},
                {code: "TTD", name: "TTD - Trinidad & Tobago Dollar"},
                {code: "TZS", name: "TZS - Tanzanian Shilling"},
                {code: "UAH", name: "UAH - Ukrainian Hryvnia"},
                {code: "UGX", name: "UGX - Ugandan Shilling"},
                {code: "UYU", name: "UYU - Uruguayan Peso"},
                {code: "UZS", name: "UZS - Uzbekistani Som"},
                {code: "VES", name: "VES - Venezuelan Bolívar"},
                {code: "VUV", name: "VUV - Vanuatu Vatu"},
                {code: "WST", name: "WST - Samoan Tala"},
                {code: "XAF", name: "XAF - Central African CFA Franc"},
                {code: "XCD", name: "XCD - East Caribbean Dollar"},
                {code: "XOF", name: "XOF - West African CFA Franc"},
                {code: "XPF", name: "XPF - CFP Franc"},
                {code: "YER", name: "YER - Yemeni Rial"},
                {code: "ZMW", name: "ZMW - Zambian Kwacha"},
                {code: "ZWL", name: "ZWL - Zimbabwean Dollar"}
            ];

            let mockRates = { USD: 1.0 };

            async function fetchLiveRates() {
                try {
                    const response = await fetch("https://open.er-api.com/v6/latest/USD");
                    if (!response.ok) throw new Error("Network error");
                    const data = await response.json();
                    
                    mockRates = {
                        ...data.rates, 
                        BBB: data.rates.BBD, 
                        BZE: data.rates.BZD, 
                        ZW_M: data.rates.ZWG || 24.10
                    };

                    console.log("लाइव रेट्स लोड हो गए हैं!");
                    runFiatEngine();
                } catch (error) {
                    console.error("API Error:", error);
                }
            }

            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                if (isDarkMode) document.body.classList.add("dark-mode");
            }

            themeToggle.addEventListener('click', () => {
                const isDark = document.body.classList.toggle("dark-mode");
                localStorage.setItem("globalDarkMode", isDark ? "enabled" : "disabled");
            });

            /* CONVERTER VIEW INITIALIZATION */
            function renderFiatConverterView() {
                cacheWarningStrip.classList.toggle('cached-active', !navigator.onLine);
                stagePane.innerHTML = `
                    <div class="form-layout-split">
                        <div class="form-inputs-stack">
                            <div class="form-group-item">
                                <label>Amount Outlay</label>
                                <input type="number" id="fiat-amount" value="100">
                            </div>
                            
                            <div class="form-group-item">
                                <label>From Currency Base</label>
                                <div class="custom-dropdown-container">
                                    <input type="text" id="from-search-box" autocomplete="off" placeholder="🔍 Click / Type to search...">
                                    <div id="from-dropdown-list" class="custom-dropdown-list"></div>
                                </div>
                            </div>

                            <div class="swap-row-container">
                                <button class="swap-btn" id="fiat-swap-trigger" title="Swap"><i class="fa-solid fa-arrows-up-down"></i></button>
                            </div>

                            <div class="form-group-item">
                                <label>To Target Currency</label>
                                <div class="custom-dropdown-container">
                                    <input type="text" id="to-search-box" autocomplete="off" placeholder="🔍 Click / Type to search...">
                                    <div id="to-dropdown-list" class="custom-dropdown-list"></div>
                                </div>
                            </div>

                            <button class="btn-action btn-action-primary" id="fiat-save-log-btn"><i class="fa-solid fa-bookmark"></i> Save Exchange Log</button>
                        </div>
                        <div class="output-summary-card">
                            <div class="metrics-row"><span class="metric-lbl">Conversion Valuation Yield</span><span class="metric-val total-corpus" id="fiat-res-node">0.00</span></div>
                            <div class="metrics-row"><span class="metric-lbl">Live Conversion Mid-Rate</span><span class="metric-val" id="fiat-rate-node">0.00</span></div>
                        </div>
                    </div>
                `;

                setupSmartDropdown('from-search-box', 'from-dropdown-list', 'FROM');
                setupSmartDropdown('to-search-box', 'to-dropdown-list', 'TO');

                document.getElementById('fiat-amount').addEventListener('input', runFiatEngine);
                document.getElementById('fiat-swap-trigger').addEventListener('click', () => {
                    let temp = currentFromCode;
                    currentFromCode = currentToCode;
                    currentToCode = temp;
                    runFiatEngine();
                });

                document.getElementById('fiat-save-log-btn').addEventListener('click', () => logFinSuiteCalculation('Currency Swap'));
                runFiatEngine();
            }

            function setupSmartDropdown(inputId, listId, mode) {
                const inputEl = document.getElementById(inputId);
                const listEl = document.getElementById(listId);

                function setBoxValue() {
                    let code = (mode === 'FROM') ? currentFromCode : currentToCode;
                    let found = countryCurrencies.find(c => c.code === code);
                    if(found) inputEl.value = found.name;
                }
                setBoxValue();

                function renderList(filterText = '') {
                    listEl.innerHTML = '';
                    const query = filterText.toLowerCase().trim();
                    const filtered = countryCurrencies.filter(c => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query));

                    if(filtered.length === 0) {
                        listEl.innerHTML = `<div class="dropdown-option-item" style="color:var(--text-secondary);">No matches found</div>`;
                        return;
                    }

                    filtered.forEach(item => {
                        const row = document.createElement('div');
                        row.className = 'dropdown-option-item';
                        row.textContent = item.name;
                        
                        row.addEventListener('click', () => {
                            inputEl.value = item.name;
                            if (mode === 'FROM') currentFromCode = item.code;
                            else currentToCode = item.code;
                            
                            listEl.classList.remove('show');
                            runFiatEngine();
                        });
                        listEl.appendChild(row);
                    });
                }

                inputEl.addEventListener('focus', () => {
                    inputEl.value = '';
                    renderList('');
                    listEl.classList.add('show');
                });

                inputEl.addEventListener('input', (e) => {
                    renderList(e.target.value);
                    listEl.classList.add('show');
                });

                document.addEventListener('click', (e) => {
                    if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
                        listEl.classList.remove('show');
                        if(inputEl.value === '') setBoxValue();
                    }
                });
            }

            function runFiatEngine() {
                let amt = parseFloat(document.getElementById('fiat-amount')?.value) || 0;
                const resNode = document.getElementById('fiat-res-node');
                const rateNode = document.getElementById('fiat-rate-node');
                const fromBox = document.getElementById('from-search-box');
                const toBox = document.getElementById('to-search-box');

                if(!resNode || !rateNode) return;

                if(fromBox && document.activeElement !== fromBox) {
                    let f = countryCurrencies.find(c => c.code === currentFromCode);
                    if(f) fromBox.value = f.name;
                }
                if(toBox && document.activeElement !== toBox) {
                    let t = countryCurrencies.find(c => c.code === currentToCode);
                    if(t) toBox.value = t.name;
                }

                if(amt <= 0) {
                    resNode.textContent = "0.00";
                    return;
                }

                let rateFrom = mockRates[currentFromCode] || 1.0;
                let rateTo = mockRates[currentToCode] || 1.0;
                let normalizedRate = rateTo / rateFrom;
                let outputVal = amt * normalizedRate;

                resNode.textContent = `${currentToCode} ${outputVal.toLocaleString('en-US', {maximumFractionDigits:2})}`;
                rateNode.textContent = `1 ${currentFromCode} = ${normalizedRate.toFixed(4)} ${currentToCode}`;
            }

            function logFinSuiteCalculation(metaTitle) {
                let targetDisplayValStr = stagePane.querySelector('.total-corpus')?.textContent || "0.00";
                const logItem = { id: Date.now(), meta: metaTitle, res: targetDisplayValStr, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                localStorage.setItem('market_suite_history', JSON.stringify(historyData));
                renderHistoryLogView(); showToast("Logged successfully!");
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div class="empty-history-msg">No logs cached yet.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div class="history-item-meta">${item.meta}</div><div class="history-item-expr">Time: ${item.time}</div><div class="history-item-res">${item.res}</div>`;
                    historyList.appendChild(el);
                });
            }

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('market_suite_history'); renderHistoryLogView(); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
            function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }

            // Start Engine Directly
            initTheme(); 
            renderFiatConverterView(); 
            fetchLiveRates(); 
            try { historyData = JSON.parse(localStorage.getItem('market_suite_history')) || []; } catch(e){} 
            renderHistoryLogView();
        });
