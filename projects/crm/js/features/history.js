/**
 * PROPERTY MANAGER PRO — HISTORY & RECOVERY MODULE
 * ================================================
 * Audit logs for batch imports and 5-day retention recovery bin for deleted records.
 */

(function(global) {
  'use strict';

  const RETENTION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days retention

  let pendingPermanentDeleteId = null;
  let pendingPermanentDeleteIsBatch = false;
  let pendingDeleteImportBatchId = null;
  let isDeletingImport = false;
  let activeHistoryTab = 'import'; // 'import' or 'deleted'

  function getHistoryData() {
    try {
      let raw = localStorage.getItem(global.HISTORY_KEY || 'property_manager_pro_history_v1');
      if (raw) {
        let parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (!Array.isArray(parsed.importHistory)) parsed.importHistory = [];
          if (!Array.isArray(parsed.recentlyDeleted)) parsed.recentlyDeleted = [];
          return parsed;
        }
      }
    } catch (e) {}
    return {
      importHistory: [],
      recentlyDeleted: []
    };
  }

  function saveHistoryData(hist) {
    try {
      if (!hist || typeof hist !== 'object') return;
      if (!Array.isArray(hist.importHistory)) hist.importHistory = [];
      if (!Array.isArray(hist.recentlyDeleted)) hist.recentlyDeleted = [];
      localStorage.setItem(global.HISTORY_KEY || 'property_manager_pro_history_v1', JSON.stringify(hist));
    } catch (e) {
      console.error('Failed to save history data:', e);
    }
  }

  function formatHistoryDate(timestamp) {
    let d = new Date(timestamp);
    if (!d || Number.isNaN(d.getTime())) return '';
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let day = String(d.getDate()).padStart(2, '0');
    let month = months[d.getMonth()];
    let year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function formatHistoryTime(timestamp) {
    let d = new Date(timestamp);
    if (!d || Number.isNaN(d.getTime())) return '';
    let hours = d.getHours();
    let minutes = String(d.getMinutes()).padStart(2, '0');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    let strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  }

  function getRemainingRetention(expiresAt, now = Date.now()) {
    let diff = expiresAt - now;
    if (diff <= 0) return { text: 'Expired', isExpired: true, level: 'expired' };
    let totalHours = Math.floor(diff / (1000 * 60 * 60));
    let days = Math.floor(totalHours / 24);
    let remHours = totalHours % 24;
    let level = 'normal';
    if (totalHours <= 12) level = 'urgent';
    else if (totalHours <= 48) level = 'warn';

    if (days >= 1) {
      return {
        text: `Auto delete in ${days} day${days > 1 ? 's' : ''}${remHours > 0 ? ` ${remHours}h` : ''}`,
        isExpired: false,
        level: level
      };
    } else if (totalHours >= 1) {
      let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return {
        text: `Auto delete in ${totalHours} hour${totalHours > 1 ? 's' : ''}${mins > 0 ? ` ${mins}m` : ''}`,
        isExpired: false,
        level: level
      };
    } else {
      let mins = Math.max(1, Math.floor(diff / (1000 * 60)));
      return {
        text: `Auto delete in ${mins} minute${mins > 1 ? 's' : ''}`,
        isExpired: false,
        level: 'urgent'
      };
    }
  }

  function cleanupExpiredDeletedItems() {
    let hist = getHistoryData();
    let now = Date.now();
    let before = hist.recentlyDeleted.length;
    hist.recentlyDeleted = hist.recentlyDeleted.filter(item => {
      let exp = item.expiresAt || (item.deletedAt + RETENTION_MS);
      return exp > now;
    });
    if (hist.recentlyDeleted.length !== before) {
      saveHistoryData(hist);
    }
  }

  function moveToRecentlyDeleted(type, originalRecord) {
    let hist = getHistoryData();
    let now = Date.now();
    let expiresAt = now + RETENTION_MS;
    let deletedItem = {
      id: 'del_' + now + '_' + Math.random().toString(36).substr(2, 6),
      type: type, // 'property', 'direct', or 'upcoming'
      record: JSON.parse(JSON.stringify(originalRecord)),
      deletedAt: now,
      deletedDate: formatHistoryDate(now),
      deletedTime: formatHistoryTime(now),
      expiresAt: expiresAt,
      autoDeleteDate: formatHistoryDate(expiresAt),
      autoDeleteTime: formatHistoryTime(expiresAt)
    };
    // Ensure no duplicates
    hist.recentlyDeleted = hist.recentlyDeleted.filter(x => x.record && x.record.id !== originalRecord.id);
    hist.recentlyDeleted.unshift(deletedItem);
    saveHistoryData(hist);
  }

  function restoreDeletedItem(deletedId) {
    let hist = getHistoryData();
    let idx = hist.recentlyDeleted.findIndex(x => x.id === deletedId);
    if (idx === -1) {
      global.toast('Record not found or already removed');
      return;
    }
    let item = hist.recentlyDeleted[idx];
    let rec = item.record;
    if (!rec) {
      hist.recentlyDeleted.splice(idx, 1);
      saveHistoryData(hist);
      return;
    }

    if (item.type === 'property') {
      if (!Array.isArray(global.data)) global.data = [];
      if (global.data.some(x => x.id === rec.id)) {
        rec.id = 'p_' + Date.now();
      }
      global.data.unshift(global.normalizeProperty(rec));
      global.save();
    } else if (item.type === 'direct') {
      if (!Array.isArray(global.directData)) global.directData = [];
      if (global.directData.some(x => x.id === rec.id)) {
        rec.id = 'dp_' + Date.now();
      }
      global.directData.unshift(global.normalizeDirectProperty(rec));
      global.saveDirect();
    } else if (item.type === 'upcoming') {
      if (!Array.isArray(global.upcomingData)) global.upcomingData = [];
      if (global.upcomingData.some(x => x.id === rec.id)) {
        rec.id = 'up_' + Date.now();
      }
      global.upcomingData.unshift(global.normalizeUpcoming(rec));
      global.saveUpcoming();
    }

    hist.recentlyDeleted.splice(idx, 1);
    saveHistoryData(hist);
    if (typeof global.dbSaveHistory === 'function') global.dbSaveHistory(hist);
    if (typeof global.renderAll === 'function') global.renderAll();
    renderRecentlyDeleted();
    global.toast(`"${rec.name || 'Item'}" restored successfully`);
  }

  function openPermanentDeleteModal(deletedId, isBatch = false) {
    let hist = getHistoryData();
    let item = hist.recentlyDeleted.find(x => x.id === deletedId);
    if (!item) return;
    pendingPermanentDeleteId = deletedId;
    pendingPermanentDeleteIsBatch = !!isBatch || item.type === 'import_batch';
    let targetNameEl = document.getElementById('permanentDeleteTargetName');
    if (targetNameEl) {
      if (pendingPermanentDeleteIsBatch) {
        targetNameEl.textContent = `"${item.fileName || 'Imported Data'}" (${item.totalCount || 0} records)`;
      } else {
        let typeLabel = item.type === 'property' ? 'Property' : (item.type === 'direct' ? 'Direct Property' : 'Upcoming Project');
        targetNameEl.textContent = `"${item.record?.name || 'Selected Item'}" (${typeLabel})`;
      }
    }
    let modal = document.getElementById('permanentDeleteModal');
    if (modal) modal.classList.add('show');
  }

  function confirmPermanentDelete() {
    if (!pendingPermanentDeleteId) {
      global.closeModal('permanentDeleteModal');
      return;
    }
    let hist = getHistoryData();
    let item = hist.recentlyDeleted.find(x => x.id === pendingPermanentDeleteId);
    let itemName = item?.fileName || item?.record?.name || 'Record';

    if (item && item.type === 'import_batch' && item.importBatchId) {
      let batchId = item.importBatchId;
      if (Array.isArray(global.data)) {
        global.data = global.data.filter(p => p.importBatchId !== batchId);
      }
      if (Array.isArray(global.directData)) {
        global.directData = global.directData.filter(p => p.importBatchId !== batchId);
      }
      if (Array.isArray(global.upcomingData)) {
        global.upcomingData = global.upcomingData.filter(u => u.importBatchId !== batchId);
      }
      global.save();
      global.saveDirect();
      global.saveUpcoming();
    }

    hist.recentlyDeleted = hist.recentlyDeleted.filter(x => x.id !== pendingPermanentDeleteId);
    saveHistoryData(hist);
    pendingPermanentDeleteId = null;
    pendingPermanentDeleteIsBatch = false;
    let activePage = global.currentPage || 'history';
    global.closeModal('permanentDeleteModal');
    if (typeof global.currentPage !== 'undefined' && global.currentPage !== activePage && typeof global.showPage === 'function') {
      global.showPage(activePage, false);
    }
    if (typeof global.renderAll === 'function') global.renderAll();
    setHistoryTab('deleted');
    renderRecentlyDeleted();
    global.toast(`"${itemName}" permanently deleted`);
  }

  function generateImportBatchId() {
    return 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  function addImportHistoryRecord({ importBatchId, fileName, propertiesCount = 0, directPropertiesCount = 0, upcomingCount = 0, sourceType = 'JSON Backup', status = 'Successful' }) {
    let hist = getHistoryData();
    let now = Date.now();
    let total = propertiesCount + directPropertiesCount + upcomingCount;
    let batchId = importBatchId || ('imp_' + now + '_' + Math.random().toString(36).substr(2, 6));
    let rec = {
      id: batchId,
      importBatchId: batchId,
      fileName: fileName || 'backup_file.json',
      date: formatHistoryDate(now),
      time: formatHistoryTime(now),
      timestamp: now,
      totalCount: total,
      propertiesCount: propertiesCount,
      directPropertiesCount: directPropertiesCount,
      upcomingCount: upcomingCount,
      status: status,
      sourceType: sourceType
    };
    hist.importHistory.unshift(rec);
    saveHistoryData(hist);
    if (global.currentPage === 'history' && activeHistoryTab === 'import') {
      renderImportHistory();
    }
    return batchId;
  }

  function openDeleteImportModal(batchId) {
    let hist = getHistoryData();
    let item = hist.importHistory.find(x => (x.importBatchId || x.id) === batchId);
    if (!item) return;
    pendingDeleteImportBatchId = batchId;
    let fileNameEl = document.getElementById('deleteImportFileName');
    if (fileNameEl) {
      fileNameEl.textContent = item.fileName || 'selected file';
    }
    let modal = document.getElementById('deleteImportModal');
    if (modal) modal.classList.add('show');
  }

  function confirmDeleteImportBatch() {
    if (isDeletingImport) return; // Prevent double action
    if (!pendingDeleteImportBatchId) {
      global.closeModal('deleteImportModal');
      return;
    }
    isDeletingImport = true;
    let batchId = pendingDeleteImportBatchId;
    let hist = getHistoryData();
    let histIdx = hist.importHistory.findIndex(x => (x.importBatchId || x.id) === batchId);
    let histRecord = histIdx >= 0 ? hist.importHistory[histIdx] : null;
    let fileName = histRecord?.fileName || 'Imported Data';
    let now = Date.now();
    let expiresAt = now + RETENTION_MS;

    let dataList = Array.isArray(global.data) ? global.data : [];
    let directList = Array.isArray(global.directData) ? global.directData : [];
    let upcomingList = Array.isArray(global.upcomingData) ? global.upcomingData : [];

    // Extract records belonging to this exact batchId from active datasets
    let deletedProps = dataList.filter(p => p.importBatchId === batchId);
    let deletedDirect = directList.filter(p => p.importBatchId === batchId);
    let deletedUpcoming = upcomingList.filter(u => u.importBatchId === batchId);

    // Remove matching records from active datasets
    global.data = dataList.filter(p => p.importBatchId !== batchId);
    global.directData = directList.filter(p => p.importBatchId !== batchId);
    global.upcomingData = upcomingList.filter(u => u.importBatchId !== batchId);

    // Remove from active import history
    if (histIdx >= 0) {
      hist.importHistory.splice(histIdx, 1);
    }

    // Create Recently Deleted batch entry
    let deletedBatchItem = {
      id: 'del_batch_' + now + '_' + Math.random().toString(36).substr(2, 6),
      type: 'import_batch',
      importBatchId: batchId,
      fileName: fileName,
      sourceFileName: histRecord?.fileName || fileName,
      sourceType: histRecord?.sourceType || 'Excel Backup',
      originalImportDate: histRecord?.date || formatHistoryDate(histRecord?.timestamp || now),
      originalImportTime: histRecord?.time || formatHistoryTime(histRecord?.timestamp || now),
      deletedAt: now,
      deletedDate: formatHistoryDate(now),
      deletedTime: formatHistoryTime(now),
      expiresAt: expiresAt,
      autoDeleteDate: formatHistoryDate(expiresAt),
      autoDeleteTime: formatHistoryTime(expiresAt),
      historyRecord: histRecord ? JSON.parse(JSON.stringify(histRecord)) : null,
      properties: JSON.parse(JSON.stringify(deletedProps)),
      directProperties: JSON.parse(JSON.stringify(deletedDirect)),
      upcoming: JSON.parse(JSON.stringify(deletedUpcoming)),
      totalCount: deletedProps.length + deletedDirect.length + deletedUpcoming.length,
      propertiesCount: deletedProps.length,
      directPropertiesCount: deletedDirect.length,
      upcomingCount: deletedUpcoming.length
    };

    // Prevent duplicates in recentlyDeleted
    hist.recentlyDeleted = hist.recentlyDeleted.filter(x => x.importBatchId !== batchId);
    hist.recentlyDeleted.unshift(deletedBatchItem);

    // Save all
    global.save();
    global.saveDirect();
    global.saveUpcoming();
    saveHistoryData(hist);

    pendingDeleteImportBatchId = null;
    isDeletingImport = false;
    let activePage = global.currentPage || 'history';
    global.closeModal('deleteImportModal');

    if (typeof global.currentPage !== 'undefined' && global.currentPage !== activePage && typeof global.showPage === 'function') {
      global.showPage(activePage, false);
    }
    if (typeof global.renderAll === 'function') global.renderAll();
    setHistoryTab('import');
    renderImportHistory();
    global.toast(`Data imported from "${fileName}" moved to Recently Deleted`);
  }

  function restoreDeletedBatch(deletedId) {
    let hist = getHistoryData();
    let idx = hist.recentlyDeleted.findIndex(x => x.id === deletedId);
    if (idx === -1) {
      global.toast('Record not found or already removed');
      return;
    }
    let item = hist.recentlyDeleted[idx];
    let fileName = item.fileName || 'Imported Data';

    if (!Array.isArray(global.data)) global.data = [];
    if (!Array.isArray(global.directData)) global.directData = [];
    if (!Array.isArray(global.upcomingData)) global.upcomingData = [];

    // Restore properties
    if (Array.isArray(item.properties)) {
      for (let p of item.properties) {
        if (!global.data.some(x => x.id === p.id)) {
          global.data.unshift(p);
        }
      }
      global.save();
    }

    // Restore direct properties
    if (Array.isArray(item.directProperties)) {
      for (let dp of item.directProperties) {
        if (!global.directData.some(x => x.id === dp.id)) {
          global.directData.unshift(dp);
        }
      }
      global.saveDirect();
    }

    // Restore upcoming projects
    if (Array.isArray(item.upcoming)) {
      for (let u of item.upcoming) {
        if (!global.upcomingData.some(x => x.id === u.id)) {
          global.upcomingData.unshift(u);
        }
      }
      global.saveUpcoming();
    }

    // Restore import history record
    if (item.historyRecord) {
      let existingHist = hist.importHistory.some(h => (h.importBatchId || h.id) === (item.historyRecord.importBatchId || item.historyRecord.id));
      if (!existingHist) {
        hist.importHistory.unshift(item.historyRecord);
      }
    }

    // Remove from recently deleted
    hist.recentlyDeleted.splice(idx, 1);
    saveHistoryData(hist);

    if (typeof global.renderAll === 'function') global.renderAll();
    renderRecentlyDeleted();
    global.toast(`Data imported from "${fileName}" restored successfully`);
  }

  function setHistoryTab(tab) {
    activeHistoryTab = tab;
    let importBtn = document.getElementById('histTabImportBtn');
    let deletedBtn = document.getElementById('histTabDeletedBtn');
    let importCont = document.getElementById('importHistoryContainer');
    let deletedCont = document.getElementById('recentlyDeletedContainer');
    let searchInput = document.getElementById('historySearchInput');

    if (importBtn) importBtn.classList.toggle('active', tab === 'import');
    if (deletedBtn) deletedBtn.classList.toggle('active', tab === 'deleted');

    if (importCont) importCont.style.display = tab === 'import' ? '' : 'none';
    if (deletedCont) deletedCont.style.display = tab === 'deleted' ? '' : 'none';

    if (searchInput) {
      searchInput.placeholder = tab === 'import' ? 'Search file name, date, status...' : 'Search name, location, type...';
      searchInput.value = '';
    }
    let clearBtn = document.getElementById('clearHistorySearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    renderCurrentHistoryTab();
  }

  function clearHistorySearch() {
    let searchInput = document.getElementById('historySearchInput');
    if (searchInput) searchInput.value = '';
    let clearBtn = document.getElementById('clearHistorySearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    renderCurrentHistoryTab();
  }

  function renderCurrentHistoryTab() {
    let searchInput = document.getElementById('historySearchInput');
    let query = (searchInput?.value || '').trim();
    let clearBtn = document.getElementById('clearHistorySearchBtn');
    if (clearBtn) clearBtn.style.display = query ? '' : 'none';

    if (activeHistoryTab === 'import') {
      renderImportHistory(query);
    } else {
      renderRecentlyDeleted(query);
    }
  }

  function renderHistoryPage() {
    cleanupExpiredDeletedItems();
    renderCurrentHistoryTab();
  }

  function renderImportHistory(query = '') {
    let hist = getHistoryData();
    let list = hist.importHistory || [];
    let countElem = document.getElementById('historyTabCount');
    let container = document.getElementById('importHistoryContainer');
    if (!container) return;

    if (query) {
      let q = query.toLowerCase();
      list = list.filter(item => {
        let f = (item.fileName || '').toLowerCase();
        let d = (item.date || '').toLowerCase();
        let t = (item.time || '').toLowerCase();
        let s = (item.status || '').toLowerCase();
        let st = (item.sourceType || '').toLowerCase();
        return f.includes(q) || d.includes(q) || t.includes(q) || s.includes(q) || st.includes(q);
      });
    }

    if (countElem) {
      countElem.textContent = `${list.length} ${list.length === 1 ? 'import record' : 'import records'}`;
    }

    if (!list.length) {
      container.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">📥</div>
          <div class="history-empty-title">${query ? 'No matching import records' : 'No Import History yet'}</div>
          <div class="history-empty-desc">
            ${query ? 'Try searching with different keywords such as file name or date.' : 'When you import JSON or Excel backups, a complete log of your imported files and record counts will automatically appear here.'}
          </div>
        </div>
      `;
      return;
    }

    let rowsHtml = list.map(item => {
      let batchId = item.importBatchId || item.id;
      return `
        <tr>
          <td>
            <div class="property-name" style="font-size:13.5px">📄 ${global.esc(item.fileName)}</div>
            <div class="muted" style="font-size:11px;margin-top:2px">ID: ${global.esc(item.id)}</div>
          </td>
          <td>
            <div style="font-weight:600">${global.esc(item.date)}</div>
            <div class="muted" style="font-size:11px">${global.esc(item.time)}</div>
          </td>
          <td>
            <div style="font-weight:700;color:var(--text);margin-bottom:2px">Total: ${item.totalCount} records</div>
            <div class="muted" style="font-size:11.5px">
              ${item.propertiesCount} Properties • ${item.directPropertiesCount} Direct • ${item.upcomingCount} Upcoming
            </div>
          </td>
          <td>
            <span class="badge slab">${global.esc(item.sourceType || 'Backup')}</span>
          </td>
          <td>
            <span class="badge-status-success">✓ ${global.esc(item.status || 'Successful')}</span>
          </td>
          <td style="text-align:right">
            <div class="history-actions" style="justify-content:flex-end">
              <button type="button" class="btn-perm-delete" onclick="openDeleteImportModal('${batchId}')" title="Delete imported data from this batch">🗑 Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Date & Time</th>
              <th>Imported Breakdown</th>
              <th>Source</th>
              <th>Status</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRecentlyDeleted(query = '') {
    cleanupExpiredDeletedItems();
    let hist = getHistoryData();
    let list = hist.recentlyDeleted || [];
    let countElem = document.getElementById('historyTabCount');
    let container = document.getElementById('recentlyDeletedContainer');
    if (!container) return;

    if (query) {
      let q = query.toLowerCase();
      list = list.filter(item => {
        if (item.type === 'import_batch') {
          let fn = (item.fileName || '').toLowerCase();
          let st = (item.sourceType || '').toLowerCase();
          let matchChild = (item.properties || []).some(p => (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q))
            || (item.directProperties || []).some(p => (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q))
            || (item.upcoming || []).some(p => (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q));
          return fn.includes(q) || st.includes(q) || matchChild;
        } else {
          let r = item.record || {};
          let name = (r.name || '').toLowerCase();
          let loc = (r.location || '').toLowerCase();
          let type = (r.type || '').toLowerCase();
          let sec = (item.type || '').toLowerCase();
          return name.includes(q) || loc.includes(q) || type.includes(q) || sec.includes(q);
        }
      });
    }

    if (countElem) {
      countElem.textContent = `${list.length} ${list.length === 1 ? 'deleted record' : 'deleted records'}`;
    }

    if (!list.length) {
      container.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">🗑️</div>
          <div class="history-empty-title">${query ? 'No matching deleted records' : 'No Recently Deleted Items'}</div>
          <div class="history-empty-desc">
            ${query ? 'No deleted items matched your search query.' : 'When you delete a Property, Direct Property, or Upcoming Project, it is safely stored here for 5 days. You can restore it anytime or delete it permanently.'}
          </div>
        </div>
      `;
      return;
    }

    let now = Date.now();
    let rowsHtml = list.map(item => {
      let exp = item.expiresAt || (item.deletedAt + RETENTION_MS);
      let retention = getRemainingRetention(exp, now);
      let countdownClass = retention.level === 'urgent'
        ? 'badge-countdown-urgent'
        : (retention.level === 'warn' ? 'badge-countdown-warn' : '');

      if (item.type === 'import_batch') {
        return `
          <tr>
            <td>
              <div class="property-name" style="font-size:14px">📄 ${global.esc(item.fileName)}</div>
              <div class="muted" style="font-size:12px;margin-top:2px">
                <b>Total: ${item.totalCount || 0} deleted</b> (${item.propertiesCount || 0} Properties • ${item.directPropertiesCount || 0} Direct • ${item.upcomingCount || 0} Upcoming)
              </div>
              <div class="muted" style="font-size:11px;margin-top:2px">
                Original Import: ${global.esc(item.originalImportDate || '')} ${global.esc(item.originalImportTime || '')} • Source: ${global.esc(item.sourceType || 'Import')}
              </div>
            </td>
            <td><span class="badge badge-source-batch">Import Batch</span></td>
            <td>
              <div style="font-weight:600">${global.esc(item.deletedDate || '')}</div>
              <div class="muted" style="font-size:11px">${global.esc(item.deletedTime || '')}</div>
            </td>
            <td>
              <span class="badge-countdown ${countdownClass}">⏳ ${retention.text}</span>
              <div class="muted" style="font-size:11px;margin-top:2px">Expires: ${global.esc(item.autoDeleteDate || '')}, ${global.esc(item.autoDeleteTime || '')}</div>
            </td>
            <td style="text-align:right">
              <div class="history-actions" style="justify-content:flex-end">
                <button type="button" class="btn-restore" onclick="restoreDeletedBatch('${item.id}')" title="Restore imported batch">↩ Restore</button>
                <button type="button" class="btn-perm-delete" onclick="openPermanentDeleteModal('${item.id}', true)" title="Permanently delete imported data">🗑 Delete Permanently</button>
              </div>
            </td>
          </tr>
        `;
      }

      let rec = item.record || {};
      let typeBadge = item.type === 'direct'
        ? '<span class="badge badge-source-direct">Direct Property</span>'
        : (item.type === 'upcoming'
          ? '<span class="badge badge-source-up">Upcoming Project</span>'
          : '<span class="badge badge-source-prop">Property</span>');

      let priceStr = rec.price ? global.money(rec.price) : (rec.startingPrice ? global.money(rec.startingPrice) : '');
      let details = [];
      if (rec.location) details.push(`📍 ${global.esc(rec.location)}`);
      if (rec.type) details.push(global.esc(rec.bhk ? rec.bhk + ' ' + rec.type : rec.type));
      if (priceStr) details.push(priceStr);
      if (rec.owner) details.push(`👤 ${global.esc(rec.owner)}`);

      return `
        <tr>
          <td>
            <div class="property-name" style="font-size:14px">${global.esc(rec.name || 'Unnamed')}</div>
            <div class="muted" style="font-size:12px;margin-top:2px">${details.join(' • ')}</div>
          </td>
          <td>${typeBadge}</td>
          <td>
            <div style="font-weight:600">${global.esc(item.deletedDate || '')}</div>
            <div class="muted" style="font-size:11px">${global.esc(item.deletedTime || '')}</div>
          </td>
          <td>
            <span class="badge-countdown ${countdownClass}">⏳ ${retention.text}</span>
            <div class="muted" style="font-size:11px;margin-top:2px">Expires: ${global.esc(item.autoDeleteDate || '')}, ${global.esc(item.autoDeleteTime || '')}</div>
          </td>
          <td style="text-align:right">
            <div class="history-actions" style="justify-content:flex-end">
              <button type="button" class="btn-restore" onclick="restoreDeletedItem('${item.id}')" title="Restore back to active inventory">↩ Restore</button>
              <button type="button" class="btn-perm-delete" onclick="openPermanentDeleteModal('${item.id}', false)" title="Permanently delete now">🗑 Delete Permanently</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Item Name & Details</th>
              <th>Original Type</th>
              <th>Deleted On</th>
              <th>Auto Delete In</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // Export to global scope
  global.pendingPermanentDeleteId = pendingPermanentDeleteId;
  global.pendingPermanentDeleteIsBatch = pendingPermanentDeleteIsBatch;
  global.pendingDeleteImportBatchId = pendingDeleteImportBatchId;
  global.isDeletingImport = isDeletingImport;
  global.activeHistoryTab = activeHistoryTab;
  global.getHistoryData = getHistoryData;
  global.saveHistoryData = saveHistoryData;
  global.formatHistoryDate = formatHistoryDate;
  global.formatHistoryTime = formatHistoryTime;
  global.getRemainingRetention = getRemainingRetention;
  global.cleanupExpiredDeletedItems = cleanupExpiredDeletedItems;
  global.moveToRecentlyDeleted = moveToRecentlyDeleted;
  global.restoreDeletedItem = restoreDeletedItem;
  global.openPermanentDeleteModal = openPermanentDeleteModal;
  global.confirmPermanentDelete = confirmPermanentDelete;
  global.generateImportBatchId = generateImportBatchId;
  global.addImportHistoryRecord = addImportHistoryRecord;
  global.openDeleteImportModal = openDeleteImportModal;
  global.confirmDeleteImportBatch = confirmDeleteImportBatch;
  global.restoreDeletedBatch = restoreDeletedBatch;
  global.setHistoryTab = setHistoryTab;
  global.clearHistorySearch = clearHistorySearch;
  global.renderCurrentHistoryTab = renderCurrentHistoryTab;
  global.renderHistoryPage = renderHistoryPage;
  global.renderImportHistory = renderImportHistory;
  global.renderRecentlyDeleted = renderRecentlyDeleted;

})(typeof window !== 'undefined' ? window : globalThis);
