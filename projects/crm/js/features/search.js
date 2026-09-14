/**
 * PROPERTY MANAGER PRO — MASTER SEARCH MODULE
 * ===========================================
 * Unified multi-token search engine across Properties, Direct Properties, and Projects.
 */

(function(global) {
  'use strict';

  let masterView = 'card';

  function setMasterView(v) {
    masterView = v;
    let cardBtn = document.getElementById('msCardViewBtn');
    let tableBtn = document.getElementById('msTableViewBtn');
    if (cardBtn) cardBtn.classList.toggle('active', v === 'card');
    if (tableBtn) tableBtn.classList.toggle('active', v === 'table');
    renderMasterSearch();
  }

  function fillMasterLocations() {
    if (typeof global.populateAllConfigDropdowns === 'function') global.populateAllConfigDropdowns();
  }

  function clearMasterSearchQuery() {
    let inp = document.getElementById('masterSearchInput');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
    let btn = document.getElementById('masterClearBtn');
    if (btn) btn.style.display = 'none';
    renderMasterSearch();
  }

  function clearMasterFilters() {
    let t = document.getElementById('masterFilterType');
    let l = document.getElementById('masterFilterLocation');
    let c = document.getElementById('masterFilterCategory');
    let s = document.getElementById('masterFilterStatus');
    let sb = document.getElementById('masterSortBy');
    if (t) t.value = '';
    if (l) l.value = '';
    if (c) c.value = '';
    if (s) s.value = '';
    if (sb) sb.value = 'relevance';
    renderMasterSearch();
    global.toast('Filters cleared');
  }

  function clearMasterAllSearch() {
    let inp = document.getElementById('masterSearchInput');
    if (inp) inp.value = '';
    let btn = document.getElementById('masterClearBtn');
    if (btn) btn.style.display = 'none';
    clearMasterFilters();
  }

  function getMasterSearchList() {
    let inp = document.getElementById('masterSearchInput');
    let q = (inp?.value || '').toLowerCase().trim();
    let typeFilter = document.getElementById('masterFilterType')?.value || '';
    let locFilter = document.getElementById('masterFilterLocation')?.value || '';
    let catFilter = document.getElementById('masterFilterCategory')?.value || '';
    let statusFilter = document.getElementById('masterFilterStatus')?.value || '';
    let sortBy = document.getElementById('masterSortBy')?.value || 'relevance';

    let items = [];

    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];

    // 1. Ingest Properties
    if (!typeFilter || typeFilter === 'property' || typeFilter === 'contact') {
      dataList.forEach(p => {
        let cat = global.getPropertyCategory(p.price);
        let cfVals = p.customFields ? Object.values(p.customFields).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ') : '';
        let searchCorpus = [
          p.name,
          p.location,
          p.type,
          p.bhk,
          p.owner,
          p.phone,
          p.notes,
          p.status,
          p.facing,
          p.road,
          global.formatArea(p),
          global.formatDimensions(p),
          cat,
          p.budgetSlab,
          global.money(p.price),
          p.map,
          cfVals,
          'property',
          'dehradun'
        ].filter(Boolean).join(' ').toLowerCase();

        items.push({
          id: p.id,
          source: 'property',
          sourceLabel: 'PROPERTY',
          name: p.name,
          developer: '',
          location: p.location,
          type: p.type || 'Property',
          bhk: p.bhk || '',
          area: global.formatArea(p),
          price: p.price,
          maxPrice: null,
          priceFormatted: global.money(p.price),
          category: cat,
          status: p.status || 'Available',
          owner: p.owner || '',
          phone: p.phone || '',
          notes: p.notes || '',
          map: p.map || '',
          photo: p.photo || '',
          favorite: !!p.favorite,
          created: p.created || '',
          searchCorpus: searchCorpus
        });
      });
    }

    // 2. Ingest Direct Properties
    if (!typeFilter || typeFilter === 'direct' || typeFilter === 'contact') {
      directList.forEach(p => {
        let cat = p.priceCategory || global.getPropertyCategory(p.price);
        let cfVals = p.customFields ? Object.values(p.customFields).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ') : '';
        let searchCorpus = [
          p.name,
          p.location,
          p.type,
          p.bhk,
          p.owner,
          p.phone,
          p.notes,
          p.status,
          global.formatArea(p),
          global.formatDimensions(p),
          p.facing,
          p.road,
          global.money(p.price),
          cat,
          p.budgetSlab || global.getPropertyBudgetSlab(p.price),
          p.follow,
          p.map,
          cfVals,
          'direct',
          'direct property',
          'client property',
          'dehradun'
        ].filter(Boolean).join(' ').toLowerCase();

        items.push({
          id: p.id,
          source: 'direct',
          sourceLabel: 'DIRECT PROPERTY',
          name: p.name,
          developer: '',
          location: p.location,
          type: p.type || 'Property',
          bhk: p.bhk || '',
          area: global.formatArea(p),
          price: p.price,
          maxPrice: null,
          priceFormatted: global.money(p.price),
          category: cat,
          status: p.status || 'Available',
          owner: p.owner || '',
          phone: p.phone || '',
          notes: p.notes || '',
          map: p.map || '',
          photo: p.photo || '',
          favorite: !!p.favorite,
          created: p.created || '',
          searchCorpus: searchCorpus
        });
      });
    }

    // 3. Ingest Upcoming Projects
    if (!typeFilter || typeFilter === 'project' || typeFilter === 'contact') {
      upList.forEach(p => {
        let cat = p.priceCategory || 'Economical';
        let cfVals = p.customFields ? Object.values(p.customFields).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ') : '';
        let searchCorpus = [
          p.name,
          p.developer,
          p.location,
          p.type,
          p.bhk,
          p.owner,
          p.phone,
          p.notes,
          p.status,
          p.area,
          cat,
          p.budgetSlab,
          p.launchDate,
          p.possessionDate,
          global.moneyRange(p.price, p.maxPrice),
          p.map,
          cfVals,
          'project',
          'upcoming project',
          'dehradun'
        ].filter(Boolean).join(' ').toLowerCase();

        items.push({
          id: p.id,
          source: 'project',
          sourceLabel: 'PROJECT',
          name: p.name,
          developer: p.developer || '',
          location: p.location,
          type: p.type || 'Project',
          bhk: p.bhk || '',
          area: p.area || '',
          price: p.price,
          maxPrice: p.maxPrice,
          priceFormatted: global.moneyRange(p.price, p.maxPrice),
          category: cat,
          status: p.status || 'Upcoming',
          owner: p.owner || '',
          phone: p.phone || '',
          notes: p.notes || '',
          map: p.map || '',
          photo: p.photo || '',
          favorite: !!p.favorite,
          created: p.created || '',
          searchCorpus: searchCorpus
        });
      });
    }

    // Filter: Contact / Owner only
    if (typeFilter === 'contact') {
      items = items.filter(it => (it.owner && it.owner.trim()) || (it.phone && it.phone.trim()));
    }

    // Filter: Location
    if (locFilter) {
      items = items.filter(it => it.location === locFilter);
    }

    // Filter: Price Category (Dynamic)
    if (catFilter) {
      items = items.filter(it => global.matchRecordPriceCategory(it.price, catFilter));
    }

    // Filter: Status
    if (statusFilter) {
      items = items.filter(it => it.status === statusFilter);
    }

    // Filter: Search Query (Multi-token, case-insensitive, partial matching)
    if (q) {
      let tokens = q.split(/\s+/).filter(Boolean);
      items = items.filter(it => tokens.every(token => it.searchCorpus.includes(token)));
    }

    // Sort Results
    return global.sortRecords(items, sortBy);
  }

  function masterCard(item) {
    let sourceBadge = item.source === 'direct'
      ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
      : item.source === 'project'
      ? `<span class="badge badge-source-up">🏗️ PROJECT</span>`
      : `<span class="badge badge-source-prop">🏠 PROPERTY</span>`;
    let statusClass = (item.status || '').toLowerCase().replace(/\s+/g, '-');
    let viewFunc = item.source === 'project' ? `viewProject('${item.id}')` : `view('${item.id}')`;
    let favToggleFunc = item.source === 'project' ? `toggleProjectFav('${item.id}')` : `toggleFav('${item.id}')`;
    let isFav = !!item.favorite;
    let hasImg = item.photo && item.photo.trim();

    // Location display with City
    let locDisplay = item.location || '';
    if (locDisplay && !locDisplay.toLowerCase().includes('dehradun')) {
      locDisplay += ', Dehradun';
    }

    // Meta specifications
    let metaTags = [];
    if (item.type) metaTags.push(`<b>${global.esc(item.type)}</b>`);
    if (item.bhk) metaTags.push(global.esc(item.bhk));
    if (item.area) metaTags.push(global.esc(item.area));
    if (item.developer) metaTags.push('By ' + global.esc(item.developer));

    // Contact line
    let contactHtml = '';
    if (item.owner || item.phone) {
      contactHtml = `<div class="ms-contact-chip">
        <span>👤 ${global.esc(item.owner || 'Contact')}</span>
        ${item.phone ? `<a href="tel:${global.esc(item.phone)}" style="color:var(--primary);text-decoration:none;font-weight:600">📞 ${global.esc(item.phone)}</a>` : ''}
      </div>`;
    }

    return `<article class="prop-card master-result-card">
      ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${global.esc(item.photo)}', '${global.esc(item.name)}')" title="Click to view full image"><img src="${global.esc(item.photo)}" alt="${global.esc(item.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="prop-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            ${sourceBadge}
            <span class="badge ${statusClass}">${global.esc(item.status)}</span>
          </div>
          <button class="mini" onclick="${favToggleFunc}" title="Toggle favorite">${isFav ? '★' : '☆'}</button>
        </div>
        <h3 style="margin:8px 0 3px;font-size:15px;line-height:1.3">${global.esc(item.name)}</h3>
        <div class="ms-loc-line" style="margin-bottom:4px">📍 ${global.esc(locDisplay)}</div>
        <div class="muted" style="font-size:12px;line-height:1.4">${metaTags.join(' • ')}</div>
        ${contactHtml}
        <div class="prop-price" style="margin-top:8px">${item.priceFormatted}</div>
        <div class="prop-actions" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
          <button class="mini primary" onclick="${viewFunc}">👁️ View</button>
          <button class="mini" onclick="shareProperty('${item.id}', '${item.source}')">📤 Share</button>
          ${item.phone ? `<a class="mini" href="tel:${global.esc(item.phone)}">📞 Call</a>` : ''}
          ${item.phone ? `<button class="mini" onclick="window.open('https://wa.me/91${global.esc(item.phone.replace(/\\D/g, ''))}')">💬 WhatsApp</button>` : ''}
          ${item.map ? `<button class="mini" onclick="window.open('${global.esc(item.map)}')">📍 Maps</button>` : ''}
        </div>
      </div>
    </article>`;
  }

  function masterRow(item) {
    let sourceBadge = item.source === 'direct'
      ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
      : item.source === 'project'
      ? `<span class="badge badge-source-up">🏗️ PROJECT</span>`
      : `<span class="badge badge-source-prop">🏠 PROPERTY</span>`;
    let statusClass = (item.status || '').toLowerCase().replace(/\s+/g, '-');
    let viewFunc = item.source === 'project' ? `viewProject('${item.id}')` : `view('${item.id}')`;
    let locDisplay = item.location || '';
    if (!locDisplay.toLowerCase().includes('dehradun')) locDisplay += ', Dehradun';

    return `<tr>
      <td>${sourceBadge}</td>
      <td>
        <div class="property-name">${global.esc(item.name)}</div>
        <div class="muted">${global.esc(item.type)} ${item.bhk ? '• ' + global.esc(item.bhk) : ''} ${item.developer ? '• By ' + global.esc(item.developer) : ''}</div>
      </td>
      <td><b>${global.esc(locDisplay)}</b></td>
      <td>
        <div>${global.esc(item.owner || '—')}</div>
        ${item.phone ? `<a href="tel:${global.esc(item.phone)}" style="font-size:12px">${global.esc(item.phone)}</a>` : ''}
      </td>
      <td><b>${item.priceFormatted}</b></td>
      <td><span class="badge ${statusClass}">${global.esc(item.status)}</span></td>
      <td>
        <div class="actions">
          <button class="mini primary" onclick="${viewFunc}">View</button>
          <button class="mini" onclick="shareProperty('${item.id}', '${item.source}')">Share</button>
        </div>
      </td>
    </tr>`;
  }

  function renderMasterSearch() {
    let resultsContainer = document.getElementById('masterSearchResults');
    if (!resultsContainer) return;

    fillMasterLocations();

    let inp = document.getElementById('masterSearchInput');
    let q = (inp?.value || '').trim();
    let clearBtn = document.getElementById('masterClearBtn');
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    let list = getMasterSearchList();

    // Results count badge
    let countEl = document.getElementById('masterSearchResultCount');
    if (countEl) {
      countEl.textContent = `${list.length} result${list.length !== 1 ? 's' : ''} found across Properties & Projects`;
    }

    // Summary bar & active filter chips
    let statsLine = document.getElementById('masterStatsLine');
    if (statsLine) {
      statsLine.innerHTML = `<b>Filters | ${list.length} Results</b>`;
    }

    let chipsContainer = document.getElementById('masterActiveFilterChips');
    if (chipsContainer) {
      let chips = [];
      let t = document.getElementById('masterFilterType')?.value;
      let l = document.getElementById('masterFilterLocation')?.value;
      let c = document.getElementById('masterFilterCategory')?.value;
      let s = document.getElementById('masterFilterStatus')?.value;
      if (t) chips.push(`<span class="ms-filter-chip">Type: ${global.esc(t)}</span>`);
      if (l) chips.push(`<span class="ms-filter-chip">Location: ${global.esc(l)}</span>`);
      if (c) chips.push(`<span class="ms-filter-chip">Category: ${global.esc(c)}</span>`);
      if (s) chips.push(`<span class="ms-filter-chip">Status: ${global.esc(s)}</span>`);
      chipsContainer.innerHTML = chips.join('');
    }

    // Empty state handling
    if (!list.length) {
      let hasFilterOrQuery = q || document.getElementById('masterFilterType')?.value || document.getElementById('masterFilterLocation')?.value || document.getElementById('masterFilterCategory')?.value || document.getElementById('masterFilterStatus')?.value;
      resultsContainer.innerHTML = `<div class="empty">
        <div style="font-size:32px;margin-bottom:8px">🔍</div>
        <b style="font-size:16px">No results found</b>
        <div style="color:var(--muted);margin-top:6px;max-width:340px;margin-left:auto;margin-right:auto">
          ${q ? `We couldn't find any properties or projects matching "<b>${global.esc(q)}</b>".` : 'No records match your selected filters.'}
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          ${q ? `<button class="btn" onclick="clearMasterSearchQuery()">Clear Search Query</button>` : ''}
          ${hasFilterOrQuery ? `<button class="btn primary" onclick="clearMasterAllSearch()">Clear All Search & Filters</button>` : ''}
        </div>
      </div>`;
      return;
    }

    if (masterView === 'table') {
      resultsContainer.innerHTML = `<div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Name / Details</th>
              <th>Location</th>
              <th>Owner / Contact</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(masterRow).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>Showing ${list.length} records</span>
        <span>Unified Master Search • LocalStorage / IndexedDB</span>
      </div>`;
    } else {
      resultsContainer.innerHTML = '<div class="grid">' + list.map(masterCard).join('') + '</div>';
    }
  }

  // Export to global scope
  global.masterView = masterView;
  global.setMasterView = setMasterView;
  global.fillMasterLocations = fillMasterLocations;
  global.clearMasterSearchQuery = clearMasterSearchQuery;
  global.clearMasterFilters = clearMasterFilters;
  global.clearMasterAllSearch = clearMasterAllSearch;
  global.getMasterSearchList = getMasterSearchList;
  global.masterCard = masterCard;
  global.masterRow = masterRow;
  global.renderMasterSearch = renderMasterSearch;

})(typeof window !== 'undefined' ? window : globalThis);
