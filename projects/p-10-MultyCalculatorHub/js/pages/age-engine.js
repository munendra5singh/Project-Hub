/* age-engine.js — extracted verbatim from age.html's original inline <script>; logic/behavior unchanged, only relocated */
document.addEventListener('DOMContentLoaded', () => {
            let selectedMode = 'single';
            let metricsLoopTimer = null;
            let countdownLiveInterval = null;
            let historyData = [];

            const themeToggle = document.getElementById('theme-toggle');
            const historyToggle = document.getElementById('history-toggle');
            const historyClose = document.getElementById('history-close');
            const historyPanel = document.getElementById('history-panel');
            const historyList = document.getElementById('history-list');
            const clearHistoryBtn = document.getElementById('clear-history');

            const maxTodayStr = new Date().toISOString().split('T')[0];
            document.getElementById('dob1').setAttribute('max', maxTodayStr);
            document.getElementById('dob2').setAttribute('max', maxTodayStr);

            /* REALS SPEC THEME SYSTEM HUB */
            function initTheme() {
                const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
                applyTheme(isDarkMode ? 'dark' : 'light');
            }
            function applyTheme(theme) {
                if (theme === 'dark') document.body.className = "dark-mode";
                else document.body.className = "";
            }
            themeToggle.addEventListener('click', () => {
                const isDarkActive = document.body.classList.contains("dark-mode");
                const targetState = !isDarkActive ? 'enabled' : 'disabled';
                localStorage.setItem("globalDarkMode", targetState);
                applyTheme(!isDarkActive ? 'dark' : 'light');
            });
            window.addEventListener('storage', (e) => { 
                if (e.key === 'globalDarkMode') applyTheme(e.newValue === 'enabled' ? 'dark' : 'light'); 
            });

            /* LAYOUT MODIFIER HUB MAPPINGS */
            window.switchMode = function(mode) {
                selectedMode = mode;
                if (metricsLoopTimer) clearInterval(metricsLoopTimer);
                if (countdownLiveInterval) clearInterval(countdownLiveInterval);

                const btnS = document.getElementById('btnSingleMode');
                const btnC = document.getElementById('btnCompareMode');
                const targetBlock = document.getElementById('targetInputBlock');
                const compareBlock = document.getElementById('comparisonInputBlock');
                const lblDob1 = document.getElementById('lblDob1');
                const user2NameBlock = document.getElementById('user2NameBlock');

                document.getElementById('singleViewPanel').classList.remove('active');
                document.getElementById('comparisonViewPanel').classList.remove('active');

                if (mode === 'single') {
                    btnS.classList.add('active'); btnC.classList.remove('active');
                    targetBlock.style.display = 'flex'; compareBlock.style.display = 'none';
                    user2NameBlock.style.display = 'none';
                    lblDob1.innerHTML = `<i class="fa-solid fa-user"></i> Date of Birth`;
                } else {
                    btnC.classList.add('active'); btnS.classList.remove('active');
                    targetBlock.style.display = 'none'; compareBlock.style.display = 'flex';
                    user2NameBlock.style.display = 'flex';
                    lblDob1.innerHTML = `<i class="fa-solid fa-user"></i> Person 1 Birth Date`;
                }
            }

            /* CORE LOGIC TRIGGERS */
            window.processEngine = function() {
                const d1 = document.getElementById('dob1');
                const d2 = document.getElementById('dob2');

                d1.classList.remove('error-border');
                d2.classList.remove('error-border');

                if (!d1.value) {
                    d1.classList.add('error-border'); triggerToast("Missing profile date parameters!", true); return;
                }

                if (selectedMode === 'single') {
                    localStorage.setItem('chronos_dob', d1.value);
                    runSingleMetricsEngine();
                } else {
                    if (!d2.value) { d2.classList.add('error-border'); triggerToast("Please enter Person 2 Birth Date!", true); return; }
                    runComparisonMetricsEngine();
                }
            }

            function runSingleMetricsEngine() {
                if (metricsLoopTimer) clearInterval(metricsLoopTimer);
                if (countdownLiveInterval) clearInterval(countdownLiveInterval);
                
                const birthDate = new Date(document.getElementById('dob1').value);
                const targetInputVal = document.getElementById('targetDate').value;
                
                let rawName = document.getElementById('userNameInput1').value.trim();
                let resolvedName = rawName ? rawName.toUpperCase() : "YOUR";
                
                document.getElementById('lblHeroHeadline').innerText = resolvedName === "YOUR" ? "CHRONOLOGICAL AGE STANDINGS" : `${resolvedName}'S CHRONOLOGICAL AGE STANDINGS`;
                document.getElementById('lblWrappedTitle').innerHTML = resolvedName === "YOUR" ? "Your <span>Chronological</span> Archetype Snapshot" : `${resolvedName}'S <span>Chronological</span> Archetype Snapshot`;

                const handleCalculation = () => {
                    const currentEnd = targetInputVal ? new Date(targetInputVal) : new Date();
                    let diffs = calculateAgeDifferenceToken(birthDate, currentEnd);
                    
                    document.getElementById('sYear').innerText = diffs.y;
                    document.getElementById('sMonth').innerText = diffs.m;
                    document.getElementById('sDay').innerText = diffs.d;

                    const deltaMs = currentEnd - birthDate;
                    const secs = Math.floor(deltaMs / 1000);
                    const mins = Math.floor(secs / 60);
                    const hrs = Math.floor(mins / 60);
                    const dys = Math.floor(hrs / 24);
                    
                    document.getElementById('mTotalMonths').innerText = ((diffs.y * 12) + diffs.m).toLocaleString();
                    document.getElementById('mTotalWeeks').innerText = Math.floor(dys / 7).toLocaleString();
                    document.getElementById('mTotalDays').innerText = dys.toLocaleString();
                    document.getElementById('mTotalHours').innerText = hrs.toLocaleString();
                    document.getElementById('mLiveSeconds').innerText = secs.toLocaleString();

                    document.getElementById('bRevolutions').innerText = diffs.y;
                    document.getElementById('bMoonCycles').innerText = Math.floor(dys / 29.53).toLocaleString();
                    document.getElementById('bSleep').innerText = Math.floor(hrs * 0.33).toLocaleString();
                    document.getElementById('bSteps').innerText = Math.floor(dys * 4800).toLocaleString();
                    document.getElementById('bWeekends').innerText = Math.floor(dys / 7 * 2).toLocaleString();

                    document.getElementById('wrapDays').innerText = dys.toLocaleString();
                    document.getElementById('wrapHeart').innerText = (mins * 72).toLocaleString();

                    const m = birthDate.getMonth() + 1;
                    const d = birthDate.getDate();
                    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    
                    const currentZodiac = getZodiac(d, m);
                    document.getElementById('cZodiac').innerText = currentZodiac;
                    document.getElementById('wrapZodiac').innerText = currentZodiac;
                    document.getElementById('cChinese').innerText = getChineseZodiac(birthDate.getFullYear());
                    document.getElementById('cStone').innerText = getBirthstone(m);
                    document.getElementById('cWeekday').innerText = weekdays[birthDate.getDay()];
                    document.getElementById('cLuckyNum').innerText = (birthDate.getFullYear() % 9) + 1;
                    
                    const seasons = ["Winter ❄️", "Spring 🌱", "Summer ☀️", "Autumn 🍂"];
                    document.getElementById('cSeason').innerText = seasons[Math.floor((m % 12) / 3)];

                    const baselineMax = 82;
                    let currentProgress = Math.min((diffs.y / baselineMax) * 100, 100);
                    document.getElementById('lblProgressPercentage').innerText = currentProgress.toFixed(2) + "%";
                    document.getElementById('barLifeJourneyFill').style.width = currentProgress + "%";
                    document.getElementById('lblProgressYrsLeft').innerText = Math.max(0, baselineMax - diffs.y);
                    document.getElementById('lblProgressMthsLeft').innerText = Math.max(0, (baselineMax - diffs.y) * 12);

                    let nextBday = new Date(currentEnd.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                    if(nextBday < currentEnd && !targetInputVal) nextBday.setFullYear(currentEnd.getFullYear() + 1);
                    
                    let nextDiff = nextBday - currentEnd;
                    let nextDays = Math.ceil(nextDiff / (1000*60*60*24));
                    if(nextDays === 366 || nextDays === 0) nextDays = 0;

                    document.getElementById('nCountdown').innerText = nextDays === 0 ? "Today! 🎉" : `${nextDays} Days left`;
                    document.getElementById('nWeekday').innerText = weekdays[nextBday.getDay()];
                    document.getElementById('bHeart').innerText = (mins * 72).toLocaleString();

                    document.getElementById('lblBdayInfoDate').innerText = `${String(birthDate.getDate()).padStart(2, '0')} ${monthNames[birthDate.getMonth()]} ${nextBday.getFullYear()}`;
                    document.getElementById('lblBdayInfoDay').innerText = weekdays[nextBday.getDay()];
                    document.getElementById('lblBdayInfoDaysLeft').innerText = nextDays === 0 ? "Today! 🎉" : `${nextDays} Days`;

                    let leaps = 0;
                    for(let y = birthDate.getFullYear(); y <= currentEnd.getFullYear(); y++) {
                        if((y%4===0 && y%100!==0) || (y%400===0)) leaps++;
                    }
                    document.getElementById('bLeap').innerText = leaps;
                };

                const launchCountdownEngine = () => {
                    const birthDate = new Date(document.getElementById('dob1').value);
                    const now = new Date();
                    let nextBday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);

                    let duration = nextBday - now;
                    let days = Math.floor(duration / (1000 * 60 * 60 * 24));
                    let hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let mins = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                    let secs = Math.floor((duration % (1000 * 60)) / 1000);

                    document.getElementById('premiumCdDays').innerText = String(days).padStart(2, '0');
                    document.getElementById('premiumCdHours').innerText = String(hours).padStart(2, '0');
                    document.getElementById('premiumCdMins').innerText = String(mins).padStart(2, '0');
                    document.getElementById('premiumCdSecs').innerText = String(secs).padStart(2, '0');

                    const cards = ['cardCdDays', 'cardCdHours', 'cardCdMins', 'cardCdSecs'];
                    cards.forEach(id => {
                        const el = document.getElementById(id); el.classList.remove('warning-glow', 'danger-glow');
                        if (days <= 7) el.classList.add('danger-glow');
                        else if (days <= 30) el.classList.add('warning-glow');
                    });
                };

                handleCalculation(); launchCountdownEngine();
                if (!targetInputVal) {
                    metricsLoopTimer = setInterval(handleCalculation, 1000);
                    countdownLiveInterval = setInterval(launchCountdownEngine, 1000);
                }
                document.getElementById('singleViewPanel').classList.add('active');
                saveHistoryLog("Single Age", resolvedName, `${document.getElementById('sYear').innerText} Yrs`);
            }

            function runComparisonMetricsEngine() {
                const p1Date = new Date(document.getElementById('dob1').value);
                const p2Date = new Date(document.getElementById('dob2').value);
                const genericNow = new Date();

                let rawName1 = document.getElementById('userNameInput1').value.trim();
                let resolvedName1 = rawName1 ? rawName1.toUpperCase() : "MUNENDRA";
                let rawName2 = document.getElementById('userNameInput2').value.trim();
                let resolvedName2 = rawName2 ? rawName2.toUpperCase() : "RAHUL";

                document.getElementById('lblBattleArenaTitle').innerText = `${resolvedName1} VS ${resolvedName2} AGE BATTLE`;
                document.getElementById('lblP1CardHeader').innerText = `${resolvedName1} PROFILE`;
                document.getElementById('lblP2CardHeader').innerText = `${resolvedName2} PROFILE`;
                document.getElementById('lblThP1').innerText = resolvedName1;
                document.getElementById('lblThP2').innerText = resolvedName2;
                document.getElementById('lblTlP1Tag').innerText = `${resolvedName1} BIRTH`;
                document.getElementById('lblTlP2Tag').innerText = `${resolvedName2} BIRTH`;

                let p1Age = calculateAgeDifferenceToken(p1Date, genericNow);
                let p2Age = calculateAgeDifferenceToken(p2Date, genericNow);

                document.getElementById('p1AgeString').innerText = `${p1Age.y} Years, ${p1Age.m} Months, ${p1Age.d} Days`;
                document.getElementById('p2AgeString').innerText = `${p2Age.y} Years, ${p2Age.m} Months, ${p2Age.d} Days`;

                const p1Days = Math.floor((genericNow - p1Date) / (1000*60*60*24));
                const p2Days = Math.floor((genericNow - p2Date) / (1000*60*60*24));

                document.getElementById('battleP1Heart').innerHTML = Math.floor(p1Days * 24 * 60 * 72).toLocaleString();
                document.getElementById('battleP2Heart').innerHTML = Math.floor(p2Days * 24 * 60 * 72).toLocaleString();
                document.getElementById('battleP1Rev').innerHTML = p1Age.y;
                document.getElementById('battleP2Rev').innerHTML = p2Age.y;
                document.getElementById('battleP1Moon').innerHTML = Math.floor(p1Days / 29.5).toLocaleString();
                document.getElementById('battleP2Moon').innerHTML = Math.floor(p2Days / 29.5).toLocaleString();
                document.getElementById('battleP1Bday').innerHTML = p1Age.y;
                document.getElementById('battleP2Bday').innerHTML = p2Age.y;
                document.getElementById('battleP1Wknd').innerHTML = Math.floor(p1Days / 7 * 2).toLocaleString();
                document.getElementById('battleP2Wknd').innerHTML = Math.floor(p2Days / 7 * 2).toLocaleString();

                const appendBadge = (id1, id2, val1, val2) => {
                    if (val1 > val2) document.getElementById(id1).innerHTML += ` <span class="winner-badge-pill"><i class="fa-solid fa-trophy"></i> Win</span>`;
                    else if (val2 > val1) document.getElementById(id2).innerHTML += ` <span class="winner-badge-pill"><i class="fa-solid fa-trophy"></i> Win</span>`;
                }
                appendBadge('battleP1Heart', 'battleP2Heart', p1Days, p2Days);
                appendBadge('battleP1Rev', 'battleP2Rev', p1Age.y, p2Age.y);
                appendBadge('battleP1Moon', 'battleP2Moon', p1Days, p2Days);
                appendBadge('battleP1Bday', 'battleP2Bday', p1Age.y, p2Age.y);
                appendBadge('battleP1Wknd', 'battleP2Wknd', p1Days, p2Days);

                const c1 = document.getElementById('cardP1'); const c2 = document.getElementById('cardP2');
                c1.classList.remove('lead-card'); c2.classList.remove('lead-card');

                let older, younger, olderDate, youngerDate;
                if(p1Date < p2Date) {
                    c1.classList.add('lead-card'); older = resolvedName1; younger = resolvedName2; olderDate = p1Date; youngerDate = p2Date;
                } else if(p2Date < p1Date) {
                    c2.classList.add('lead-card'); older = resolvedName2; younger = resolvedName1; olderDate = p2Date; youngerDate = p1Date;
                } else {
                    document.getElementById('comparisonVerdictText').innerText = "Both profiles possess identical structural twin age loops!";
                    document.getElementById('comparisonViewPanel').classList.add('active'); return;
                }

                let gap = calculateAgeDifferenceToken(olderDate, youngerDate);
                document.getElementById('comparisonVerdictText').innerText = `${older} is older than ${younger} by ${gap.y} Years, ${gap.m} Months, and ${gap.d} Days`;

                document.getElementById('gapBarValY').innerText = gap.y + " Years";
                document.getElementById('gapBarValM').innerText = gap.m + " Months";
                document.getElementById('gapBarValD').innerText = gap.d + " Days";
                document.getElementById('gapBarFillY').style.width = Math.min((gap.y / 10), 100) + "%";
                document.getElementById('gapBarFillM').style.width = (gap.m / 12 * 100) + "%";
                document.getElementById('gapBarFillD').style.width = (gap.d / 31 * 100) + "%";

                const maxTrackMs = genericNow - Math.min(p1Date, p2Date);
                const p1OffsetPct = ((genericNow - p1Date) / maxTrackMs) * 100;
                const p2OffsetPct = ((genericNow - p2Date) / maxTrackMs) * 100;

                document.getElementById('tlP1Pin').style.left = (100 - p1OffsetPct) + "%";
                document.getElementById('tlP2Pin').style.left = (100 - p2OffsetPct) + "%";
                document.getElementById('tlP1Track').style.left = (100 - p1OffsetPct) + "%";
                document.getElementById('tlP1Track').style.width = p1OffsetPct + "%";
                document.getElementById('tlP2Track').style.left = (100 - p2OffsetPct) + "%";
                document.getElementById('tlP2Track').style.width = p2OffsetPct + "%";

                document.getElementById('comparisonViewPanel').classList.add('active');
                saveHistoryLog("Comparison Battle", `${resolvedName1} vs ${resolvedName2}`, `Gap: ${gap.y}Y`);
            }

            function calculateAgeDifferenceToken(start, end) {
                let years = end.getFullYear() - start.getFullYear();
                let months = end.getMonth() - start.getMonth();
                let days = end.getDate() - start.getDate();
                if (days < 0) { months--; let prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
                if (months < 0) { years--; months += 12; }
                return { y: years, m: months, d: days };
            }

            function getZodiac(d, m) {
                const signs = ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"];
                const cuts = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
                return (d < cuts[m - 1]) ? signs[m - 1] : signs[m % 12];
            }
            function getChineseZodiac(y) { const anims = ["Rat 🐭", "Ox 🐂", "Tiger 🐯", "Rabbit 🐰", "Dragon 🐲", "Snake 🐍", "Horse 🐴", "Goat 🐐", "Monkey 🐵", "Rooster 🐓", "Dog 🐶", "Pig 🐷"]; return anims[(y - 4) % 12]; }
            function getBirthstone(m) { const stones = ["Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl", "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise"]; return stones[m - 1]; }

            /* HISTORY STORAGE ARCHITECTURE LOOP HOOKS */
            function saveHistoryLog(type, expr, res) {
                const logItem = { id: Date.now(), type, expr, res, time: new Date().toLocaleTimeString() };
                historyData.unshift(logItem);
                if(historyData.length > 200) historyData.pop();
                localStorage.setItem('chronos_suite_history', JSON.stringify(historyData));
                renderHistoryLogView();
            }

            function renderHistoryLogView() {
                historyList.innerHTML = historyData.length === 0 ? '<div style="color:var(--text-secondary);font-size:0.9rem;">No calculations logs captured.</div>' : '';
                historyData.forEach(item => {
                    const el = document.createElement('div'); el.className = 'history-item';
                    el.innerHTML = `<div><span class="hist-type">${item.type}</span><div class="hist-expr">${item.expr}</div></div><span class="hist-res" style="color:var(--accent-color); font-weight:700;">${item.res}</span>`;
                    el.addEventListener('click', () => {
                        if (item.type === "Single Age") window.switchMode('single');
                        else window.switchMode('compare');
                        historyPanel.classList.remove('open'); triggerToast("Loaded historical log context!");
                    });
                    historyList.appendChild(el);
                });
            }

            /* CANVAS GENERATOR MECHANISMS */
            window.generatePremiumWrappedCardAsset = function() {
                const y = document.getElementById('sYear').innerText;
                const m = document.getElementById('sMonth').innerText;
                const d = document.getElementById('sDay').innerText;
                const dys = document.getElementById('wrapDays').innerText;
                const zodiac = document.getElementById('wrapZodiac').innerText;
                const heart = document.getElementById('wrapHeart').innerText;
                let rawName = document.getElementById('userNameInput1').value.trim();
                let resolvedName = rawName ? rawName.toUpperCase() : "YOUR";

                const canvas = document.createElement('canvas');
                const mode = document.getElementById('exportAspectSelection').value;
                if (mode === 'story') { canvas.width = 1080; canvas.height = 1920; } 
                else if (mode === 'landscape') { canvas.width = 1200; canvas.height = 630; } 
                else { canvas.width = 1080; canvas.height = 1080; }
                
                const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height;
                let bgGrad = ctx.createLinearGradient(0, 0, W, H); bgGrad.addColorStop(0, '#0f172a'); bgGrad.addColorStop(1, '#1e1b4b');
                ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

                ctx.fillStyle = 'rgba(168, 85, 247, 0.12)'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, W * 0.4, 0, Math.PI * 2); ctx.fill();
                let paddingX = W * 0.09; let currentY = H * 0.12; let fontMultiplier = W / 1080;

                ctx.fillStyle = '#818cf8'; ctx.font = `bold ${Math.floor(26 * fontMultiplier)}px "Space Grotesk"`; ctx.fillText('CHRONOS WRAPPED', paddingX, currentY);
                currentY += H * 0.07;

                ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.floor(42 * fontMultiplier)}px "Plus Jakarta Sans"`;
                let fullTitleText = (resolvedName === "YOUR") ? "YOUR CHRONOLOGICAL ARCHETYPE SNAPSHOT" : `${resolvedName}'S CHRONOLOGICAL ARCHETYPE SNAPSHOT`;
                ctx.fillText(fullTitleText, paddingX, currentY);
                currentY += H * 0.12;

                const drawRow = (lbl, val) => {
                    ctx.fillStyle = '#c084fc'; ctx.fillRect(paddingX, currentY - 20, 4, 35);
                    ctx.fillStyle = '#94a3b8'; ctx.font = `600 ${Math.floor(20 * fontMultiplier)}px "Plus Jakarta Sans"`; ctx.fillText(lbl, paddingX + 20, currentY);
                    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.floor(32 * fontMultiplier)}px "Space Grotesk"`; ctx.fillText(val, paddingX + 20, currentY + 35);
                    currentY += H * 0.15;
                }
                drawRow("DAYS ON EARTH", `${dys} Days Lived`);
                drawRow("ZODIAC AFFINITY", zodiac);
                drawRow("TOTAL HEARTBEATS", `${heart} Beats`);

                const link = document.createElement('a'); link.download = `Chronos_Wrapped_${resolvedName}.png`; link.href = canvas.toDataURL('image/png'); link.click();
            }

            window.triggerNativeAppShare = function(platform) {
                const y = document.getElementById('sYear').innerText;
                let rawName = document.getElementById('userNameInput1').value.trim();
                let namePart = rawName ? `${rawName.toUpperCase()}'S` : "My";
                const text = encodeURIComponent(`${namePart} precise age standing is ${y} Years! Track your premium chronological metrics instantly via Chronos.`);
                let url = platform === 'whatsapp' ? `https://api.whatsapp.com/send?text=${text}` : `https://twitter.com/intent/tweet?text=${text}`;
                window.open(url, '_blank');
            }

            window.copySingleAge = function() {
                const y = document.getElementById('sYear').innerText; const m = document.getElementById('sMonth').innerText; const d = document.getElementById('sDay').innerText;
                let rawName = document.getElementById('userNameInput1').value.trim(); let namePart = rawName ? `${rawName.toUpperCase()}'S` : "My";
                navigator.clipboard.writeText(`${namePart} precise age breakdown: ${y} Years, ${m} Months, and ${d} Days! Processed via Chronos.`).then(() => triggerToast("Age details copied!"));
            }

            window.clearUniverse = function() {
                if (metricsLoopTimer) clearInterval(metricsLoopTimer);
                if (countdownLiveInterval) clearInterval(countdownLiveInterval);
                ['dob1', 'dob2', 'targetDate', 'userNameInput1', 'userNameInput2'].forEach(id => document.getElementById(id).value = '');
                document.getElementById('singleViewPanel').classList.remove('active'); document.getElementById('comparisonViewPanel').classList.remove('active');
                localStorage.removeItem('chronos_dob'); triggerToast("Environment layout reset.");
            }

            function triggerToast(text, isErr = false) {
                const toastNode = document.getElementById('globalToast'); const msg = document.getElementById('toastMessageText');
                toastNode.style.background = isErr ? "var(--danger)" : "var(--success)"; msg.innerText = text;
                toastNode.classList.add('show'); setTimeout(() => toastNode.classList.remove('show'), 3000);
            }
            window.triggerToast = triggerToast;

            clearHistoryBtn.addEventListener('click', () => { historyData = []; localStorage.removeItem('chronos_suite_history'); renderHistoryLogView(); });
            historyToggle.addEventListener('click', () => historyPanel.classList.add('open'));
            historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));

            initTheme(); try { historyData = JSON.parse(localStorage.getItem('chronos_suite_history')) || []; } catch(e){} renderHistoryLogView();
            const cacheDob = localStorage.getItem('chronos_dob'); if(cacheDob) { document.getElementById('dob1').value = cacheDob; processEngine(); }
        });
