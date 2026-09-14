/**
 * PROPERTY MANAGER PRO — UPCOMING PROJECTS MODULE
 * ===============================================
 * Future pipeline management, launches, developer catalogs, tables, cards, and CRUD.
 */

(function(global) {
  'use strict';

  let upCurrentView = 'table';

  function setUpView(v) {
    upCurrentView = v;
    let tb = document.getElementById('upTableViewBtn');
    let cb = document.getElementById('upCardViewBtn');
    if (tb) tb.classList.toggle('active', v === 'table');
    if (cb) cb.classList.toggle('active', v === 'card');
    renderUpcoming();
  }

  function fillUpcomingLocations() {
    if (typeof global.populateAllConfigDropdowns === 'function') global.populateAllConfigDropdowns();
  }

  function filteredUpcoming() {
    const searchEl = document.getElementById('upSearch');
    const filterLocationEl = document.getElementById('upFilterLocation');
    const filterTypeEl = document.getElementById('upFilterType');
    const filterCategoryEl = document.getElementById('upFilterCategory');
    const filterSlabEl = document.getElementById('upFilterSlab');
    const filterStatusEl = document.getElementById('upFilterStatus');
    const sortByEl = document.getElementById('upSortBy');

    let q = (searchEl ? searchEl.value : '').toLowerCase().trim();
    let loc = filterLocationEl ? filterLocationEl.value : '';
    let typ = filterTypeEl ? filterTypeEl.value : '';
    let cat = filterCategoryEl ? filterCategoryEl.value : '';
    let slab = filterSlabEl ? filterSlabEl.value : '';
    let st = filterStatusEl ? filterStatusEl.value : '';

    let list = (global.upcomingData || []).filter(p => {
      if (loc && p.location !== loc) return false;
      if (typ && p.type !== typ) return false;
      if (cat && !global.matchRecordPriceCategory(p.price, cat)) return false;
      if (slab && !global.matchRecordBudgetSlab(p.price, slab)) return false;
      if (st && p.status !== st) return false;
      if (q) {
        let cfVals = p.customFields ? Object.values(p.customFields).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ') : '';
        let text = [p.name, p.developer, p.location, p.type, p.bhk, p.owner, p.phone, p.notes, p.priceCategory, p.budgetSlab, p.launchDate, p.possessionDate, cfVals].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    let sortVal = sortByEl ? sortByEl.value : 'new';
    return global.sortRecords(list, sortVal);
  }

  function renderUpcoming() {
    fillUpcomingLocations();
    let list = filteredUpcoming();
    let countEl = document.getElementById('upResultCount');
    let target = document.getElementById('upcomingResults');
    if (countEl) countEl.textContent = list.length + ' project' + (list.length !== 1 ? 's' : '');

    if (!target) return;

    if (!list.length) {
      target.innerHTML = '<div class="empty">No upcoming projects found matching your criteria.<br><button class="btn" style="margin-top:10px" onclick="clearProjectFilters()">Clear filters</button></div>';
      return;
    }

    if (upCurrentView === 'table') {
      target.innerHTML = `<div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Project & Developer</th>
              <th>Location</th>
              <th>Type / Config</th>
              <th>Price Range</th>
              <th>Category & Slab</th>
              <th>Status</th>
              <th>Possession / Launch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => upRow(p)).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination"><span>Showing ${list.length} upcoming projects</span><span>Dedicated LocalStorage • Offline</span></div>`;
    } else {
      target.innerHTML = '<div class="grid">' + list.map(upCard).join('') + '</div>';
    }
  }

  function upRow(p) {
    let catClass = 'cat-' + (p.priceCategory || 'Economical').toLowerCase().replace(/\s+/g, '-');
    let statusClass = (p.status || 'Upcoming').toLowerCase().replace(/\s+/g, '-');
    return `<tr>
      <td>
        <div class="property-name">${global.esc(p.name)}</div>
        <div class="muted">By ${global.esc(p.developer || 'Independent / N/A')}</div>
      </td>
      <td>${global.esc(p.location)}</td>
      <td>
        <b>${global.esc(p.type)}</b>
        <div class="muted">${global.esc(p.bhk || '—')}</div>
      </td>
      <td><b>${global.moneyRange(p.price, p.maxPrice)}</b></td>
      <td>
        <div class="tag-row">
          <span class="badge ${catClass}">${global.esc(p.priceCategory)}</span>
          <span class="badge slab">${global.esc(p.budgetSlab)}</span>
        </div>
      </td>
      <td><span class="badge ${statusClass}">${global.esc(p.status)}</span></td>
      <td>
        <div>${global.esc(p.possessionDate || '—')}</div>
        <div class="muted">${p.launchDate ? 'Launch: ' + global.esc(p.launchDate) : ''}</div>
      </td>
      <td>
        <div class="actions">
          <button class="mini" onclick="viewProject('${p.id}')">View</button>
          <button class="mini" onclick="shareProperty('${p.id}', 'upcoming')">Share</button>
          <button class="mini" onclick="openProjectForm('${p.id}')">Edit</button>
          <button class="mini" onclick="toggleProjectFav('${p.id}')" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">${p.favorite ? '★' : '☆'}</button>
          <button class="mini" onclick="removeProject('${p.id}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }

  function upCard(p) {
    let catClass = 'cat-' + (p.priceCategory || 'Economical').toLowerCase().replace(/\s+/g, '-');
    let statusClass = (p.status || 'Upcoming').toLowerCase().replace(/\s+/g, '-');
    let hasImg = p.photo && p.photo.trim();

    return `<article class="prop-card">
      ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${global.esc(p.photo)}', '${global.esc(p.name)}')" title="Click to view full image"><img src="${global.esc(p.photo)}" alt="${global.esc(p.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="prop-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <h3 style="margin:0">${global.esc(p.name)}</h3>
          <div style="display:flex;gap:5px;align-items:center">
            <button class="mini" onclick="toggleProjectFav('${p.id}')" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">${p.favorite ? '★' : '☆'}</button>
            <span class="badge ${statusClass}">${global.esc(p.status)}</span>
          </div>
        </div>
        <div class="muted" style="margin-top:2px">By ${global.esc(p.developer || 'Independent')} • ${global.esc(p.location)}</div>
        <div class="tag-row" style="margin:8px 0 4px">
          <span class="badge ${catClass}">${global.esc(p.priceCategory)}</span>
          <span class="badge slab">${global.esc(p.budgetSlab)}</span>
        </div>
        <div class="prop-price">${global.moneyRange(p.price, p.maxPrice)}</div>
        <div class="prop-meta">
          <span>${global.esc(p.type)}</span>
          ${p.bhk ? `<span>${global.esc(p.bhk)}</span>` : ''}
          ${p.area ? `<span>${global.esc(p.area)}</span>` : ''}
          ${p.possessionDate ? `<span>Possession: ${global.esc(p.possessionDate)}</span>` : ''}
        </div>
        <div class="prop-actions" style="margin-top:9px">
          <button class="mini" onclick="viewProject('${p.id}')">View</button>
          <button class="mini" onclick="shareProperty('${p.id}', 'upcoming')">Share</button>
          <button class="mini" onclick="openProjectForm('${p.id}')">Edit</button>
          <button class="mini" onclick="removeProject('${p.id}')">Delete</button>
        </div>
      </div>
    </article>`;
  }

  function clearProjectFilters() {
    let s = document.getElementById('upSearch'); if (s) s.value = '';
    let loc = document.getElementById('upFilterLocation'); if (loc) loc.value = '';
    let typ = document.getElementById('upFilterType'); if (typ) typ.value = '';
    let cat = document.getElementById('upFilterCategory'); if (cat) cat.value = '';
    let slab = document.getElementById('upFilterSlab'); if (slab) slab.value = '';
    let st = document.getElementById('upFilterStatus'); if (st) st.value = '';
    let sort = document.getElementById('upSortBy'); if (sort) sort.value = 'new';
    renderUpcoming();
  }

  function updateProjectCategoryPreview() {
    let pPriceEl = document.getElementById('pPrice');
    let price = Number(pPriceEl ? pPriceEl.value : 0) || 0;
    let cat = global.getPriceCategory(price);
    let slab = global.getBudgetSlab(price);
    let catEl = document.getElementById('pCatPreview');
    let slabEl = document.getElementById('pSlabPreview');
    if (catEl) {
      catEl.textContent = cat;
      catEl.className = 'badge cat-' + cat.toLowerCase().replace(/\s+/g, '-');
    }
    if (slabEl) {
      slabEl.textContent = slab;
    }
  }

  function openProjectForm(id, focusPhoto = false) {
    let p = id ? (global.upcomingData || []).find(x => x.id === id) : null;
    let pFormTitle = document.getElementById('pFormTitle');
    if (pFormTitle) pFormTitle.textContent = p ? 'Edit Upcoming Project' : 'Add Upcoming Project';
    let vals = p || {
      id: '',
      name: '',
      developer: '',
      location: '',
      type: 'Apartment',
      bhk: '',
      area: '',
      price: '',
      maxPrice: '',
      launchDate: '',
      possessionDate: '',
      status: 'Upcoming',
      owner: '',
      phone: '',
      map: '',
      photo: '',
      video: '',
      brochure: '',
      notes: '',
      customFields: {}
    };

    let setVal = (elemId, val) => {
      let el = document.getElementById(elemId);
      if (el) el.value = val;
    };

    setVal('pId', vals.id || '');
    setVal('pName', vals.name || '');
    setVal('pDeveloper', vals.developer || '');
    setVal('pLocation', vals.location || '');
    setVal('pType', vals.type || 'Apartment');
    setVal('pBhk', vals.bhk || '');
    setVal('pArea', vals.area || '');
    setVal('pPrice', vals.price || '');
    setVal('pMaxPrice', vals.maxPrice || '');
    setVal('pLaunch', vals.launchDate || '');
    setVal('pPossession', vals.possessionDate || '');
    setVal('pStatus', vals.status || 'Upcoming');
    setVal('pOwner', vals.owner || '');
    setVal('pPhone', vals.phone || '');
    setVal('pMap', vals.map || '');
    setVal('pPhoto', vals.photo || '');
    setVal('pVideo', vals.video || '');
    setVal('pBrochure', vals.brochure || '');
    setVal('pNotes', vals.notes || '');

    // Set image preview
    let photoVal = (vals.photo || '').trim();
    const pWrap = document.getElementById('pPhotoPreviewWrap');
    const pImg = document.getElementById('pPhotoPreview');
    if (photoVal) {
      if (pImg) pImg.src = photoVal;
      if (pWrap) pWrap.style.display = 'flex';
    } else {
      if (pImg) pImg.src = '';
      if (pWrap) pWrap.style.display = 'none';
    }

    updateProjectCategoryPreview();
    if (typeof global.renderCustomFormFields === 'function') {
      global.renderCustomFormFields('project', 'projectCustomFieldsContainer', vals);
    }
    let modal = document.getElementById('projectFormModal');
    if (modal) modal.classList.add('show');
    if (focusPhoto) {
      setTimeout(() => {
        let el = document.getElementById('pPhotoFile');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 200);
    }
  }

  function saveProject() {
    let pIdEl = document.getElementById('pId');
    let pNameEl = document.getElementById('pName');
    let pDeveloperEl = document.getElementById('pDeveloper');
    let pLocationEl = document.getElementById('pLocation');
    let pTypeEl = document.getElementById('pType');
    let pBhkEl = document.getElementById('pBhk');
    let pAreaEl = document.getElementById('pArea');
    let pPriceEl = document.getElementById('pPrice');
    let pMaxPriceEl = document.getElementById('pMaxPrice');
    let pLaunchEl = document.getElementById('pLaunch');
    let pPossessionEl = document.getElementById('pPossession');
    let pStatusEl = document.getElementById('pStatus');
    let pOwnerEl = document.getElementById('pOwner');
    let pPhoneEl = document.getElementById('pPhone');
    let pMapEl = document.getElementById('pMap');
    let pPhotoEl = document.getElementById('pPhoto');
    let pVideoEl = document.getElementById('pVideo');
    let pBrochureEl = document.getElementById('pBrochure');
    let pNotesEl = document.getElementById('pNotes');

    let id = (pIdEl ? pIdEl.value : '') || 'up' + Date.now();
    let old = (global.upcomingData || []).find(p => p.id === id);
    let price = Number(pPriceEl ? pPriceEl.value : 0) || 0;
    let maxPrice = Number(pMaxPriceEl ? pMaxPriceEl.value : 0) || 0;

    let customFields = {};
    if (typeof global.extractCustomFieldValues === 'function') {
      customFields = global.extractCustomFieldValues('project', 'projectCustomFieldsContainer');
      if (customFields === null) return;
    }

    let p = {
      id,
      name: (pNameEl ? pNameEl.value : '').trim(),
      developer: (pDeveloperEl ? pDeveloperEl.value : '').trim(),
      location: (pLocationEl ? pLocationEl.value : '').trim(),
      type: pTypeEl ? pTypeEl.value : 'Apartment',
      bhk: (pBhkEl ? pBhkEl.value : '').trim(),
      area: (pAreaEl ? pAreaEl.value : '').trim(),
      price: price,
      maxPrice: maxPrice,
      priceCategory: global.getPriceCategory(price),
      budgetSlab: global.getBudgetSlab(price),
      launchDate: (pLaunchEl ? pLaunchEl.value : '').trim(),
      possessionDate: (pPossessionEl ? pPossessionEl.value : '').trim(),
      status: pStatusEl ? pStatusEl.value : 'Upcoming',
      owner: (pOwnerEl ? pOwnerEl.value : '').trim(),
      phone: (pPhoneEl ? pPhoneEl.value : '').trim(),
      map: (pMapEl ? pMapEl.value : '').trim(),
      photo: (pPhotoEl ? pPhotoEl.value : '').trim(),
      video: (pVideoEl ? pVideoEl.value : '').trim(),
      brochure: (pBrochureEl ? pBrochureEl.value : '').trim(),
      notes: (pNotesEl ? pNotesEl.value : '').trim(),
      customFields: customFields,
      favorite: old?.favorite || false,
      created: old?.created || new Date().toISOString().slice(0, 10),
      isDemo: false
    };

    if (!p.name || !p.location) {
      global.toast('Project name and location are required');
      return;
    }

    if (!old || old.isDemo === true) {
      if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
    }

    if (!Array.isArray(global.upcomingData)) global.upcomingData = [];
    let i = global.upcomingData.findIndex(x => x.id === id);
    if (i >= 0) global.upcomingData[i] = p;
    else global.upcomingData.unshift(p);

    global.saveUpcoming();
    global.closeModal('projectFormModal');
    if (typeof global.renderAll === 'function') global.renderAll();
    global.toast(i >= 0 ? 'Upcoming project updated' : 'Upcoming project added');
  }

  function removeProject(id) {
    let p = (global.upcomingData || []).find(x => x.id === id);
    if (!p) return;
    if (!confirm('Delete upcoming project "' + p.name + '"? It will be moved to Recently Deleted (kept for 5 days).')) return;
    let activePage = global.currentPage || 'upcoming';
    global.upcomingData = (global.upcomingData || []).filter(x => x.id !== id);
    global.saveUpcoming();
    if (typeof global.moveToRecentlyDeleted === 'function') global.moveToRecentlyDeleted('upcoming', p);
    if (typeof global.currentPage !== 'undefined' && global.currentPage !== activePage && typeof global.showPage === 'function') {
      global.showPage(activePage, false);
    } else if (typeof global.renderAll === 'function') {
      global.renderAll();
    }
    global.toast('Upcoming project moved to Recently Deleted');
  }

  function toggleProjectFav(id) {
    let p = (global.upcomingData || []).find(x => x.id === id);
    if (p) {
      p.favorite = !p.favorite;
      global.saveUpcoming();
      if (typeof global.renderAll === 'function') global.renderAll();
      global.toast(p.favorite ? 'Project added to favorites' : 'Project removed from favorites');
    }
  }

  function viewProject(id) {
    let p = (global.upcomingData || []).find(x => x.id === id);
    if (!p) return;
    let pdTitle = document.getElementById('pdTitle');
    let pdBody = document.getElementById('pdBody');
    let pdFoot = document.getElementById('pdFoot');
    let projectDetailModal = document.getElementById('projectDetailModal');

    if (pdTitle) pdTitle.textContent = p.name;
    let catClass = 'cat-' + (p.priceCategory || 'Economical').toLowerCase().replace(/\s+/g, '-');
    let statusClass = (p.status || 'Upcoming').toLowerCase().replace(/\s+/g, '-');
    let customDetailsHtml = typeof global.renderCustomFieldsDetail === 'function' ? global.renderCustomFieldsDetail('project', p.customFields) : '';

    if (pdBody) {
      pdBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px">
          <div>
            <div class="muted">${global.esc(p.location)} ${p.developer ? '• By ' + global.esc(p.developer) : ''}</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px">${global.moneyRange(p.price, p.maxPrice)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
            <span class="badge ${statusClass}">${global.esc(p.status)}</span>
            <div class="tag-row">
              <span class="badge ${catClass}">${global.esc(p.priceCategory)}</span>
              <span class="badge slab">${global.esc(p.budgetSlab)}</span>
            </div>
          </div>
        </div>
        <div class="details">
          ${[
            ['Type', p.type],
            ['BHK / Config', p.bhk || '—'],
            ['Area / Size', p.area || '—'],
            ['Expected Launch', p.launchDate || '—'],
            ['Possession', p.possessionDate || '—'],
            ['Price Category', p.priceCategory],
            ['Budget Slab', p.budgetSlab],
            ['Contact Person', p.owner || '—'],
            ['Phone', p.phone || '—']
          ].map(x => `<div class="detail"><label>${global.esc(x[0])}</label><b>${global.esc(x[1])}</b></div>`).join('')}
          ${p.brochure ? `<div class="detail"><label>Brochure</label><b><a href="${global.esc(p.brochure)}" target="_blank" style="color:#2563eb;text-decoration:none">📄 Open Brochure</a></b></div>` : ''}
          ${p.video ? `<div class="detail"><label>Video Tour</label><b><a href="${global.esc(p.video)}" target="_blank" style="color:#2563eb;text-decoration:none">▶ Watch Video</a></b></div>` : ''}
        </div>
        ${customDetailsHtml}
        <h3 style="font-size:14px;margin:18px 0 8px">Notes & Amenities</h3>
        <div class="notes">${global.esc(p.notes || 'No notes added.')}</div>
      `;
    }

    let isFav = !!p.favorite;
    if (pdFoot) {
      pdFoot.innerHTML = `
        <button class="btn" id="dProjectFavBtn" style="${isFav ? 'background:#eff6ff;color:#1d4ed8;border-color:#93c5fd;font-weight:700' : ''}" onclick="toggleDetailFav('upcoming', '${p.id}')">${isFav ? '★ Shortlisted' : '⭐ Favorite'}</button>
        <button class="btn" onclick="shareProperty('${p.id}', 'upcoming')">📤 Share</button>
        <button class="btn" onclick="handleDetailCall('upcoming', '${p.id}')">📞 Call</button>
        <button class="btn" onclick="handleDetailWhatsApp('upcoming', '${p.id}')">💬 WhatsApp</button>
        <button class="btn" onclick="handleDetailMaps('upcoming', '${p.id}')">📍 Maps</button>
        <button class="btn" onclick="handleDetailImage('upcoming', '${p.id}')">📷 Image</button>
        <button class="btn" onclick="openProjectForm('${p.id}');closeModal('projectDetailModal')">✏️ Edit</button>
        <button class="btn" style="color:#ef4444;border-color:#fca5a5" onclick="handleDetailDelete('upcoming', '${p.id}')">🗑️ Delete</button>
      `;
    }
    if (projectDetailModal) projectDetailModal.classList.add('show');
  }

  // Export to global scope
  global.upCurrentView = upCurrentView;
  global.setUpView = setUpView;
  global.fillUpcomingLocations = fillUpcomingLocations;
  global.filteredUpcoming = filteredUpcoming;
  global.renderUpcoming = renderUpcoming;
  global.upRow = upRow;
  global.upCard = upCard;
  global.clearProjectFilters = clearProjectFilters;
  global.updateProjectCategoryPreview = updateProjectCategoryPreview;
  global.openProjectForm = openProjectForm;
  global.saveProject = saveProject;
  global.removeProject = removeProject;
  global.toggleProjectFav = toggleProjectFav;
  global.viewProject = viewProject;

})(typeof window !== 'undefined' ? window : globalThis);
