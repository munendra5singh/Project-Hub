/* main-engine.js — extracted verbatim from main.html's original inline <script>; logic/behavior unchanged, only relocated */
// System UI Interaction Handlers
    function toggleHelp(id) {
      const panel = document.getElementById(id);
      if(panel) {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
      }
    }
    
    function updateActiveNavPill(elem) {
      document.querySelectorAll('.nav-pill').forEach(pill => pill.classList.remove('active'));
      elem.classList.add('active');
    }

    function toggleSlideDrawer(open) {
      const drawerShield = document.getElementById('global-drawer-shield');
      if(open) {
        drawerShield.classList.add('active');
      } else {
        drawerShield.classList.remove('active');
      }
    }

    function closeDrawerOutside(e) {
      if(e.target.id === 'global-drawer-shield') {
        toggleSlideDrawer(false);
      }
    }

    function toggleSettingsModal(open) {
      const modal = document.getElementById('global-settings-modal');
      if(open) {
        modal.classList.add('active');
      } else {
        modal.classList.remove('active');
      }
    }

    // Modern Real-time Search Processing System
    function filterModulesEngine() {
      const query = document.getElementById('module-search-core').value.toLowerCase().trim();
      const blocks = document.querySelectorAll('.premium-modular-row');
      
      blocks.forEach(block => {
        const tags = block.getAttribute('data-search-tags') || '';
        const title = block.querySelector('h3').innerText.toLowerCase();
        
        if(title.includes(query) || tags.includes(query)) {
          block.classList.remove('hidden-module');
          block.style.animation = 'scaleIn 0.3s ease forwards';
        } else {
          block.classList.add('hidden-module');
        }
      });
    }

    function filterDrawerCategory(category) {
      const blocks = document.querySelectorAll('.premium-modular-row');
      blocks.forEach(block => {
        const tags = block.getAttribute('data-search-tags') || '';
        if(tags.includes(category)) {
          block.classList.remove('hidden-module');
        } else {
          block.classList.add('hidden-module');
        }
      });
      toggleSlideDrawer(false);
    }

    function focusSearchInput() {
      const input = document.getElementById('module-search-core');
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => input.focus(), 400);
    }

    function closeSettingsOutside(e) {
      if(e.target.id === 'global-settings-modal') {
        toggleSettingsModal(false);
      }
    }

    // User Experience Utilities System
    function toggleFavoriteElement(id) {
      const btn = document.querySelector(`#${id} .card-favorite-toggle`);
      btn.classList.toggle('favorited');
    }

    function copyResultStream(elementId) {
      const text = document.getElementById(elementId).innerText;
      if(!text) return alert('No calculated metrics available to stream.');
      navigator.clipboard.writeText(text).then(() => {
        alert('Output metric copied safely to client clipboard.');
      });
    }

    function copyRawDataFromElement(id) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert('Raw metrics copied to system clipboard.');
      });
    }

    // Native Interface Dark / Light Theme Engine Toggle Supplemental Handler
    function toggleThemeEngine() {
      const body = document.body;
      const current = body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', next);
    }

    /* ==========================================================================
       CALCULATION ENGINES (m1 – m10)
       Added to wire up the module forms that were rendered in the markup but had
       no calculation logic behind them yet. Every function below is referenced
       directly from main.html via onchange / onsubmit / onclick attributes.
       ========================================================================== */

    const englishWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const hindiWeekdays = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

    // --- shared result/UI helpers ---------------------------------------------

    function showModuleResult(id, html) {
      const empty = document.getElementById(id + '-empty');
      const res = document.getElementById(id + '-res');
      if (empty) empty.style.display = 'none';
      if (res) res.innerHTML = html;
    }

    function showModuleTrace(id) {
      const trace = document.getElementById(id + '-trace-box');
      if (trace) trace.style.display = 'block';
    }

    function showModuleInsight(id, text) {
      const box = document.getElementById(id + '-insight-box');
      const txt = document.getElementById(id + '-insight-txt');
      if (box) box.style.display = 'block';
      if (txt && text) txt.textContent = text;
    }

    function setModuleSnapshot(id, main, sub) {
      const m = document.getElementById(id + '-snap-main');
      const s = document.getElementById(id + '-snap-sub');
      if (m) m.textContent = main;
      if (s) s.textContent = sub;
    }

    // Parses a native <input type="date"> value ("YYYY-MM-DD") into a local
    // Date at midnight, avoiding UTC/timezone off-by-one shifting.
    function parseDateInput(value) {
      if (!value) return null;
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    // Calendar-aware (years, months, days) breakdown between two Date objects.
    function calendarBreakdown(start, end) {
      let a = start, b = end;
      if (a > b) { const t = a; a = b; b = t; }
      let years = b.getFullYear() - a.getFullYear();
      let months = b.getMonth() - a.getMonth();
      let days = b.getDate() - a.getDate();
      if (days < 0) {
        months -= 1;
        const daysInPrevMonth = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
        days += daysInPrevMonth;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const totalDays = Math.round((b - a) / 86400000);
      return { years, months, days, totalDays };
    }

    function resetModule(id) {
      const section = document.getElementById(id);
      if (!section) return;

      const form = section.querySelector('form');
      if (form) form.reset();

      const empty = document.getElementById(id + '-empty');
      const res = document.getElementById(id + '-res');
      if (res) res.innerHTML = '';
      if (empty) empty.style.display = '';

      const insightBox = document.getElementById(id + '-insight-box');
      if (insightBox) insightBox.style.display = 'none';

      const traceBox = document.getElementById(id + '-trace-box');
      if (traceBox) traceBox.style.display = 'none';

      setModuleSnapshot(id, '—', 'Awaiting temporal vector data parameters');

      if (id === 'm7') stopCountdownEngine();
    }

    // --- Engine 01: Date Difference --------------------------------------------

    function calcDateDiff() {
      const start = parseDateInput(document.getElementById('m1-start').value);
      const end = parseDateInput(document.getElementById('m1-end').value);
      if (!start || !end) return;

      const { years, months, days, totalDays } = calendarBreakdown(start, end);
      const absDays = Math.abs(totalDays);
      const totalWeeks = Math.floor(absDays / 7);

      showModuleResult('m1',
        `${years} Years, ${months} Months, ${days} Days` +
        `<div style="font-size:0.95rem;font-weight:500;color:var(--text-muted);margin-top:6px;">Total: ${absDays.toLocaleString()} days • ${totalWeeks.toLocaleString()} weeks</div>`
      );
      showModuleTrace('m1');
      showModuleInsight('m1', `The gap spans ${absDays.toLocaleString()} total days across the calendar.`);
      setModuleSnapshot('m1', `${absDays.toLocaleString()} Days`, `${years}y ${months}m ${days}d between the two dates`);
    }

    // --- Engine 02: Time Difference (24h) --------------------------------------

    function calcTimeDiff() {
      const startVal = document.getElementById('m2-start').value;
      const endVal = document.getElementById('m2-end').value;
      if (!startVal || !endVal) return;

      const [sh, sm] = startVal.split(':').map(Number);
      const [eh, em] = endVal.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60; // mod-24h inversion for boundary crossing

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      showModuleResult('m2', `${hours}h ${minutes}m <div style="font-size:0.95rem;font-weight:500;color:var(--text-muted);margin-top:6px;">Total: ${diff.toLocaleString()} minutes</div>`);
      showModuleTrace('m2');
      showModuleInsight('m2', `That's ${diff.toLocaleString()} minutes apart on a 24-hour clock.`);
      setModuleSnapshot('m2', `${hours}h ${minutes}m`, `${diff.toLocaleString()} minutes total`);
    }

    // --- Engine 03: Exact Date & Time Difference --------------------------------

    function calcDateTimeDiff() {
      const startVal = document.getElementById('m3-start').value;
      const endVal = document.getElementById('m3-end').value;
      if (!startVal || !endVal) return;

      const start = new Date(startVal);
      const end = new Date(endVal);
      let ms = Math.abs(end - start);

      const days = Math.floor(ms / 86400000); ms -= days * 86400000;
      const hours = Math.floor(ms / 3600000); ms -= hours * 3600000;
      const minutes = Math.floor(ms / 60000); ms -= minutes * 60000;
      const seconds = Math.floor(ms / 1000);

      showModuleResult('m3',
        `${days}d ${hours}h ${minutes}m ${seconds}s` +
        `<div style="font-size:0.95rem;font-weight:500;color:var(--text-muted);margin-top:6px;">Precise interval across both date and time</div>`
      );
      showModuleTrace('m3');
      showModuleInsight('m3', `Broken down to the second across ${days} full day(s).`);
      setModuleSnapshot('m3', `${days}d ${hours}h ${minutes}m`, `${seconds}s precision offset`);
    }

    // --- Engine 04: Add / Subtract Date -----------------------------------------

    function addSubtractDateEngine() {
      const baseVal = document.getElementById('m4-date').value;
      if (!baseVal) return;

      const operation = document.getElementById('m4-operation').value;
      const years = Number(document.getElementById('m4-y').value) || 0;
      const monthsIn = Number(document.getElementById('m4-m').value) || 0;
      const weeks = Number(document.getElementById('m4-w').value) || 0;
      const daysIn = Number(document.getElementById('m4-d').value) || 0;
      const sign = operation === 'sub' ? -1 : 1;

      const date = parseDateInput(baseVal);
      date.setFullYear(date.getFullYear() + sign * years);
      date.setMonth(date.getMonth() + sign * monthsIn);
      date.setDate(date.getDate() + sign * (weeks * 7 + daysIn));

      const formatted = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      showModuleResult('m4', formatted);
      showModuleTrace('m4');
      setModuleSnapshot('m4', formatted, `${operation === 'sub' ? 'Subtracted' : 'Added'} from base date`);
    }

    // --- Engine 05: Day Finder --------------------------------------------------

    function findDayEngine() {
      const target = parseDateInput(document.getElementById('m5-date').value);
      if (!target) return;

      const dayIndex = target.getDay();
      const english = englishWeekdays[dayIndex];
      const hindi = hindiWeekdays[dayIndex];

      showModuleResult('m5', `${english} <span style="font-size:1rem;font-weight:500;color:var(--text-muted);">(${hindi})</span>`);
      showModuleTrace('m5');
      setModuleSnapshot('m5', english, hindi);
    }

    // --- Engine 06: Business Days Counter ---------------------------------------

    function calcBusinessDays() {
      let start = parseDateInput(document.getElementById('m6-start').value);
      let end = parseDateInput(document.getElementById('m6-end').value);
      if (!start || !end) return;
      if (start > end) { const t = start; start = end; end = t; }

      const totalDays = Math.round((end - start) / 86400000) + 1; // inclusive of both ends
      const fullWeeks = Math.floor(totalDays / 7);
      let businessDays = fullWeeks * 5;
      const remainder = totalDays % 7;
      const startDow = start.getDay();
      for (let i = 0; i < remainder; i++) {
        const dow = (startDow + fullWeeks * 7 + i) % 7;
        if (dow !== 0 && dow !== 6) businessDays++;
      }

      const weekendDays = totalDays - businessDays;

      showModuleResult('m6',
        `${businessDays} Business Days` +
        `<div style="font-size:0.95rem;font-weight:500;color:var(--text-muted);margin-top:6px;">${totalDays} calendar days • ${weekendDays} weekend days excluded</div>`
      );
      showModuleTrace('m6');
      setModuleSnapshot('m6', `${businessDays} Days`, `Out of ${totalDays} total calendar days`);
    }

    // --- Engine 07: Live Target Countdown Tracker -------------------------------

    let countdownIntervalId = null;

    function initiateCountdown() {
      const targetVal = document.getElementById('m7-target').value;
      if (!targetVal) return;

      const target = new Date(targetVal);
      if (countdownIntervalId) clearInterval(countdownIntervalId);

      function tick() {
        const now = new Date();
        let ms = target - now;

        if (ms <= 0) {
          showModuleResult('m7', 'Target reached! 🎉');
          setModuleSnapshot('m7', 'ARRIVED', 'Target milestone has been reached');
          clearInterval(countdownIntervalId);
          countdownIntervalId = null;
          return;
        }

        const days = Math.floor(ms / 86400000); ms -= days * 86400000;
        const hours = Math.floor(ms / 3600000); ms -= hours * 3600000;
        const minutes = Math.floor(ms / 60000); ms -= minutes * 60000;
        const seconds = Math.floor(ms / 1000);

        showModuleResult('m7', `${days}d ${hours}h ${minutes}m ${seconds}s`);
        showModuleTrace('m7');
        setModuleSnapshot('m7', `${days}d ${hours}h ${minutes}m`, `${seconds}s remaining until target`);
      }

      tick();
      countdownIntervalId = setInterval(tick, 1000);
    }

    function stopCountdownEngine() {
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
      }
      const empty = document.getElementById('m7-empty');
      const res = document.getElementById('m7-res');
      if (res) res.innerHTML = '';
      if (empty) empty.style.display = '';
      setModuleSnapshot('m7', 'T-MINUS', 'Active tracking stream initialization awaiting matrix endpoints');
    }

    // --- Engine 08: Precise Age Station ------------------------------------------

    function calculateAgeEngine() {
      const dob = parseDateInput(document.getElementById('m8-dob').value);
      if (!dob) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { years, months, days, totalDays } = calendarBreakdown(dob, today);

      showModuleResult('m8',
        `${years} Years, ${months} Months, ${days} Days` +
        `<div style="font-size:0.95rem;font-weight:500;color:var(--text-muted);margin-top:6px;">Total: ${Math.abs(totalDays).toLocaleString()} days lived</div>`
      );
      showModuleTrace('m8');
      setModuleSnapshot('m8', `${years} Years`, `${months}m ${days}d • ${Math.abs(totalDays).toLocaleString()} days lived`);
    }

    // --- Engine 09: Global Time Zone Matrix Desk ---------------------------------

    function convertTimeZonesEngine() {
      const sourceVal = document.getElementById('m9-time').value;
      if (!sourceVal) return;

      const sourceDate = new Date(sourceVal);
      const zones = [
        { label: 'India (IST)', tz: 'Asia/Kolkata' },
        { label: 'USA (EST)', tz: 'America/New_York' },
        { label: 'UK (GMT/BST)', tz: 'Europe/London' },
        { label: 'Japan (JST)', tz: 'Asia/Tokyo' },
      ];

      const lines = zones.map(z => {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: z.tz, dateStyle: 'medium', timeStyle: 'short'
        }).format(sourceDate);
        return `<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:0.95rem;"><span style="color:var(--text-muted);">${z.label}</span><strong>${formatted}</strong></div>`;
      }).join('');

      showModuleResult('m9', `<div style="font-size:1.05rem;">${lines}</div>`);
      showModuleTrace('m9');
      const summary = zones.map(z => `${z.label}: ${new Intl.DateTimeFormat('en-US', { timeZone: z.tz, dateStyle: 'medium', timeStyle: 'short' }).format(sourceDate)}`).join(' • ');
      setModuleSnapshot('m9', 'Global Matrix Mapped', summary);
    }

    // --- Engine 10: Astronomical Leap Year Engine --------------------------------

    function checkLeapYearEngine() {
      const yearVal = document.getElementById('m10-year').value;
      if (!yearVal) return;

      const year = Number(yearVal);
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

      showModuleResult('m10', isLeap
        ? `✅ ${year} is a Leap Year`
        : `❌ ${year} is not a Leap Year`
      );
      showModuleTrace('m10');
      setModuleSnapshot('m10', isLeap ? 'LEAP YEAR' : 'REGULAR YEAR', `${year} verified against solar correction rules`);
    }
