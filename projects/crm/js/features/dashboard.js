/**
 * PROPERTY MANAGER PRO — DASHBOARD MODULE
 * =======================================
 * Executive metrics, attention alerts, location breakdown, and recent activity streams.
 */

(function(global) {
  'use strict';

  function renderDashboard() {
    if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let dList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upcomingList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];

    let allProps = [...dataList, ...dList];
    let total = allProps.length;
    let av = allProps.filter(p => p.status === 'Available').length;
    let hold = allProps.filter(p => p.status === 'Hold').length;
    let propFav = dataList.filter(p => p.favorite).length;
    let directFav = dList.filter(p => p.favorite).length;
    let upFav = upcomingList.filter(p => p.favorite).length;
    let totalFav = propFav + directFav + upFav;
    let uTot = upcomingList.length;
    let followCount = allProps.filter(p => p.follow).length;

    // Empty state vs Content display
    let emptyEl = document.getElementById('dashEmptyState');
    let contentEl = document.getElementById('dashContent');
    if (!total && !uTot) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (contentEl) contentEl.style.display = 'none';
      return;
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';
    }

    // Update Overview Statistics
    let elSTotal = document.getElementById('sTotal');
    if (elSTotal) elSTotal.textContent = total;
    let elSAvail = document.getElementById('sAvailable');
    if (elSAvail) elSAvail.textContent = av;
    let elSHold = document.getElementById('sHold');
    if (elSHold) elSHold.textContent = hold;
    let elSFav = document.getElementById('sFav');
    if (elSFav) elSFav.textContent = totalFav;
    let elSFavB = document.getElementById('sFavBreakdown');
    if (elSFavB) elSFavB.textContent = `${propFav + directFav} props • ${upFav} projects`;
    let elSFollow = document.getElementById('sFollow');
    if (elSFollow) elSFollow.textContent = followCount;

    let elUTotal = document.getElementById('uTotal');
    if (elUTotal) elUTotal.textContent = uTot;
    let elUTotal2 = document.getElementById('uTotal2');
    if (elUTotal2) elUTotal2.textContent = uTot;

    // Needs Your Attention
    let attentionEl = document.getElementById('dashAttentionContainer');
    if (attentionEl) {
      let attentionItems = [];

      // Follow-ups due
      allProps.filter(p => p.follow).forEach(p => {
        attentionItems.push({
          id: p.id,
          type: 'followup',
          title: p.name,
          badge: '📅 Follow-up Due: ' + p.follow,
          badgeClass: 'badge-attention-follow',
          location: p.location,
          owner: p.owner || 'Client',
          phone: p.phone || '',
          status: p.status
        });
      });

      // On Hold properties
      allProps.filter(p => p.status === 'Hold').forEach(p => {
        if (!attentionItems.some(x => x.id === p.id)) {
          attentionItems.push({
            id: p.id,
            type: 'hold',
            title: p.name,
            badge: '⏳ Status: On Hold',
            badgeClass: 'badge-attention-hold',
            location: p.location,
            owner: p.owner || 'Client',
            phone: p.phone || '',
            status: p.status
          });
        }
      });

      if (!attentionItems.length) {
        attentionEl.classList.add('empty-state');
        attentionEl.innerHTML = `<div class="empty dash-attention-empty" style="padding:28px 16px;text-align:center">
          <div style="font-size:26px;margin-bottom:6px">✅</div>
          <b style="font-size:14px;display:block">No follow-ups due</b>
          <div class="muted" style="font-size:12px;margin-top:4px;max-width:440px;margin-left:auto;margin-right:auto">All properties are on track. Scheduled client calls and visits will appear here.</div>
        </div>`;
      } else {
        attentionEl.classList.remove('empty-state');
        attentionEl.innerHTML = attentionItems.slice(0, 4).map(item => `
          <div class="dash-attention-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
              <span class="badge ${item.badgeClass}">${global.esc(item.badge)}</span>
              <div style="display:flex;gap:4px">
                <button class="mini" onclick="shareProperty('${item.id}')">Share</button>
                <button class="mini primary" onclick="view('${item.id}')">View</button>
              </div>
            </div>
            <h4 style="margin:8px 0 3px;font-size:14.5px">${global.esc(item.title)}</h4>
            <div class="muted" style="font-size:12px">📍 ${global.esc(item.location)}</div>
            ${item.phone ? `<div style="margin-top:6px;font-size:12px"><a href="tel:${global.esc(item.phone)}" style="color:var(--primary);text-decoration:none;font-weight:600">📞 ${global.esc(item.owner ? item.owner + ' (' + item.phone + ')' : item.phone)}</a></div>` : ''}
          </div>
        `).join('');
      }
    }

    // Recent Properties
    let recentEl = document.getElementById('recentBody');
    if (recentEl) {
      let recent = [...dataList].sort((a, b) => String(b.created).localeCompare(String(a.created))).slice(0, 7);
      recentEl.innerHTML = recent.map(p => {
        let typeDesc = `Property • ${global.esc(p.bhk ? p.bhk : p.type)}`;
        return `<tr>
          <td>
            <b>${global.esc(p.name)}</b>
            <div class="muted" style="font-size:11.5px;margin-top:2px">${typeDesc}</div>
          </td>
          <td>
            <div style="font-weight:600;font-size:13px">📍 ${global.esc(p.location)}</div>
          </td>
          <td><b>${global.money(p.price)}</b></td>
          <td><span class="badge ${(p.status || 'available').toLowerCase()}">${global.esc(p.status || 'Available')}</span></td>
          <td><div class="actions"><button class="mini primary" onclick="view('${p.id}')">View</button><button class="mini" onclick="shareProperty('${p.id}', 'property')">Share</button></div></td>
        </tr>`;
      }).join('');
    }

    // Inventory by Location
    let summaryEl = document.getElementById('summaryList');
    if (summaryEl) {
      let loc = {};
      dataList.forEach(p => {
        let l = p.location || 'Other';
        loc[l] = (loc[l] || 0) + 1;
      });
      let sortedLocs = Object.entries(loc).sort((a, b) => b[1] - a[1]);
      let maxCount = Math.max(...Object.values(loc), 1);
      summaryEl.innerHTML = sortedLocs.slice(0, 7).map(([area, count]) => {
        return `<div class="dash-loc-item">
          <div class="dash-loc-info">
            <span class="dash-loc-name">📍 ${global.esc(area)}</span>
            <b class="dash-loc-count">${count} ${count === 1 ? 'property' : 'properties'}</b>
          </div>
          <div class="dash-loc-bar-bg">
            <div class="dash-loc-bar-fill" style="width:${Math.round((count / maxCount) * 100)}%"></div>
          </div>
        </div>`;
      }).join('');
    }

    // Upcoming projects dashboard summary
    let uEco = upcomingList.filter(p => p.priceCategory === 'Economical').length;
    let uMid = upcomingList.filter(p => p.priceCategory === 'Mid-Premium').length;
    let uLux = upcomingList.filter(p => p.priceCategory === 'Luxury').length;
    let elUEco = document.getElementById('uEconomical');
    if (elUEco) elUEco.textContent = uEco;
    let elUMid = document.getElementById('uMidPremium');
    if (elUMid) elUMid.textContent = uMid;
    let elULux = document.getElementById('uLuxury');
    if (elULux) elULux.textContent = uLux;

    let recentUpEl = document.getElementById('recentUpcomingBody');
    if (recentUpEl) {
      let recentUp = [...upcomingList].sort((a, b) => String(b.created).localeCompare(String(a.created))).slice(0, 6);
      recentUpEl.innerHTML = recentUp.map(p => {
        let catClass = 'cat-' + (p.priceCategory || 'Economical').toLowerCase().replace(/\s+/g, '-');
        let statusClass = (p.status || 'Upcoming').toLowerCase().replace(/\s+/g, '-');
        return `<tr>
          <td>
            <b>${global.esc(p.name)}</b>
            <div class="muted" style="font-size:11.5px;margin-top:2px">Project • By ${global.esc(p.developer || p.type)}</div>
          </td>
          <td>
            <div style="font-weight:600;font-size:13px">📍 ${global.esc(p.location)}</div>
          </td>
          <td><b>${global.moneyRange(p.price, p.maxPrice)}</b></td>
          <td>
            <span class="badge ${catClass}">${global.esc(p.priceCategory)}</span>
            <span class="badge slab">${global.esc(p.budgetSlab)}</span>
          </td>
          <td><span class="badge ${statusClass}">${global.esc(p.status)}</span></td>
          <td>${global.esc(p.launchDate || p.possessionDate || '—')}</td>
          <td><div class="actions"><button class="mini primary" onclick="viewProject('${p.id}')">View</button><button class="mini" onclick="shareProperty('${p.id}', 'upcoming')">Share</button></div></td>
        </tr>`;
      }).join('');
    }
  }

  // Export to global scope
  global.renderDashboard = renderDashboard;

})(typeof window !== 'undefined' ? window : globalThis);
