/**
 * PROPERTY MANAGER PRO — FAVORITES SYSTEM MODULE
 * ==============================================
 * Cross-module shortlisting for Company, Direct, and Upcoming project inventories.
 */

(function(global) {
  'use strict';

  let favFilter = 'all'; // 'all' | 'property' | 'upcoming'
  let favView = 'table'; // 'table' | 'card'

  function setFavFilter(f) {
    favFilter = f;
    let buttons = document.querySelectorAll('#favSourceFilter button');
    buttons.forEach((b, idx) => {
      b.classList.toggle('active', (idx === 0 && f === 'all') || (idx === 1 && f === 'property') || (idx === 2 && f === 'upcoming'));
    });
    renderFavorites();
  }

  function setFavView(v) {
    favView = v;
    let tb = document.getElementById('favTableViewBtn');
    let cb = document.getElementById('favCardViewBtn');
    if (tb) tb.classList.toggle('active', v === 'table');
    if (cb) cb.classList.toggle('active', v === 'card');
    renderFavorites();
  }

  function getFavoritesList() {
    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];

    let propFavs = dataList.filter(p => p.favorite).map(p => ({
      ...p,
      source: 'property',
      favKey: 'property:' + p.id
    }));

    let directFavs = directList.filter(p => p.favorite).map(p => ({
      ...p,
      source: 'direct',
      favKey: 'direct:' + p.id
    }));

    let upFavs = upList.filter(p => p.favorite).map(p => ({
      ...p,
      source: 'upcoming',
      favKey: 'upcoming:' + p.id
    }));

    // Update counter badges
    let elAll = document.getElementById('favCountAll');
    let elProp = document.getElementById('favCountProp');
    let elUp = document.getElementById('favCountUp');
    if (elAll) elAll.textContent = propFavs.length + directFavs.length + upFavs.length;
    if (elProp) elProp.textContent = propFavs.length + directFavs.length;
    if (elUp) elUp.textContent = upFavs.length;

    let combined = [];
    if (favFilter === 'all' || favFilter === 'property') {
      combined.push(...propFavs, ...directFavs);
    }
    if (favFilter === 'all' || favFilter === 'upcoming') {
      combined.push(...upFavs);
    }

    combined.sort((a, b) => String(b.created).localeCompare(String(a.created)));
    return combined;
  }

  function favRow(item) {
    let isProp = item.source === 'property' || item.source === 'direct';
    let sourceBadge = item.source === 'direct'
      ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
      : item.source === 'property'
      ? `<span class="badge badge-source-prop">🏠 PROPERTY</span>`
      : `<span class="badge badge-source-up">🏗️ UPCOMING PROJECT</span>`;
    let priceStr = isProp ? global.money(item.price) : global.moneyRange(item.price, item.maxPrice);
    let statusClass = (item.status || '').toLowerCase().replace(/\s+/g, '-');
    let viewFunc = item.source === 'upcoming' ? `viewProject('${item.id}')` : `view('${item.id}')`;
    let unfavFunc = item.source === 'upcoming' ? `toggleProjectFav('${item.id}')` : `toggleFav('${item.id}')`;

    return `<tr>
      <td>
        <div class="property-name">${global.esc(item.name)}</div>
        <div class="muted">${isProp ? global.esc(item.bhk || item.type) : 'By ' + global.esc(item.developer || item.type)}</div>
      </td>
      <td>${sourceBadge}</td>
      <td>${global.esc(item.location)}</td>
      <td><b>${priceStr}</b></td>
      <td><span class="badge ${statusClass}">${global.esc(item.status)}</span></td>
      <td>
        <div class="actions">
          <button class="mini" onclick="${viewFunc}">View</button>
          <button class="mini" onclick="shareProperty('${item.id}', '${item.source}')">Share</button>
          <button class="mini" onclick="${unfavFunc}" title="Remove from favorites">★ Remove</button>
        </div>
      </td>
    </tr>`;
  }

  function favCard(item) {
    let isProp = item.source === 'property' || item.source === 'direct';
    let sourceBadge = item.source === 'direct'
      ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>`
      : item.source === 'property'
      ? `<span class="badge badge-source-prop">🏠 PROPERTY</span>`
      : `<span class="badge badge-source-up">🏗️ UPCOMING PROJECT</span>`;
    let priceStr = isProp ? global.money(item.price) : global.moneyRange(item.price, item.maxPrice);
    let statusClass = (item.status || '').toLowerCase().replace(/\s+/g, '-');
    let viewFunc = item.source === 'upcoming' ? `viewProject('${item.id}')` : `view('${item.id}')`;
    let unfavFunc = item.source === 'upcoming' ? `toggleProjectFav('${item.id}')` : `toggleFav('${item.id}')`;
    let hasImg = item.photo && item.photo.trim();

    return `<article class="prop-card">
      ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${global.esc(item.photo)}', '${global.esc(item.name)}')" title="Click to view full image"><img src="${global.esc(item.photo)}" alt="${global.esc(item.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="prop-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
          <h3 style="margin:0">${global.esc(item.name)}</h3>
          <button class="mini" onclick="${unfavFunc}" title="Remove from favorites">★</button>
        </div>
        <div class="muted" style="margin-top:2px">${global.esc(item.location)} ${item.developer ? '• By ' + global.esc(item.developer) : ''}</div>
        <div class="tag-row" style="margin:6px 0">
          ${sourceBadge}
          <span class="badge ${statusClass}">${global.esc(item.status)}</span>
        </div>
        <div class="prop-price">${priceStr}</div>
        <div class="prop-actions" style="margin-top:9px">
          <button class="mini" onclick="${viewFunc}">View</button>
          <button class="mini" onclick="shareProperty('${item.id}', '${item.source}')">Share</button>
          <button class="mini" onclick="${unfavFunc}">Remove</button>
        </div>
      </div>
    </article>`;
  }

  function renderFavorites() {
    let favResults = document.getElementById('favResults');
    if (!favResults) return;
    let list = getFavoritesList();
    if (!list.length) {
      let filterText = favFilter === 'property' ? 'properties' : favFilter === 'upcoming' ? 'upcoming projects' : 'items';
      favResults.innerHTML = `<div class="empty">No favorite ${filterText} yet.<br>Tap ☆ on any property or upcoming project to shortlist it.</div>`;
      return;
    }

    if (favView === 'table') {
      favResults.innerHTML = `<div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Source</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(favRow).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination"><span>Showing ${list.length} favorited items</span><span>Combined Reference • Isolated Storage</span></div>`;
    } else {
      favResults.innerHTML = '<div class="grid">' + list.map(favCard).join('') + '</div>';
    }
  }

  // Export to global scope
  global.favFilter = favFilter;
  global.favView = favView;
  global.setFavFilter = setFavFilter;
  global.setFavView = setFavView;
  global.getFavoritesList = getFavoritesList;
  global.favRow = favRow;
  global.favCard = favCard;
  global.renderFavorites = renderFavorites;

})(typeof window !== 'undefined' ? window : globalThis);
