/**
 * PROPERTY MANAGER PRO — PROPERTIES & DIRECT PROPERTIES MODULE
 * ============================================================
 * Inventory management, dynamic custom fields, filtering, tables, cards, and CRUD.
 */

(function(global) {
  'use strict';

  let currentView = 'table';
  let directView = 'table';
  let formPropertySource = 'company';

  function fillLocations() {
    if (typeof global.populateAllConfigDropdowns === 'function') global.populateAllConfigDropdowns();
  }

  function fillPropertyTypes() {
    if (typeof global.populateAllConfigDropdowns === 'function') global.populateAllConfigDropdowns();
  }

  function setView(v) {
    currentView = v;
    let tb = document.getElementById('tableViewBtn');
    let cb = document.getElementById('cardViewBtn');
    if (tb) tb.classList.toggle('active', v === 'table');
    if (cb) cb.classList.toggle('active', v === 'card');
    renderProperties();
  }

  function filtered() {
    const searchEl = document.getElementById('search');
    const filterLocationEl = document.getElementById('filterLocation');
    const filterTypeEl = document.getElementById('filterType');
    const filterBhkEl = document.getElementById('filterBhk');
    const filterCategoryEl = document.getElementById('filterCategory');
    const filterSlabEl = document.getElementById('filterSlab');
    const filterStatusEl = document.getElementById('filterStatus');
    const sortByEl = document.getElementById('sortBy');

    let q = (searchEl ? searchEl.value : '').toLowerCase().trim();
    let loc = filterLocationEl ? filterLocationEl.value : '';
    let typ = filterTypeEl ? filterTypeEl.value : '';
    let bhk = filterBhkEl ? filterBhkEl.value : '';
    let cat = filterCategoryEl ? filterCategoryEl.value : '';
    let slab = filterSlabEl ? filterSlabEl.value : '';
    let st = filterStatusEl ? filterStatusEl.value : '';

    let a = (global.data || []).filter(p => {
      if (loc && p.location !== loc) return false;
      if (typ && p.type !== typ) return false;
      if (st && p.status !== st) return false;

      // BHK / Configuration Filter
      if (bhk) {
        let b = (p.bhk || '').toLowerCase();
        if (bhk === '1 BHK' && !b.includes('1 bhk') && !b.includes('1bhk')) return false;
        if (bhk === '2 BHK' && !b.includes('2 bhk') && !b.includes('2bhk')) return false;
        if (bhk === '3 BHK' && !b.includes('3 bhk') && !b.includes('3bhk')) return false;
        if (bhk === '4 BHK' && !b.includes('4 bhk') && !b.includes('4bhk')) return false;
        if (bhk === '5 BHK+') {
          let m = b.match(/(\d+)\s*bhk/);
          let n = m ? parseInt(m[1]) : 0;
          if (n < 5) return false;
        }
        if (bhk === 'non-bhk') {
          if (b.includes('bhk')) return false;
        }
      }

      // Price Category Filter (Dynamic from appConfig)
      if (cat) {
        if (!global.matchRecordPriceCategory(p.price, cat)) return false;
      }

      // Budget Slab Filter (Dynamic from appConfig)
      if (slab) {
        if (!global.matchRecordBudgetSlab(p.price, slab)) return false;
      }

      // Global Search including Custom Fields
      if (q) {
        let cfVals = p.customFields ? Object.values(p.customFields).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ') : '';
        let text = [p.name, p.location, p.type, p.bhk, p.owner, p.phone, p.facing, p.road, p.notes, p.price, p.area, p.developer, cfVals].filter(Boolean).join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });

    let sortVal = sortByEl ? sortByEl.value : 'new';
    return global.sortRecords(a, sortVal);
  }

  function renderProperties() {
    fillLocations();
    fillPropertyTypes();
    let a = filtered();
    let resCountEl = document.getElementById('resultCount');
    let propResultsEl = document.getElementById('propertyResults');
    if (resCountEl) resCountEl.textContent = a.length + ' result' + (a.length !== 1 ? 's' : '');
    if (!propResultsEl) return;

    if (!a.length) {
      propResultsEl.innerHTML = '<div class="empty">No properties found matching your criteria.<br><button class="btn" style="margin-top:10px" onclick="clearFilters()">Clear filters</button></div>';
      return;
    }
    if (currentView === 'table') {
      propResultsEl.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Property</th><th>Location</th><th>Type / BHK</th><th>Area</th><th>Price & Slab</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead><tbody>${a.map(p => row(p)).join('')}</tbody></table></div><div class="pagination"><span>Showing ${a.length} properties</span><span>LocalStorage • Offline</span></div>`;
    } else {
      propResultsEl.innerHTML = '<div class="grid">' + a.map(card).join('') + '</div>';
    }
  }

  function row(p) {
    let cat = global.getPropertyCategory(p.price);
    let slab = global.getPropertyBudgetSlab(p.price);
    let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    return `<tr>
      <td><div class="property-name">${global.esc(p.name)}</div><div class="muted">${global.esc(p.facing || '')} ${p.road ? '• ' + global.esc(p.road) : ''}</div></td>
      <td>${global.esc(p.location)}</td>
      <td>${global.esc(p.type)}<div class="muted">${global.esc(p.bhk || '—')}</div></td>
      <td>${p.area ? global.esc(global.formatArea(p)) : '—'}</td>
      <td>
        <b>${global.money(p.price)}</b>
        <div class="tag-row" style="margin-top:4px">
          <span class="badge ${catClass}">${global.esc(cat)}</span>
          <span class="badge slab">${global.esc(slab)}</span>
        </div>
      </td>
      <td>${global.esc(p.owner || '—')}<div class="muted">${global.esc(p.phone || '')}</div></td>
      <td><span class="badge ${(p.status || 'available').toLowerCase()}">${global.esc(p.status || 'Available')}</span></td>
      <td><div class="actions"><button class="mini" onclick="view('${p.id}')">View</button><button class="mini" onclick="shareProperty('${p.id}', 'property')">Share</button><button class="mini" onclick="openForm('${p.id}')">Edit</button><button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">${p.favorite ? '★' : '☆'}</button><button class="mini" onclick="removeProp('${p.id}')">Delete</button></div></td>
    </tr>`;
  }

  function card(p) {
    let cat = global.getPropertyCategory(p.price);
    let slab = global.getPropertyBudgetSlab(p.price);
    let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    let hasImg = p.photo && p.photo.trim();

    return `<article class="prop-card">
      ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${global.esc(p.photo)}', '${global.esc(p.name)}')" title="Click to view full image"><img src="${global.esc(p.photo)}" alt="${global.esc(p.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="prop-body">
        <div style="display:flex;justify-content:space-between;gap:5px">
          <h3>${global.esc(p.name)}</h3>
          <button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">${p.favorite ? '★' : '☆'}</button>
        </div>
        <div class="muted">${global.esc(p.location)}</div>
        <div class="tag-row" style="margin:6px 0 2px">
          <span class="badge ${catClass}">${global.esc(cat)}</span>
          <span class="badge slab">${global.esc(slab)}</span>
        </div>
        <div class="prop-meta">
          <span>${global.esc(p.type)}</span>
          ${p.bhk ? `<span>${global.esc(p.bhk)}</span>` : ''}
          ${p.area ? `<span>${global.esc(global.formatArea(p))}</span>` : ''}
          <span>${global.esc(p.facing || '')}</span>
        </div>
        <div class="prop-price">${global.money(p.price)}</div>
        <span class="badge ${(p.status || 'available').toLowerCase()}">${global.esc(p.status || 'Available')}</span>
        <div class="prop-actions" style="margin-top:9px">
          <button class="mini" onclick="view('${p.id}')">View</button>
          <button class="mini" onclick="shareProperty('${p.id}', 'property')">Share</button>
          <button class="mini" onclick="openForm('${p.id}')">Edit</button>
        </div>
      </div>
    </article>`;
  }

  function clearFilters() {
    const searchEl = document.getElementById('search');
    const filterLocationEl = document.getElementById('filterLocation');
    const filterTypeEl = document.getElementById('filterType');
    const filterBhkEl = document.getElementById('filterBhk');
    const filterCategoryEl = document.getElementById('filterCategory');
    const filterSlabEl = document.getElementById('filterSlab');
    const filterStatusEl = document.getElementById('filterStatus');
    const sortByEl = document.getElementById('sortBy');

    if (searchEl) searchEl.value = '';
    if (filterLocationEl) filterLocationEl.value = '';
    if (filterTypeEl) filterTypeEl.value = '';
    if (filterBhkEl) filterBhkEl.value = '';
    if (filterCategoryEl) filterCategoryEl.value = '';
    if (filterSlabEl) filterSlabEl.value = '';
    if (filterStatusEl) filterStatusEl.value = '';
    if (sortByEl) sortByEl.value = 'new';
    renderProperties();
  }

  // ==================== DYNAMIC CUSTOM FIELD FORM & DETAIL HELPERS ====================
  function getCustomFieldsForModule(module) {
    if (!global.appConfig || !Array.isArray(global.appConfig.customFields)) return [];
    return global.appConfig.customFields.filter(cf => {
      if (cf.enabled === false) return false;
      let applies = cf.appliesTo || 'all';
      if (applies === 'all' || applies === 'both') return true;
      if (module === 'property' && (applies === 'property')) return true;
      if (module === 'direct' && (applies === 'direct' || applies === 'property')) return true;
      if (module === 'project' && (applies === 'project')) return true;
      return false;
    });
  }

  function renderCustomFormFields(module, containerId, record = {}) {
    let container = document.getElementById(containerId);
    if (!container) return;
    let sectionId = containerId === 'propertyCustomFieldsContainer' ? 'propertyCustomFieldsSection' : 'projectCustomFieldsSection';
    let section = document.getElementById(sectionId);

    let fields = getCustomFieldsForModule(module);
    if (!fields.length) {
      container.innerHTML = '';
      if (section) section.style.display = 'none';
      return;
    }
    if (section) section.style.display = 'block';

    let customVals = record && record.customFields ? record.customFields : {};

    container.innerHTML = fields.map(cf => {
      let rawVal = customVals[cf.key] != null ? customVals[cf.key] : (cf.defaultValue ?? '');
      let val = rawVal;
      let reqMarker = cf.required ? ' <span style="color:var(--danger)">*</span>' : '';
      let reqAttr = cf.required ? 'required' : '';
      let ph = global.esc(cf.placeholder || '');

      switch (cf.type) {
        case 'longtext':
          return `
            <div class="form-group full">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <textarea class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="longtext" rows="2" placeholder="${ph}" ${reqAttr}>${global.esc(val)}</textarea>
            </div>
          `;
        case 'number':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="number" step="any" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="number" value="${global.esc(val)}" placeholder="${ph}" ${reqAttr}>
            </div>
          `;
        case 'currency':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <div class="currency-input-wrap" style="position:relative;display:flex;align-items:center">
                <span style="position:absolute;left:10px;font-weight:700;color:var(--muted);pointer-events:none">₹</span>
                <input type="number" step="any" class="field cf-input" style="padding-left:26px" data-cf-key="${global.esc(cf.key)}" data-cf-type="currency" value="${global.esc(val)}" placeholder="${ph || '0'}" ${reqAttr}>
              </div>
            </div>
          `;
        case 'date':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="date" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="date" value="${global.esc(val)}" ${reqAttr}>
            </div>
          `;
        case 'datetime':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="datetime-local" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="datetime" value="${global.esc(val)}" ${reqAttr}>
            </div>
          `;
        case 'dropdown':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <select class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="dropdown" ${reqAttr}>
                <option value="">${ph || 'Select ' + global.esc(cf.label)}</option>
                ${(cf.options || []).map(opt => `<option value="${global.esc(opt)}" ${String(val) === String(opt) ? 'selected' : ''}>${global.esc(opt)}</option>`).join('')}
              </select>
            </div>
          `;
        case 'multiselect':
          let selArr = Array.isArray(val) ? val : (String(val || '').split(',').map(s => s.trim()).filter(Boolean));
          return `
            <div class="form-group full">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <div class="multiselect-wrap" data-cf-key="${global.esc(cf.key)}" data-cf-type="multiselect" style="display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:var(--bg-subtle, rgba(0,0,0,0.02));border:1px solid var(--line);border-radius:6px;min-height:42px">
                ${(cf.options || []).map(opt => {
                  let isSel = selArr.includes(opt);
                  return `<span class="multiselect-chip ${isSel ? 'selected' : ''}" onclick="toggleMultiselectChip(this)" data-value="${global.esc(opt)}" style="cursor:pointer;padding:4px 10px;border-radius:14px;font-size:12px;border:1px solid ${isSel ? 'var(--primary)' : 'var(--line)'};background:${isSel ? 'var(--primary)' : 'var(--card)'};color:${isSel ? '#fff' : 'inherit'};user-select:none;transition:all 0.15s">${isSel ? '✓ ' : '+ '}${global.esc(opt)}</span>`;
                }).join('')}
              </div>
            </div>
          `;
        case 'checkbox':
          let isChecked = val === true || val === 'true' || val === 1 || val === '1';
          return `
            <div class="form-group full" style="display:flex;align-items:center;margin-top:6px">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:0;font-size:13px;font-weight:600">
                <input type="checkbox" class="cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="checkbox" ${isChecked ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--primary)">
                ${global.esc(cf.label)}${reqMarker}
              </label>
            </div>
          `;
        case 'phone':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="tel" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="phone" value="${global.esc(val)}" placeholder="${ph || 'e.g. +91 9876543210'}" ${reqAttr}>
            </div>
          `;
        case 'email':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="email" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="email" value="${global.esc(val)}" placeholder="${ph || 'e.g. client@example.com'}" ${reqAttr}>
            </div>
          `;
        case 'url':
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="url" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="url" value="${global.esc(val)}" placeholder="${ph || 'https://...'}" ${reqAttr}>
            </div>
          `;
        case 'text':
        default:
          return `
            <div class="form-group">
              <label>${global.esc(cf.label)}${reqMarker}</label>
              <input type="text" class="field cf-input" data-cf-key="${global.esc(cf.key)}" data-cf-type="text" value="${global.esc(val)}" placeholder="${ph}" ${reqAttr}>
            </div>
          `;
      }
    }).join('');
  }

  function toggleMultiselectChip(el) {
    el.classList.toggle('selected');
    let isSel = el.classList.contains('selected');
    el.style.borderColor = isSel ? 'var(--primary)' : 'var(--line)';
    el.style.background = isSel ? 'var(--primary)' : 'var(--card)';
    el.style.color = isSel ? '#fff' : 'inherit';
    let val = el.getAttribute('data-value') || '';
    el.textContent = (isSel ? '✓ ' : '+ ') + val;
  }

  function extractCustomFieldValues(module, containerId) {
    let container = document.getElementById(containerId);
    if (!container) return {};
    let fields = getCustomFieldsForModule(module);
    let res = {};

    for (let cf of fields) {
      let key = cf.key;
      let type = cf.type;
      let val = '';

      if (type === 'multiselect') {
        let wrap = container.querySelector(`.multiselect-wrap[data-cf-key="${key}"]`);
        if (wrap) {
          let chips = wrap.querySelectorAll('.multiselect-chip.selected');
          val = Array.from(chips).map(c => c.getAttribute('data-value')).filter(Boolean);
        } else {
          val = [];
        }
        if (cf.required && (!Array.isArray(val) || val.length === 0)) {
          global.toast(`"${cf.label}" is required`);
          return null;
        }
      } else if (type === 'checkbox') {
        let el = container.querySelector(`input[type="checkbox"][data-cf-key="${key}"]`);
        val = el ? el.checked : false;
        if (cf.required && !val) {
          global.toast(`"${cf.label}" is required`);
          return null;
        }
      } else {
        let el = container.querySelector(`.cf-input[data-cf-key="${key}"]`);
        if (el) {
          val = el.value.trim();
          if (type === 'number' || type === 'currency') {
            val = val !== '' ? Number(val) : '';
          } else if (type === 'phone') {
            val = val ? global.normalizePhoneNumber(val) : '';
          }
        }
        if (cf.required && (val === '' || val == null)) {
          global.toast(`"${cf.label}" is required`);
          if (el) el.focus();
          return null;
        }
      }
      res[key] = val;
    }
    return res;
  }

  function renderCustomFieldsDetail(module, customFieldsObj) {
    if (!customFieldsObj || typeof customFieldsObj !== 'object') return '';
    let fields = getCustomFieldsForModule(module);
    let visibleFields = fields.filter(cf => cf.showInDetail !== false);
    let rows = [];

    for (let cf of visibleFields) {
      let val = customFieldsObj[cf.key];
      if (val === '' || val == null) continue;
      if (Array.isArray(val) && val.length === 0) continue;

      let displayHtml = '';
      switch (cf.type) {
        case 'currency':
          displayHtml = typeof val === 'number' ? global.money(val) : `₹${global.esc(val)}`;
          break;
        case 'phone':
          displayHtml = `<a href="${global.getTelUrl(val)}" style="color:var(--primary);text-decoration:none">📞 ${global.esc(val)}</a> <a href="${global.getWhatsAppUrl(val)}" target="_blank" style="color:#25d366;text-decoration:none;margin-left:6px">💬 WhatsApp</a>`;
          break;
        case 'email':
          displayHtml = `<a href="mailto:${global.esc(val)}" style="color:var(--primary)">${global.esc(val)}</a>`;
          break;
        case 'url':
          displayHtml = `<a href="${global.safeUrl(val)}" target="_blank" style="color:var(--primary)">${global.esc(val)} ↗</a>`;
          break;
        case 'checkbox':
          displayHtml = (val === true || val === 'true' || val === 1) ? '✅ Yes' : '❌ No';
          break;
        case 'multiselect':
          let arr = Array.isArray(val) ? val : String(val).split(',').map(s => s.trim()).filter(Boolean);
          displayHtml = `<div class="subcat-chips">${arr.map(s => `<span class="subcat-chip">${global.esc(s)}</span>`).join('')}</div>`;
          break;
        case 'date':
        case 'datetime':
        case 'dropdown':
        case 'number':
        case 'longtext':
        case 'text':
        default:
          displayHtml = global.esc(val);
          break;
      }

      rows.push({ label: cf.label, html: displayHtml });
    }

    if (!rows.length) return '';

    return `
      <h3 style="font-size:14px;margin:18px 0 8px">Additional Details</h3>
      <div class="details">
        ${rows.map(r => `<div class="detail"><label>${global.esc(r.label)}</label><b>${r.html}</b></div>`).join('')}
      </div>
    `;
  }

  function updatePropertyCategoryPreview() {
    let priceEl = document.getElementById('fPrice');
    let price = Number(priceEl ? priceEl.value : 0) || 0;
    let cat = global.getPropertyCategory(price);
    let slab = global.getPropertyBudgetSlab(price);
    let catEl = document.getElementById('fCatPreview');
    let slabEl = document.getElementById('fSlabPreview');
    if (catEl) {
      catEl.textContent = cat;
      catEl.className = 'badge cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    }
    if (slabEl) {
      slabEl.textContent = slab;
    }
  }

  async function handleImageUpload(input, moduleType) {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const dataUrl = await global.compressImage(file);
      if (moduleType === 'property') {
        let fPhotoEl = document.getElementById('fPhoto');
        if (fPhotoEl) fPhotoEl.value = dataUrl;
        const wrap = document.getElementById('fPhotoPreviewWrap');
        const img = document.getElementById('fPhotoPreview');
        if (img) img.src = dataUrl;
        if (wrap) wrap.style.display = 'flex';
      } else {
        let pPhotoEl = document.getElementById('pPhoto');
        if (pPhotoEl) pPhotoEl.value = dataUrl;
        const wrap = document.getElementById('pPhotoPreviewWrap');
        const img = document.getElementById('pPhotoPreview');
        if (img) img.src = dataUrl;
        if (wrap) wrap.style.display = 'flex';
      }
      global.toast('Image uploaded and optimized');
    } catch (err) {
      global.toast(err.message || 'Image processing failed');
    }
    input.value = '';
  }

  function removeUploadedImage(moduleType) {
    if (moduleType === 'property') {
      let fPhotoEl = document.getElementById('fPhoto');
      if (fPhotoEl) fPhotoEl.value = '';
      const wrap = document.getElementById('fPhotoPreviewWrap');
      if (wrap) wrap.style.display = 'none';
      let img = document.getElementById('fPhotoPreview');
      if (img) img.src = '';
    } else {
      let pPhotoEl = document.getElementById('pPhoto');
      if (pPhotoEl) pPhotoEl.value = '';
      const wrap = document.getElementById('pPhotoPreviewWrap');
      if (wrap) wrap.style.display = 'none';
      let img = document.getElementById('pPhotoPreview');
      if (img) img.src = '';
    }
    global.toast('Image removed');
  }

  function onPhotoUrlChange(moduleType) {
    if (moduleType === 'property') {
      let val = (document.getElementById('fPhoto')?.value || '').trim();
      let wrap = document.getElementById('fPhotoPreviewWrap');
      let img = document.getElementById('fPhotoPreview');
      if (val) {
        if (img) img.src = val;
        if (wrap) wrap.style.display = 'flex';
      } else {
        if (wrap) wrap.style.display = 'none';
        if (img) img.src = '';
      }
    } else {
      let val = (document.getElementById('pPhoto')?.value || '').trim();
      let wrap = document.getElementById('pPhotoPreviewWrap');
      let img = document.getElementById('pPhotoPreview');
      if (val) {
        if (img) img.src = val;
        if (wrap) wrap.style.display = 'flex';
      } else {
        if (wrap) wrap.style.display = 'none';
        if (img) img.src = '';
      }
    }
  }

  function openForm(id, focusPhoto = false) {
    formPropertySource = 'company';
    let fSource = document.getElementById('fSource');
    if (fSource) fSource.value = 'company';
    let badge = document.getElementById('formSourceBadge');
    if (badge) badge.style.display = 'none';

    let p = id ? (global.data || []).find(x => x.id === id) : null;
    let ft = document.getElementById('formTitle');
    if (ft) ft.textContent = p ? 'Edit Property' : 'Add Property';
    let vals = p || { id: '', name: '', location: '', type: 'Villa', bhk: '', area: '', dim: '', facing: '', road: '', price: '', status: 'Available', owner: '', phone: '', follow: '', map: '', photo: '', video: '', notes: '', customFields: {} };
    Object.entries({ fId: 'id', fName: 'name', fLocation: 'location', fType: 'type', fBhk: 'bhk', fArea: 'area', fDim: 'dim', fFacing: 'facing', fRoad: 'road', fPrice: 'price', fStatus: 'status', fOwner: 'owner', fPhone: 'phone', fFollow: 'follow', fMap: 'map', fPhoto: 'photo', fVideo: 'video', fNotes: 'notes' }).forEach(([el, k]) => {
      let elem = document.getElementById(el);
      if (elem) elem.value = vals[k] ?? '';
    });

    let areaUnit = global.getAreaUnit(vals);
    let dimUnit = global.getDimensionUnit(vals);
    let fAreaUnitEl = document.getElementById('fAreaUnit');
    let fDimUnitEl = document.getElementById('fDimUnit');
    if (fAreaUnitEl) fAreaUnitEl.value = areaUnit;
    if (fDimUnitEl) fDimUnitEl.value = dimUnit;
    global.setupDimensionsInput(document.getElementById('fDim'));

    // Set image preview
    let photoVal = (vals.photo || '').trim();
    const pWrap = document.getElementById('fPhotoPreviewWrap');
    const pImg = document.getElementById('fPhotoPreview');
    if (photoVal) {
      if (pImg) pImg.src = photoVal;
      if (pWrap) pWrap.style.display = 'flex';
    } else {
      if (pImg) pImg.src = '';
      if (pWrap) pWrap.style.display = 'none';
    }

    updatePropertyCategoryPreview();
    renderCustomFormFields('property', 'propertyCustomFieldsContainer', vals);
    let fm = document.getElementById('formModal');
    if (fm) fm.classList.add('show');
    if (focusPhoto) {
      setTimeout(() => {
        let el = document.getElementById('fPhotoFile');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 200);
    }
  }

  function openDirectPropertyForm(id, focusPhoto = false) {
    formPropertySource = 'direct';
    let fSource = document.getElementById('fSource');
    if (fSource) fSource.value = 'direct';
    let badge = document.getElementById('formSourceBadge');
    if (badge) {
      badge.style.display = '';
      badge.textContent = '🔑 DIRECT PROPERTY';
    }

    let p = id ? (global.directData || []).find(x => x.id === id) : null;
    let ft = document.getElementById('formTitle');
    if (ft) ft.textContent = p ? 'Edit Direct Property' : 'Add Direct Property';
    let vals = p || { id: '', name: '', location: '', type: 'Villa', bhk: '', area: '', dim: '', facing: '', road: '', price: '', status: 'Available', owner: '', phone: '', follow: '', map: '', photo: '', video: '', notes: '', customFields: {} };
    Object.entries({ fId: 'id', fName: 'name', fLocation: 'location', fType: 'type', fBhk: 'bhk', fArea: 'area', fDim: 'dim', fFacing: 'facing', fRoad: 'road', fPrice: 'price', fStatus: 'status', fOwner: 'owner', fPhone: 'phone', fFollow: 'follow', fMap: 'map', fPhoto: 'photo', fVideo: 'video', fNotes: 'notes' }).forEach(([el, k]) => {
      let elem = document.getElementById(el);
      if (elem) elem.value = vals[k] ?? '';
    });

    let areaUnitDirect = global.getAreaUnit(vals);
    let dimUnitDirect = global.getDimensionUnit(vals);
    let fAreaUnitEl2 = document.getElementById('fAreaUnit');
    let fDimUnitEl2 = document.getElementById('fDimUnit');
    if (fAreaUnitEl2) fAreaUnitEl2.value = areaUnitDirect;
    if (fDimUnitEl2) fDimUnitEl2.value = dimUnitDirect;
    global.setupDimensionsInput(document.getElementById('fDim'));

    let photoVal = (vals.photo || '').trim();
    const pWrap = document.getElementById('fPhotoPreviewWrap');
    const pImg = document.getElementById('fPhotoPreview');
    if (photoVal) {
      if (pImg) pImg.src = photoVal;
      if (pWrap) pWrap.style.display = 'flex';
    } else {
      if (pImg) pImg.src = '';
      if (pWrap) pWrap.style.display = 'none';
    }

    updatePropertyCategoryPreview();
    renderCustomFormFields('direct', 'propertyCustomFieldsContainer', vals);
    let fm = document.getElementById('formModal');
    if (fm) fm.classList.add('show');
    if (focusPhoto) {
      setTimeout(() => {
        let el = document.getElementById('fPhotoFile');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 200);
    }
  }

  function saveProperty() {
    let fId = document.getElementById('fId');
    let fName = document.getElementById('fName');
    let fLocation = document.getElementById('fLocation');
    let fType = document.getElementById('fType');
    let fBhk = document.getElementById('fBhk');
    let fArea = document.getElementById('fArea');
    let fDim = document.getElementById('fDim');
    let fFacing = document.getElementById('fFacing');
    let fRoad = document.getElementById('fRoad');
    let fPrice = document.getElementById('fPrice');
    let fStatus = document.getElementById('fStatus');
    let fOwner = document.getElementById('fOwner');
    let fPhone = document.getElementById('fPhone');
    let fFollow = document.getElementById('fFollow');
    let fMap = document.getElementById('fMap');
    let fPhoto = document.getElementById('fPhoto');
    let fVideo = document.getElementById('fVideo');
    let fNotes = document.getElementById('fNotes');

    let isDirect = formPropertySource === 'direct' || (document.getElementById('fSource')?.value === 'direct') || (fId?.value.startsWith('dp_'));
    let id = (fId ? fId.value : '') || (isDirect ? ('dp_' + Date.now()) : ('p' + Date.now()));
    let old = isDirect ? (global.directData || []).find(p => p.id === id) : (global.data || []).find(p => p.id === id);
    let price = Number(fPrice ? fPrice.value : 0) || 0;
    let areaUnit = document.getElementById('fAreaUnit')?.value || 'sqyard';
    let dimensionUnit = document.getElementById('fDimUnit')?.value || 'yard';
    let dimVal = (fDim ? fDim.value : '').trim();

    let customFields = extractCustomFieldValues(isDirect ? 'direct' : 'property', 'propertyCustomFieldsContainer');
    if (customFields === null) return; // Validation failed on required field

    let p = {
      id,
      name: (fName ? fName.value : '').trim(),
      location: (fLocation ? fLocation.value : '').trim(),
      type: fType ? fType.value : 'Villa',
      bhk: (fBhk ? fBhk.value : '').trim(),
      area: Number(fArea ? fArea.value : 0) || 0,
      areaUnit: areaUnit,
      dim: dimVal,
      dimensions: dimVal,
      dimensionUnit: dimensionUnit,
      facing: (fFacing ? fFacing.value : '').trim(),
      road: (fRoad ? fRoad.value : '').trim(),
      price: price,
      priceCategory: global.getPropertyCategory(price),
      budgetSlab: global.getPropertyBudgetSlab(price),
      status: fStatus ? fStatus.value : 'Available',
      owner: (fOwner ? fOwner.value : '').trim(),
      phone: (fPhone ? fPhone.value : '').trim(),
      follow: fFollow ? fFollow.value : '',
      map: (fMap ? fMap.value : '').trim(),
      photo: (fPhoto ? fPhoto.value : '').trim(),
      video: (fVideo ? fVideo.value : '').trim(),
      notes: (fNotes ? fNotes.value : '').trim(),
      customFields: customFields,
      favorite: old?.favorite || false,
      isDirect: isDirect,
      source: isDirect ? 'direct' : 'company',
      created: old?.created || new Date().toISOString().slice(0, 10),
      isDemo: false
    };

    if (!p.name || !p.location) {
      global.toast('Property name and location are required');
      return;
    }

    if (!old || old.isDemo === true) {
      if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
    }

    if (isDirect) {
      if (!Array.isArray(global.directData)) global.directData = [];
      let i = global.directData.findIndex(x => x.id === id);
      if (i >= 0) global.directData[i] = p; else global.directData.unshift(p);
      global.saveDirect();
      global.closeModal('formModal');
      if (typeof global.renderAll === 'function') global.renderAll();
      global.toast(i >= 0 ? 'Direct Property updated' : 'Direct Property added');
    } else {
      if (!Array.isArray(global.data)) global.data = [];
      let i = global.data.findIndex(x => x.id === id);
      if (i >= 0) global.data[i] = p; else global.data.unshift(p);
      global.save();
      global.closeModal('formModal');
      if (typeof global.renderAll === 'function') global.renderAll();
      global.toast(i >= 0 ? 'Property updated' : 'Property added');
    }
  }

  function removeProp(id) {
    let p = (global.data || []).find(x => x.id === id);
    if (!p) return;
    if (!confirm('Delete "' + p.name + '"? It will be moved to Recently Deleted (kept for 5 days).')) return;
    let activePage = global.currentPage || 'properties';
    global.data = (global.data || []).filter(x => x.id !== id);
    global.save();
    if (typeof global.moveToRecentlyDeleted === 'function') global.moveToRecentlyDeleted('property', p);
    if (typeof global.currentPage !== 'undefined' && global.currentPage !== activePage && typeof global.showPage === 'function') {
      global.showPage(activePage, false);
    } else if (typeof global.renderAll === 'function') {
      global.renderAll();
    }
    global.toast('Property moved to Recently Deleted');
  }

  function removeDirectProperty(id) {
    let p = (global.directData || []).find(x => x.id === id);
    if (!p) return;
    if (!confirm('Delete Direct Property "' + p.name + '"? It will be moved to Recently Deleted (kept for 5 days).')) return;
    let activePage = global.currentPage || 'directProperty';
    global.directData = (global.directData || []).filter(x => x.id !== id);
    global.saveDirect();
    if (typeof global.moveToRecentlyDeleted === 'function') global.moveToRecentlyDeleted('direct', p);
    if (typeof global.currentPage !== 'undefined' && global.currentPage !== activePage && typeof global.showPage === 'function') {
      global.showPage(activePage, false);
    } else if (typeof global.renderAll === 'function') {
      global.renderAll();
    }
    global.toast('Direct Property moved to Recently Deleted');
  }

  function toggleFav(id) {
    let p = (global.data || []).find(x => x.id === id);
    if (p) {
      p.favorite = !p.favorite;
      global.save();
      if (typeof global.renderAll === 'function') global.renderAll();
      global.toast(p.favorite ? 'Property added to favorites' : 'Property removed from favorites');
      return;
    }
    if (typeof global.directData !== 'undefined') {
      let dp = (global.directData || []).find(x => x.id === id);
      if (dp) {
        dp.favorite = !dp.favorite;
        global.saveDirect();
        if (typeof global.renderAll === 'function') global.renderAll();
        global.toast(dp.favorite ? 'Direct Property added to favorites' : 'Direct Property removed from favorites');
        return;
      }
    }
  }

  function view(id) {
    let p = (global.data || []).find(x => x.id === id) || (global.directData || []).find(x => x.id === id);
    if (!p) return;
    let dTitle = document.getElementById('dTitle');
    let detailBody = document.getElementById('detailBody');
    let detailFoot = document.getElementById('detailFoot');
    let detailModal = document.getElementById('detailModal');
    if (dTitle) dTitle.textContent = p.name;
    let isDirect = !!p.isDirect || (p.id && p.id.startsWith('dp_'));
    let cat = global.getPropertyCategory(p.price);
    let slab = global.getPropertyBudgetSlab(p.price);
    let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    let sourceBadge = isDirect
      ? `<span class="badge badge-source-direct">🔑 DIRECT PROPERTY (Personally Sourced)</span>`
      : `<span class="badge badge-source-prop">🏢 COMPANY INVENTORY</span>`;

    let customDetailsHtml = renderCustomFieldsDetail(isDirect ? 'direct' : 'property', p.customFields);

    if (detailBody) {
      detailBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px">
          <div>
            <div style="margin-bottom:6px">${sourceBadge}</div>
            <div class="muted">📍 ${global.esc(p.location)}</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px">${global.money(p.price)}</div>
            <div class="tag-row" style="margin-top:5px">
              <span class="badge ${catClass}">${global.esc(cat)}</span>
              <span class="badge slab">${global.esc(slab)}</span>
            </div>
          </div>
          <span class="badge ${p.status.toLowerCase()}">${global.esc(p.status)}</span>
        </div>
        <div class="details">${[
          ['Source Type', isDirect ? 'Direct Client/Owner' : 'Company Inventory'],
          ['Type', p.type],
          ['BHK', p.bhk || '—'],
          ['Area', p.area ? global.formatArea(p) : '—'],
          ['Price Category', cat],
          ['Budget Slab', slab],
          ['Dimensions', global.formatDimensions(p) || '—'],
          ['Facing', p.facing || '—'],
          ['Road', p.road || '—'],
          ['Owner / Client', p.owner || '—'],
          ['Phone', p.phone || '—'],
          ['Follow-up', p.follow || '—']
        ].map(x => `<div class="detail"><label>${global.esc(x[0])}</label><b>${global.esc(x[1])}</b></div>`).join('')}${p.video ? `<div class="detail"><label>Video Tour</label><b><a href="${global.esc(p.video)}" target="_blank" style="color:#2563eb;text-decoration:none">▶ Watch Video</a></b></div>` : ''}</div>
        ${customDetailsHtml}
        <h3 style="font-size:14px;margin:18px 0 8px">Notes</h3><div class="notes">${global.esc(p.notes || 'No notes')}</div>`;
    }

    let isFav = !!p.favorite;
    let editFunc = isDirect ? `openDirectPropertyForm('${p.id}');closeModal('detailModal')` : `openForm('${p.id}');closeModal('detailModal')`;
    let delFunc = isDirect ? `handleDetailDelete('direct', '${p.id}')` : `handleDetailDelete('property', '${p.id}')`;

    if (detailFoot) {
      detailFoot.innerHTML = `
        <button class="btn" id="dPropFavBtn" style="${isFav ? 'background:#eff6ff;color:#1d4ed8;border-color:#93c5fd;font-weight:700' : ''}" onclick="toggleFav('${p.id}')">${isFav ? '★ Shortlisted' : '⭐ Favorite'}</button>
        <button class="btn" onclick="shareProperty('${p.id}', '${isDirect ? 'direct' : 'property'}')">📤 Share</button>
        ${p.phone ? `<button class="btn" onclick="handleDetailCall('property', '${p.id}')">📞 Call</button>` : ''}
        ${p.phone ? `<button class="btn" onclick="handleDetailWhatsApp('property', '${p.id}')">💬 WhatsApp</button>` : ''}
        ${p.map ? `<button class="btn" onclick="handleDetailMaps('property', '${p.id}')">📍 Maps</button>` : ''}
        ${p.photo ? `<button class="btn" onclick="openLightbox('${global.esc(p.photo)}', '${global.esc(p.name)}')">📷 Image</button>` : ''}
        <button class="btn" onclick="${editFunc}">✏️ Edit</button>
        <button class="btn" style="color:#ef4444;border-color:#fca5a5" onclick="${delFunc}">🗑️ Delete</button>
      `;
    }
    if (detailModal) detailModal.classList.add('show');
  }

  // ==================== DIRECT PROPERTY CODE ====================
  function setDirectView(v) {
    directView = v;
    let tb = document.getElementById('directTableViewBtn');
    let cb = document.getElementById('directCardViewBtn');
    if (tb) tb.classList.toggle('active', v === 'table');
    if (cb) cb.classList.toggle('active', v === 'card');
    renderDirectProperties();
  }

  function clearDirectFilters() {
    let elS = document.getElementById('directSearch'); if (elS) elS.value = '';
    let elL = document.getElementById('directFilterLocation'); if (elL) elL.value = '';
    let elT = document.getElementById('directFilterType'); if (elT) elT.value = '';
    let elB = document.getElementById('directFilterBhk'); if (elB) elB.value = '';
    let elC = document.getElementById('directFilterCategory'); if (elC) elC.value = '';
    let elSl = document.getElementById('directFilterSlab'); if (elSl) elSl.value = '';
    let elSt = document.getElementById('directFilterStatus'); if (elSt) elSt.value = '';
    let elSo = document.getElementById('directSortBy'); if (elSo) elSo.value = 'new';
    renderDirectProperties();
  }

  function renderDirectProperties() {
    let target = document.getElementById('directPropertyResults');
    if (!target) return;
    let list = (global.directData || []);

    let s = (document.getElementById('directSearch')?.value || '').toLowerCase().trim();
    let l = document.getElementById('directFilterLocation')?.value || '';
    let t = document.getElementById('directFilterType')?.value || '';
    let b = document.getElementById('directFilterBhk')?.value || '';
    let c = document.getElementById('directFilterCategory')?.value || '';
    let sl = document.getElementById('directFilterSlab')?.value || '';
    let st = document.getElementById('directFilterStatus')?.value || '';
    let so = document.getElementById('directSortBy')?.value || 'new';

    let filtered = list.filter(p => {
      let cat = p.priceCategory || global.getPropertyCategory(p.price);
      let slab = p.budgetSlab || global.getPropertyBudgetSlab(p.price);
      let cfVals = p.customFields ? Object.values(p.customFields).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ') : '';
      let blob = [p.name, p.location, p.type, p.bhk, p.owner, p.phone, p.notes, p.status, p.dim, p.facing, p.road, cat, slab, global.money(p.price), cfVals].join(' ').toLowerCase();

      if (s && !blob.includes(s)) return false;
      if (l && p.location !== l) return false;
      if (t && p.type !== t) return false;
      if (b) {
        if (b === 'non-bhk') {
          if (p.bhk && p.bhk.trim()) return false;
        } else if (b === '5 BHK+') {
          let m = (p.bhk || '').match(/(\d+)/);
          if (!m || Number(m[1]) < 5) return false;
        } else {
          if ((p.bhk || '').toLowerCase() !== b.toLowerCase()) return false;
        }
      }
      if (c && !global.matchRecordPriceCategory(p.price, c)) return false;
      if (sl && !global.matchRecordBudgetSlab(p.price, sl)) return false;
      if (st && p.status !== st) return false;
      return true;
    });

    filtered = global.sortRecords(filtered, so);

    let countEl = document.getElementById('directResultCount');
    if (countEl) countEl.textContent = `${filtered.length} direct propert${filtered.length !== 1 ? 'ies' : 'y'}`;

    if (!filtered.length) {
      target.innerHTML = `<div class="empty">
        <div style="font-size:32px;margin-bottom:8px">🔑</div>
        <b>No direct properties found</b>
        <div style="color:var(--muted);margin-top:4px">Try adjusting your filters or click below to add a direct property.</div>
        <button class="btn primary" style="margin-top:12px" onclick="openDirectPropertyForm()">＋ Add Direct Property</button>
      </div>`;
      return;
    }

    if (directView === 'table') {
      target.innerHTML = `<div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type / BHK</th>
              <th>Location</th>
              <th>Price</th>
              <th>Category & Slab</th>
              <th>Status</th>
              <th>Owner / Client</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(directRow).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>Showing ${filtered.length} of ${list.length} direct properties</span>
        <span>Direct Client/Owner Sourced • Isolated Storage</span>
      </div>`;
    } else {
      target.innerHTML = `<div class="grid">${filtered.map(directCard).join('')}</div>`;
    }
  }

  function directRow(p) {
    let cat = global.getPropertyCategory(p.price);
    let slab = global.getPropertyBudgetSlab(p.price);
    let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span class="badge badge-source-direct" style="font-size:10px;padding:2px 6px">🔑 DIRECT</span>
          <div class="property-name">${global.esc(p.name)}</div>
        </div>
        <div class="muted">${global.esc(p.facing || '')} ${p.road ? '• ' + global.esc(p.road) : ''}</div>
      </td>
      <td>${global.esc(p.type)}<div class="muted">${global.esc(p.bhk || '—')}</div></td>
      <td><b>${global.esc(p.location)}</b></td>
      <td><b>${global.money(p.price)}</b></td>
      <td>
        <div class="tag-row">
          <span class="badge ${catClass}">${global.esc(cat)}</span>
          <span class="badge slab">${global.esc(slab)}</span>
        </div>
      </td>
      <td><span class="badge ${p.status.toLowerCase()}">${global.esc(p.status)}</span></td>
      <td>
        <div><b>${global.esc(p.owner || 'Direct Owner')}</b></div>
        ${p.phone ? `<a href="tel:${global.esc(p.phone)}" style="font-size:12px;color:var(--primary);text-decoration:none">📞 ${global.esc(p.phone)}</a>` : ''}
      </td>
      <td>
        <div class="actions">
          <button class="mini" onclick="view('${p.id}')">View</button>
          <button class="mini" onclick="shareProperty('${p.id}', 'direct')">Share</button>
          <button class="mini" onclick="openDirectPropertyForm('${p.id}')">Edit</button>
          <button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">${p.favorite ? '★' : '☆'}</button>
          <button class="mini" onclick="removeDirectProperty('${p.id}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }

  function directCard(p) {
    let cat = global.getPropertyCategory(p.price);
    let slab = global.getPropertyBudgetSlab(p.price);
    let catClass = 'cat-' + cat.toLowerCase().replace(/[^\w-]/g, '-').replace(/-+/g, '-');
    let hasImg = p.photo && p.photo.trim();

    return `<article class="prop-card">
      ${hasImg ? `<div class="prop-cover" onclick="openLightbox('${global.esc(p.photo)}', '${global.esc(p.name)}')" title="Click to view full image"><img src="${global.esc(p.photo)}" alt="${global.esc(p.name)}" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="prop-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <span class="badge badge-source-direct">🔑 DIRECT PROPERTY</span>
            <span class="badge ${p.status.toLowerCase()}">${global.esc(p.status)}</span>
          </div>
          <button class="mini" onclick="toggleFav('${p.id}')" title="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}">${p.favorite ? '★' : '☆'}</button>
        </div>
        <h3 style="margin:8px 0 3px">${global.esc(p.name)}</h3>
        <div class="muted">📍 ${global.esc(p.location)}</div>
        <div class="tag-row" style="margin:6px 0 4px">
          <span class="badge ${catClass}">${global.esc(cat)}</span>
          <span class="badge slab">${global.esc(slab)}</span>
        </div>
        <div class="prop-meta">
          <span>${global.esc(p.type)}</span>
          ${p.bhk ? `<span>${global.esc(p.bhk)}</span>` : ''}
          ${p.area ? `<span>${global.esc(global.formatArea(p))}</span>` : ''}
          <span>${global.esc(p.facing || '')}</span>
        </div>
        <div style="margin-top:6px;font-size:12px;background:rgba(234,179,8,0.1);padding:4px 8px;border-radius:6px;border:1px solid rgba(234,179,8,0.25)">
          👤 <b>${global.esc(p.owner || 'Direct Owner')}</b> ${p.phone ? `• <a href="tel:${global.esc(p.phone)}" style="color:var(--primary);text-decoration:none">${global.esc(p.phone)}</a>` : ''}
        </div>
        <div class="prop-price" style="margin-top:6px">${global.money(p.price)}</div>
        <div class="prop-actions" style="margin-top:9px;display:flex;gap:6px;flex-wrap:wrap">
          <button class="mini" onclick="view('${p.id}')">View</button>
          <button class="mini" onclick="shareProperty('${p.id}', 'direct')">Share</button>
          <button class="mini" onclick="openDirectPropertyForm('${p.id}')">Edit</button>
          ${p.phone ? `<a class="mini" href="tel:${global.esc(p.phone)}">📞 Call</a>` : ''}
          ${p.phone ? `<button class="mini" onclick="window.open('https://wa.me/91${global.esc(p.phone.replace(/\\D/g, ''))}')">💬 WhatsApp</button>` : ''}
        </div>
      </div>
    </article>`;
  }

  // Export to global scope
  global.currentView = currentView;
  global.directView = directView;
  global.formPropertySource = formPropertySource;
  global.fillLocations = fillLocations;
  global.fillPropertyTypes = fillPropertyTypes;
  global.setView = setView;
  global.filtered = filtered;
  global.renderProperties = renderProperties;
  global.row = row;
  global.card = card;
  global.clearFilters = clearFilters;
  global.getCustomFieldsForModule = getCustomFieldsForModule;
  global.renderCustomFormFields = renderCustomFormFields;
  global.toggleMultiselectChip = toggleMultiselectChip;
  global.extractCustomFieldValues = extractCustomFieldValues;
  global.renderCustomFieldsDetail = renderCustomFieldsDetail;
  global.updatePropertyCategoryPreview = updatePropertyCategoryPreview;
  global.handleImageUpload = handleImageUpload;
  global.removeUploadedImage = removeUploadedImage;
  global.onPhotoUrlChange = onPhotoUrlChange;
  global.openForm = openForm;
  global.openDirectPropertyForm = openDirectPropertyForm;
  global.saveProperty = saveProperty;
  global.removeProp = removeProp;
  global.removeDirectProperty = removeDirectProperty;
  global.toggleFav = toggleFav;
  global.view = view;
  global.setDirectView = setDirectView;
  global.clearDirectFilters = clearDirectFilters;
  global.renderDirectProperties = renderDirectProperties;
  global.directRow = directRow;
  global.directCard = directCard;

})(typeof window !== 'undefined' ? window : globalThis);
