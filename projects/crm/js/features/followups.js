/**
 * PROPERTY MANAGER PRO — FOLLOW-UPS MODULE
 * ========================================
 * Scheduled client visits, calls, and active lead management across inventories.
 */

(function(global) {
  'use strict';

  function renderFollowups() {
    let followResults = document.getElementById('followResults');
    if (!followResults) return;

    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];

    let allList = [
      ...dataList.map(p => ({ ...p, isDirect: false })),
      ...directList.map(p => ({ ...p, isDirect: true }))
    ];

    let a = allList.filter(p => p.follow).sort((x, y) => String(x.follow).localeCompare(String(y.follow)));
    followResults.innerHTML = a.length
      ? '<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Property</th><th>Source</th><th>Owner / Client</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
        a.map(p => `<tr>
          <td><b>${global.esc(p.follow)}</b></td>
          <td>
            <div class="property-name">${global.esc(p.name)}</div>
            <div class="muted">${global.esc(p.location)}</div>
          </td>
          <td>${p.isDirect ? `<span class="badge badge-source-direct" style="font-size:10px">🔑 DIRECT</span>` : `<span class="badge badge-source-prop" style="font-size:10px">🏢 COMPANY</span>`}</td>
          <td>${global.esc(p.owner || '—')}</td>
          <td>${p.phone ? `<a href="tel:${global.esc(p.phone)}">${global.esc(p.phone)}</a>` : '—'}</td>
          <td><span class="badge ${p.status.toLowerCase()}">${global.esc(p.status)}</span></td>
          <td><div class="actions"><button class="mini" onclick="view('${p.id}')">View</button><button class="mini" onclick="shareProperty('${p.id}', '${p.isDirect ? 'direct' : 'property'}')">Share</button></div></td>
        </tr>`).join('') +
        '</tbody></table></div>'
      : '<div class="empty">No follow-ups scheduled.</div>';
  }

  // Export to global scope
  global.renderFollowups = renderFollowups;

})(typeof window !== 'undefined' ? window : globalThis);
