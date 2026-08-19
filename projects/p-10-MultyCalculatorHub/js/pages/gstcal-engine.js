/* gstcal-engine.js — extracted verbatim from gstcal.html's original inline <script>; logic/behavior unchanged, only relocated */
let calculationSummary = null;
    let historyStack = JSON.parse(localStorage.getItem("gstTerminalHistory")) || [];

    const randomClients = [
      { name: "Acme Corporate Solutions", gstin: "07AAAAA2412A1Z0" },
      { name: "Alpha Digital Matrix Ltd", gstin: "27BBBBB9081C2Z5" },
      { name: "Zephyr Global Logistics", gstin: "09CCCCC4532R1Z8" },
      { name: "Quantum Tech Infrastructure", gstin: "33DDDDD1290M3Z2" }
    ];

    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById('invDate').innerText = 'Date: ' + new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
      randomizeInvoiceProfile();
      initializeThemeState();
      renderHistoryPanelItems();

      // Reactive pipeline observers assignment loops (Live visual update)
      const triggers = ['baseAmount', 'gstRate', 'cessRate', 'interstateSupply'];
      triggers.forEach(id => document.getElementById(id).addEventListener('input', runFintechEngine));
      document.querySelectorAll('input[name="gstMode"]').forEach(r => r.addEventListener('change', runFintechEngine));

      // Keydown observer to trap "Enter" inside input field
      document.getElementById("baseAmount").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          processAndCommitCalculations();
        }
      });
      
      runFintechEngine();
    });

    function toggleHistoryPanel() {
      const sidebar = document.getElementById("historySidebar");
      sidebar.classList.toggle("open");
    }

    function randomizeInvoiceProfile() {
      const randomIdx = Math.floor(Math.random() * randomClients.length);
      const chosen = randomClients[randomIdx];
      document.getElementById('invClientName').innerText = chosen.name;
      document.getElementById('invClientGstin').innerText = `GSTIN: ${chosen.gstin}`;
      document.getElementById('invId').innerText = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    function runFintechEngine() {
      const baseVal = parseFloat(document.getElementById("baseAmount").value);
      const rateVal = parseFloat(document.getElementById("gstRate").value);
      const cessRateVal = parseFloat(document.getElementById("cessRate").value);
      const mode = document.querySelector('input[name="gstMode"]:checked').value;
      const isInterstate = document.getElementById("interstateSupply").checked;

      if (isNaN(baseVal) || baseVal <= 0) {
        clearMetricsDisplay();
        return;
      }

      let net = 0, tax = 0, cess = 0, gross = 0;

      if (mode === "add") {
        net = baseVal;
        tax = (baseVal * rateVal) / 100;
        cess = (baseVal * cessRateVal) / 100;
        gross = baseVal + tax + cess;
      } else {
        gross = baseVal;
        net = baseVal / (1 + ((rateVal + cessRateVal) / 100));
        tax = (net * rateVal) / 100;
        cess = (net * cessRateVal) / 100;
      }

      let cgst = 0, sgst = 0, igst = 0;
      if (isInterstate) {
        igst = tax;
      } else {
        cgst = tax / 2;
        sgst = tax / 2;
      }

      calculationSummary = { mode, net, tax, cgst, sgst, igst, cess, gross, rateVal, cessRateVal, isInterstate };

      updateDomMetrics();
      renderLiveVisualDonut(tax + cess, gross, rateVal);
    }

    // Process calculations explicitly, push directly to history arrays data stack
    function processAndCommitCalculations() {
      runFintechEngine();
      if (!calculationSummary) return;

      const logItem = {
        id: document.getElementById('invId').innerText,
        client: document.getElementById('invClientName').innerText,
        timestamp: new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
        data: { ...calculationSummary }
      };

      // Add to start of array stack loop
      historyStack.unshift(logItem);
      if (historyStack.length > 30) historyStack.pop(); // Cap history logs limit safe array configuration

      localStorage.setItem("gstTerminalHistory", JSON.stringify(historyStack));
      renderHistoryPanelItems();
      
      // Flash successful visual indicator or notification
      alert(`✅ Calculation Log committed to ledger stack successfully!`);
    }

    function renderHistoryPanelItems() {
      const container = document.getElementById("historyLogsBox");
      if (historyStack.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 20px; font-size: 13px;">No saved logs found. Press Calculate or Enter!</div>`;
        return;
      }

      container.innerHTML = historyStack.map((item, index) => `
        <div class="log-card" onclick="loadCalculationsFromHistory(${index})">
          <div class="log-meta">
            <span>${item.id}</span>
            <span>${item.timestamp}</span>
          </div>
          <div style="font-weight: 700; color: var(--text-main); margin: 2px 0;">${item.client}</div>
          <div style="display:flex; justify-content:space-between; color: var(--text-muted); font-size:11px;">
            <span>Gross: <b>${formatCurrency(item.data.gross)}</b></span>
            <span>Tax: ${item.data.rateVal}%</span>
          </div>
        </div>
      `).join('');
    }

    function loadCalculationsFromHistory(index) {
      const selected = historyStack[index];
      if (!selected) return;

      document.getElementById("baseAmount").value = selected.data.net.toFixed(2);
      if (selected.data.mode === "add") {
        document.getElementById("addGst").checked = true;
      } else {
        document.getElementById("removeGst").checked = true;
      }
      document.getElementById("gstRate").value = selected.data.rateVal;
      document.getElementById("cessRate").value = selected.data.cessRateVal;
      document.getElementById("interstateSupply").checked = selected.data.isInterstate;
      
      document.getElementById('invId').innerText = selected.id;
      document.getElementById('invClientName').innerText = selected.client;

      runFintechEngine();
      toggleHistoryPanel(); // close window stream stack frame view UI
    }

    function clearAllHistory() {
      if (confirm("Are you sure you want to wipe terminal logs state database matrices?")) {
        historyStack = [];
        localStorage.removeItem("gstTerminalHistory");
        renderHistoryPanelItems();
      }
    }

    function formatCurrency(v) {
      return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function updateDomMetrics() {
      if(!calculationSummary) return;
      const d = calculationSummary;

      document.getElementById("resNet").innerText = formatCurrency(d.net);
      document.getElementById("resTax").innerText = formatCurrency(d.tax);
      document.getElementById("resCess").innerText = formatCurrency(d.cess);
      document.getElementById("resGross").innerText = formatCurrency(d.gross);

      document.getElementById("tdNet").innerText = formatCurrency(d.net);
      document.getElementById("tdCgst").innerText = formatCurrency(d.cgst);
      document.getElementById("tdSgst").innerText = formatCurrency(d.sgst);
      document.getElementById("tdIgst").innerText = formatCurrency(d.igst);
      document.getElementById("tdCess").innerText = formatCurrency(d.cess);
      document.getElementById("tdTaxTotal").innerText = formatCurrency(d.tax + d.cess);
      document.getElementById("tdFinalPayable").innerText = formatCurrency(d.gross);
      
      const textWords = convertAmountToEnglishWords(Math.round(d.gross)) + " Rupees Only";
      document.getElementById("resWords").innerText = textWords;
      document.getElementById("tdWordsText").innerText = textWords;

      document.getElementById("invSlab").innerText = `${d.rateVal}% GST` + (d.cessRateVal > 0 ? ` + ${d.cessRateVal}% Cess` : '');
      document.getElementById("chartPct").innerText = `${Math.round(((d.tax + d.cess) / d.gross) * 100)}%`;

      if (d.isInterstate) {
        document.getElementById("mathDetails").innerHTML = `
          <b>Formula Model:</b> ${d.mode==='add'?'Exclusive Matrix':'Inclusive Base'}<br><br>
          • <b>Base Taxable Net:</b> ${formatCurrency(d.net)}<br>
          • <b>IGST Surcharge Component:</b> ${formatCurrency(d.igst)} (${d.rateVal}%)<br>
          • <b>Compensation Cess Value:</b> ${formatCurrency(d.cess)} (${d.cessRateVal}%)
        `;
      } else {
        document.getElementById("mathDetails").innerHTML = `
          <b>Formula Model:</b> ${d.mode==='add'?'Exclusive Matrix':'Inclusive Base'}<br><br>
          • <b>Base Taxable Net:</b> ${formatCurrency(d.net)}<br>
          • <b>CGST Slabs (${d.rateVal/2}%):</b> ${formatCurrency(d.cgst)}<br>
          • <b>SGST Slabs (${d.rateVal/2}%):</b> ${formatCurrency(d.sgst)}<br>
          • <b>Compensation Cess Value:</b> ${formatCurrency(d.cess)} (${d.cessRateVal}%)
        `;
      }
    }

    function renderLiveVisualDonut(tax, total, rate) {
      const circle = document.getElementById("donutProgress");
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      
      const taxRatio = total > 0 ? (tax / total) : 0;
      const offset = circumference - (taxRatio * circumference);
      
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = offset;
    }

    function convertAmountToEnglishWords(amount) {
      if (amount === 0) return "Zero";
      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      
      function parseLessThanOneThousand(num) {
        let str = "";
        if (num >= 100) {
          str += ones[Math.floor(num / 100)] + " Hundred ";
          num %= 100;
        }
        if (num >= 20) {
          str += tens[Math.floor(num / 10)] + " ";
          num %= 10;
        }
        if (num > 0) {
          str += ones[num] + " ";
        }
        return str;
      }

      let words = "";
      if (Math.floor(amount / 10000000) > 0) {
        words += parseLessThanOneThousand(Math.floor(amount / 10000000)) + "Crore ";
        amount %= 10000000;
      }
      if (Math.floor(amount / 100000) > 0) {
        words += parseLessThanOneThousand(Math.floor(amount / 100000)) + "Lakh ";
        amount %= 100000;
      }
      if (Math.floor(amount / 1000) > 0) {
        words += parseLessThanOneThousand(Math.floor(amount / 1000)) + "Thousand ";
        amount %= 1000;
      }
      if (amount > 0) {
        words += parseLessThanOneThousand(amount);
      }
      return words.trim();
    }

    function clearMetricsDisplay() {
      const ids = ["resNet", "resTax", "resCess", "resGross", "tdNet", "tdCgst", "tdSgst", "tdIgst", "tdCess", "tdTaxTotal", "tdFinalPayable"];
      ids.forEach(id => document.getElementById(id).innerText = "₹0.00");
      document.getElementById("donutProgress").style.strokeDashoffset = "276.46";
      document.getElementById("mathDetails").innerText = "Enter calculations parameters configuration metrics to open pipelines...";
      document.getElementById("resWords").innerText = "Zero Rupees Only";
      document.getElementById("tdWordsText").innerText = "Zero Rupees Only";
    }

    function resetFields() {
      document.getElementById("baseAmount").value = "";
      document.getElementById("interstateSupply").checked = false;
      document.getElementById("gstRate").selectedIndex = 3;
      document.getElementById("cessRate").selectedIndex = 0;
      clearMetricsDisplay();
    }

    function copyResultsToClipboard() {
      if (!calculationSummary) return;
      const d = calculationSummary;
      const modeText = d.mode === "add" ? "GST Added (Exclusive)" : "GST Extracted (Inclusive)";
      const reportLog = `📊 GST FinTech Ledger Report Log Summary\nNet: ${formatCurrency(d.net)} | Tax: ${formatCurrency(d.tax)} | Cess: ${formatCurrency(d.cess)} | Gross Payable: ${formatCurrency(d.gross)} [${modeText}]`;
      navigator.clipboard.writeText(reportLog).then(() => alert("✅ Data statement string copied safely!"));
    }

    function sharePlatform(platform) {
      if (!calculationSummary) return;
      const d = calculationSummary;
      const text = encodeURIComponent(`Premium Tax Summary - Gross Payable Balance Due: ${formatCurrency(d.gross)}`);
      if (platform === 'wa') window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      if (platform === 'tw') window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }

    function exportInvoiceAsImage() {
      const invoiceElement = document.getElementById("captureInvoice");
      
      html2canvas(invoiceElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false
      }).then(canvas => {
        const dataUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = dataUrl;
        downloadLink.download = `FINTECH_TAX_INVOICE_${document.getElementById('invId').innerText}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }).catch(err => {
        console.error("Image capture pipeline error:", err);
      });
    }

    function toggleSmartTheme() {
      const isDark = document.body.classList.contains("dark-mode");
      const btn = document.getElementById("theme-universal-toggle");
      
      if (isDark) {
        document.body.classList.remove("dark-mode", "amoled-mode");
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem("globalFintechTheme", "light");
      } else {
        document.body.classList.add("dark-mode");
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem("globalFintechTheme", "dark");
      }
    }

    function initializeThemeState() {
      const savedTheme = localStorage.getItem("globalFintechTheme") || "light";
      const btn = document.getElementById("theme-universal-toggle");
      
      if (savedTheme === "dark" || savedTheme === "amoled") {
        document.body.classList.add("dark-mode");
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        document.body.classList.remove("dark-mode", "amoled-mode");
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    }
