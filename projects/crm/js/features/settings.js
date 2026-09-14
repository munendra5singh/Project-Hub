/**
 * PROPERTY MANAGER PRO — SETTINGS & CONFIGURATION MODULE
 * ======================================================
 * Centralized taxonomy, custom fields builder, categories, filter engines, and system reset.
 */

(function(global) {
  'use strict';

  const settingsTabMeta = {
    types: {
      title: 'Types & Sub-categories',
      addTitle: 'Add Type',
      editTitle: 'Edit Type',
      desc: 'Property and project types used across inventory, forms, and search filters.',
      nameLabel: 'Type Name *',
      namePlaceholder: 'e.g. Villa, Duplex, Penthouse, Farmhouse...'
    },
    locations: {
      title: 'Locations',
      addTitle: 'Add Location',
      editTitle: 'Edit Location',
      desc: 'Prime areas, localities, and cities for properties and upcoming projects.',
      nameLabel: 'Location Name *',
      namePlaceholder: 'e.g. Rajpur, Jakhan, Sahastradhara Road...'
    },
    statuses: {
      title: 'Inventory Statuses',
      addTitle: 'Add Status',
      editTitle: 'Edit Status',
      desc: 'Inventory lifecycle states (Available, Hold, Sold, Pre-Launch, Ready) with badge styles.',
      nameLabel: 'Status Name *',
      namePlaceholder: 'e.g. Available, Hold, Under Negotiation, Ready...'
    },
    priceCategories: {
      title: 'Price Categories',
      addTitle: 'Add Price Category',
      editTitle: 'Edit Price Category',
      desc: 'Price brackets and categories (Below ₹1 Cr, Economical, Mid-Premium, Luxury) with min/max amounts.',
      nameLabel: 'Category Label *',
      namePlaceholder: 'e.g. Economical, Mid-Premium, Luxury, Ultra Luxury...'
    },
    budgetSlabs: {
      title: 'Budget Slabs',
      addTitle: 'Add Budget Slab',
      editTitle: 'Edit Budget Slab',
      desc: 'Budget slabs used for quick financial filtering across properties and projects.',
      nameLabel: 'Budget Slab Label *',
      namePlaceholder: 'e.g. ₹1 Cr, ₹2 Cr, ₹5 Cr+...'
    },
    sortOptions: {
      title: 'Sort Options',
      addTitle: 'Add Sort Option',
      editTitle: 'Edit Sort Option',
      desc: 'Sorting criteria and order options available in property, project, and search lists.',
      nameLabel: 'Sort Option Label *',
      namePlaceholder: 'e.g. Price: Low to High, Newest First...'
    },
    customFilters: {
      title: 'Custom Filters',
      addTitle: 'Add Custom Filter',
      editTitle: 'Edit Custom Filter',
      desc: 'Custom filter dimensions (Facing, BHK Configuration, Road Width, Furnishing) and their options.',
      nameLabel: 'Filter Name *',
      namePlaceholder: 'e.g. Facing, Road Width, Furnishing...'
    },
    customFields: {
      title: 'Custom Field Builder',
      addTitle: 'Add Custom Field',
      editTitle: 'Edit Custom Field',
      desc: 'Design and manage dynamic custom fields (12 field types) across Properties, Direct Properties, and Projects.',
      nameLabel: 'Field Label *',
      namePlaceholder: 'e.g. RERA ID, Carpet Area, Possession Date...'
    }
  };

  let currentSettingsTab = 'types';

  function centerActiveSettingsTab(smooth = true) {
    const bar = document.querySelector('.settings-tabs-bar');
    if (!bar) return;
    const activeBtn = bar.querySelector('.settings-tab-btn.active');
    if (!activeBtn) return;

    const barWidth = bar.clientWidth;
    const btnLeft = activeBtn.offsetLeft;
    const btnWidth = activeBtn.offsetWidth;
    const scrollTarget = btnLeft - (barWidth - btnWidth) / 2;

    bar.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      const sp = document.getElementById('settingsPage');
      if (sp && sp.style.display !== 'none') {
        centerActiveSettingsTab(false);
      }
    });
  }

  function setSettingsTab(tabName) {
    currentSettingsTab = tabName;
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cfg-tab') === tabName);
    });
    let addBtn = document.getElementById('settingsAddBtn');
    if (addBtn) {
      if (tabName === 'customFields') {
        addBtn.onclick = () => openCustomFieldModal('add');
        addBtn.textContent = '＋ Add Custom Field';
      } else {
        addBtn.onclick = () => openConfigModal('add');
        addBtn.textContent = '＋ Add New Entry';
      }
    }
    renderSettingsPage();
    requestAnimationFrame(() => centerActiveSettingsTab(true));
  }

  function getAppliesBadge(appliesTo) {
    if (appliesTo === 'property') return '<span class="badge-applies property">🏠 Property Only</span>';
    if (appliesTo === 'direct') return '<span class="badge-applies direct">🔑 Direct Only</span>';
    if (appliesTo === 'project') return '<span class="badge-applies project">🏗️ Project Only</span>';
    return '<span class="badge-applies both">🌐 Both</span>';
  }

  function renderSettingsItem(item, idx, total, tab) {
    let appliesBadge = getAppliesBadge(item.appliesTo);
    let hasActual = typeof global.hasActualUserDataOrConfig === 'function' ? global.hasActualUserDataOrConfig() : false;
    let exampleBadge = (item.isExample && !hasActual) ? '<span class="badge-example">Example — You can edit or delete this</span>' : '';

    let detailsHtml = '';
    if (tab === 'types') {
      if (item.subcategories && item.subcategories.length) {
        detailsHtml = `<div class="subcat-chips">
          ${item.subcategories.map(s => `<span class="subcat-chip">${global.esc(s)}</span>`).join('')}
        </div>`;
      }
    } else if (tab === 'statuses') {
      detailsHtml = `<div style="margin-top:4px">
        <span class="badge ${global.esc(item.badgeClass || 'available')}">${global.esc(item.name)}</span>
      </div>`;
    } else if (tab === 'priceCategories' || tab === 'budgetSlabs') {
      let minP = item.minPrice != null ? item.minPrice : 0;
      let maxP = item.maxPrice;
      let rangeStr = '';
      if (maxP == null || maxP === '' || maxP === Infinity) {
        rangeStr = `Range: ${global.money(minP)}+`;
      } else {
        rangeStr = `Range: ${global.money(minP)} – ${global.money(maxP)}`;
      }
      detailsHtml = `<div class="config-range-text">${rangeStr}</div>`;
    } else if (tab === 'sortOptions') {
      let behaviorMap = {
        newest: 'Newest First (Creation Date)',
        new: 'Newest First (Creation Date)',
        oldest: 'Oldest First (Creation Date)',
        old: 'Oldest First (Creation Date)',
        priceLow: 'Price: Low to High',
        priceHigh: 'Price: High to Low',
        az: 'Name: A to Z'
      };
      detailsHtml = `<div class="config-range-text">Sort logic: ${global.esc(behaviorMap[item.value] || item.value || 'Custom')}</div>`;
    } else if (tab === 'customFilters') {
      if (item.options && item.options.length) {
        detailsHtml = `<div class="subcat-chips">
          ${item.options.map(o => `<span class="subcat-chip">${global.esc(o)}</span>`).join('')}
        </div>`;
      }
    }

    return `
      <div class="config-item-card ${item.enabled ? '' : 'config-item-disabled'}">
        <div class="config-item-left">
          <div class="config-reorder-btns">
            <button type="button" class="config-reorder-btn" ${idx === 0 ? 'disabled' : ''} onclick="reorderConfigItem('${item.id}', -1)" title="Move up">▲</button>
            <button type="button" class="config-reorder-btn" ${idx === total - 1 ? 'disabled' : ''} onclick="reorderConfigItem('${item.id}', 1)" title="Move down">▼</button>
          </div>
          <div>
            <div class="config-item-title">
              <span>${global.esc(item.name)}</span>
              ${appliesBadge}
              ${exampleBadge}
              ${!item.enabled ? '<span class="badge-disabled">Disabled</span>' : ''}
            </div>
            ${detailsHtml}
          </div>
        </div>
        <div class="config-item-right">
          <button type="button" class="config-toggle-btn ${item.enabled ? 'active' : 'inactive'}" onclick="toggleConfigItem('${item.id}')" title="${item.enabled ? 'Click to disable' : 'Click to enable'}">
            ${item.enabled ? '✓ Enabled' : '✕ Disabled'}
          </button>
          <button type="button" class="btn" style="padding:6px 12px;font-size:12px" onclick="openConfigModal('edit', '${item.id}')">✏️ Edit</button>
          <button type="button" class="btn" style="padding:6px 12px;font-size:12px;color:var(--danger)" onclick="deleteConfigItem('${item.id}')" title="Delete entry">🗑️</button>
        </div>
      </div>
    `;
  }

  function renderCustomFieldSettingsList() {
    let list = (global.appConfig && global.appConfig.customFields) ? global.appConfig.customFields : [];
    let descElem = document.getElementById('settingsTabDesc');
    let countElem = document.getElementById('settingsTabCount');
    if (descElem) descElem.textContent = settingsTabMeta.customFields.desc;
    if (countElem) countElem.textContent = `${list.length} ${list.length === 1 ? 'field' : 'fields'}`;

    let container = document.getElementById('settingsItemsContainer');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div class="empty" style="padding:40px 20px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">🧩</div>
          <b style="font-size:16px">No Custom Fields Defined</b>
          <div style="color:var(--muted);margin-top:6px;max-width:360px;margin-left:auto;margin-right:auto">
            Add custom fields (Text, Number, Currency ₹, Date, Dropdown, Multi-select, Phone, etc.) to customize your CRM forms and records.
          </div>
          <div style="margin-top:14px">
            <button type="button" class="btn primary" onclick="openCustomFieldModal('add')">＋ Add Your First Custom Field</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((item, idx) => {
      let typeLabels = {
        text: 'Text',
        longtext: 'Long Text',
        number: 'Number',
        currency: 'Currency (₹)',
        date: 'Date',
        datetime: 'Date & Time',
        dropdown: 'Dropdown',
        multiselect: 'Multi-select',
        checkbox: 'Checkbox',
        phone: 'Phone',
        email: 'Email',
        url: 'URL'
      };
      let typeName = typeLabels[item.type] || item.type;
      let appliesLabel = item.appliesTo === 'property' ? '🏠 Property Only' : (item.appliesTo === 'direct' ? '🔑 Direct Only' : (item.appliesTo === 'project' ? '🏗️ Project Only' : '🌐 All Modules'));
      let hasActual = typeof global.hasActualUserDataOrConfig === 'function' ? global.hasActualUserDataOrConfig() : false;
      let exampleBadge = (item.isExample && !hasActual) ? '<span class="badge-example">Example</span>' : '';

      let tagBadges = [
        `<span class="badge" style="background:#e0e7ff;color:#3730a3;font-size:11px">${global.esc(typeName)}</span>`,
        `<span class="badge" style="background:#f1f5f9;color:#475569;font-size:11px">${appliesLabel}</span>`,
        item.required ? '<span class="badge" style="background:#fee2e2;color:#991b1b;font-size:11px">Required</span>' : '',
        item.searchable !== false ? '<span class="badge" style="background:#ecfdf5;color:#065f46;font-size:11px">Searchable</span>' : '',
        item.filterable !== false ? '<span class="badge" style="background:#fef3c7;color:#92400e;font-size:11px">Filterable</span>' : '',
        item.exportable !== false ? '<span class="badge" style="background:#f0fdf4;color:#166534;font-size:11px">Exportable</span>' : ''
      ].filter(Boolean).join(' ');

      let optionsHtml = '';
      if ((item.type === 'dropdown' || item.type === 'multiselect') && Array.isArray(item.options) && item.options.length) {
        optionsHtml = `<div class="subcat-chips" style="margin-top:6px">${item.options.map(o => `<span class="subcat-chip">${global.esc(o)}</span>`).join('')}</div>`;
      }

      return `
        <div class="config-item-card ${item.enabled !== false ? '' : 'config-item-disabled'}">
          <div class="config-item-left">
            <div class="config-reorder-btns">
              <button type="button" class="config-reorder-btn" ${idx === 0 ? 'disabled' : ''} onclick="reorderCustomField('${item.id}', -1)" title="Move up">▲</button>
              <button type="button" class="config-reorder-btn" ${idx === list.length - 1 ? 'disabled' : ''} onclick="reorderCustomField('${item.id}', 1)" title="Move down">▼</button>
            </div>
            <div>
              <div class="config-item-title">
                <b>${global.esc(item.label)}</b>
                <code style="font-size:11px;padding:2px 6px;background:rgba(0,0,0,0.06);border-radius:4px;color:var(--primary)">${global.esc(item.key)}</code>
                ${exampleBadge}
                ${item.enabled === false ? '<span class="badge-disabled">Disabled</span>' : ''}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
                ${tagBadges}
              </div>
              ${optionsHtml}
            </div>
          </div>
          <div class="config-item-right">
            <button type="button" class="config-toggle-btn ${item.enabled !== false ? 'active' : 'inactive'}" onclick="toggleCustomFieldEnabled('${item.id}')" title="${item.enabled !== false ? 'Click to disable' : 'Click to enable'}">
              ${item.enabled !== false ? '✓ Enabled' : '✕ Disabled'}
            </button>
            <button type="button" class="btn" style="padding:6px 12px;font-size:12px" onclick="openCustomFieldModal('edit', '${item.id}')">✏️ Edit</button>
            <button type="button" class="btn" style="padding:6px 12px;font-size:12px;color:var(--danger)" onclick="deleteCustomField('${item.id}')" title="Delete custom field">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function syncSettingsWithActiveData() {
    if (typeof global.syncConfigWithInventoryData === 'function' && global.appConfig) {
      global.appConfig = global.syncConfigWithInventoryData(global.appConfig);
    }
  }

  function renderSettingsPage() {
    let tab = currentSettingsTab || 'types';
    currentSettingsTab = tab;

    syncSettingsWithActiveData();

    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cfg-tab') === tab);
    });

    if (tab === 'customFields') {
      renderCustomFieldSettingsList();
      return;
    }

    let meta = settingsTabMeta[tab] || {
      title: 'Categories & Filters',
      desc: 'Centrally configure categories and filters.',
      nameLabel: 'Name *',
      namePlaceholder: 'Enter name...'
    };

    let descElem = document.getElementById('settingsTabDesc');
    let countElem = document.getElementById('settingsTabCount');
    let list = (global.appConfig && global.appConfig[tab]) ? global.appConfig[tab] : [];

    let hasActual = typeof global.hasActualUserDataOrConfig === 'function' ? global.hasActualUserDataOrConfig() : false;
    if (hasActual) {
      list = list.filter(item => item && (item.isExample === false || !item.isExample));
    }

    if (descElem) descElem.textContent = meta.desc;
    if (countElem) countElem.textContent = `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`;

    let container = document.getElementById('settingsItemsContainer');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div class="empty" style="padding:40px 20px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">⚙️</div>
          <b style="font-size:16px">No entries found</b>
          <div style="color:var(--muted);margin-top:6px;max-width:360px;margin-left:auto;margin-right:auto">
            You have no entries in this category yet. Click below to add your first entry.
          </div>
          <div style="margin-top:14px">
            <button type="button" class="btn primary" onclick="openConfigModal()">＋ Add New Entry</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((item, idx) => renderSettingsItem(item, idx, list.length, tab)).join('');
  }

  function openCustomFieldModal(mode = 'add', fieldId = null) {
    let modal = document.getElementById('customFieldModal');
    if (!modal) return;
    let title = document.getElementById('cfModalTitle');
    let idInput = document.getElementById('cfFieldId');
    let labelInput = document.getElementById('cfLabel');
    let keyInput = document.getElementById('cfKey');
    let typeSelect = document.getElementById('cfType');
    let moduleSelect = document.getElementById('cfModule');
    let placeholderInput = document.getElementById('cfPlaceholder');
    let defaultValueInput = document.getElementById('cfDefaultValue');
    let optionsGroup = document.getElementById('cfOptionsGroup');
    let optionsInput = document.getElementById('cfOptions');
    let reqBox = document.getElementById('cfRequired');
    let searchBox = document.getElementById('cfSearchable');
    let filterBox = document.getElementById('cfFilterable');
    let exportBox = document.getElementById('cfExportable');
    let enabledBox = document.getElementById('cfEnabled');

    if (mode === 'edit' && fieldId) {
      let cf = (global.appConfig.customFields || []).find(x => x.id === fieldId);
      if (!cf) return;
      if (title) title.textContent = 'Edit Custom Field';
      if (idInput) idInput.value = cf.id;
      if (labelInput) labelInput.value = cf.label || '';
      if (keyInput) {
        keyInput.value = cf.key || '';
        keyInput.disabled = true;
      }
      if (typeSelect) typeSelect.value = cf.type || 'text';
      if (moduleSelect) moduleSelect.value = cf.appliesTo || 'all';
      if (placeholderInput) placeholderInput.value = cf.placeholder || '';
      if (defaultValueInput) defaultValueInput.value = cf.defaultValue ?? '';
      if (optionsInput) optionsInput.value = Array.isArray(cf.options) ? cf.options.join(', ') : (cf.options || '');
      if (optionsGroup) optionsGroup.style.display = (cf.type === 'dropdown' || cf.type === 'multiselect') ? '' : 'none';
      if (reqBox) reqBox.checked = !!cf.required;
      if (searchBox) searchBox.checked = cf.searchable !== false;
      if (filterBox) filterBox.checked = cf.filterable !== false;
      if (exportBox) exportBox.checked = cf.exportable !== false;
      if (enabledBox) enabledBox.checked = cf.enabled !== false;
    } else {
      if (title) title.textContent = 'Add Custom Field';
      if (idInput) idInput.value = '';
      if (labelInput) labelInput.value = '';
      if (keyInput) {
        keyInput.value = '';
        keyInput.disabled = false;
      }
      if (typeSelect) typeSelect.value = 'text';
      if (moduleSelect) moduleSelect.value = 'all';
      if (placeholderInput) placeholderInput.value = '';
      if (defaultValueInput) defaultValueInput.value = '';
      if (optionsInput) optionsInput.value = '';
      if (optionsGroup) optionsGroup.style.display = 'none';
      if (reqBox) reqBox.checked = false;
      if (searchBox) searchBox.checked = true;
      if (filterBox) filterBox.checked = true;
      if (exportBox) exportBox.checked = true;
      if (enabledBox) enabledBox.checked = true;
    }
    modal.classList.add('show');
    setTimeout(() => labelInput?.focus(), 50);
  }

  function onCustomFieldLabelInput(val) {
    let idInput = document.getElementById('cfFieldId');
    if (!idInput || !idInput.value) {
      let keyInput = document.getElementById('cfKey');
      if (keyInput && !keyInput.disabled) {
        let cleanKey = (val || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        if (cleanKey && !cleanKey.startsWith('cf_')) cleanKey = 'cf_' + cleanKey;
        keyInput.value = cleanKey;
      }
    }
  }

  function onCustomFieldTypeChange(type) {
    let optionsGroup = document.getElementById('cfOptionsGroup');
    if (optionsGroup) {
      optionsGroup.style.display = (type === 'dropdown' || type === 'multiselect') ? '' : 'none';
    }
  }

  function saveCustomField() {
    let idInput = document.getElementById('cfFieldId');
    let labelInput = document.getElementById('cfLabel');
    let keyInput = document.getElementById('cfKey');
    let typeSelect = document.getElementById('cfType');
    let moduleSelect = document.getElementById('cfModule');
    let placeholderInput = document.getElementById('cfPlaceholder');
    let defaultValueInput = document.getElementById('cfDefaultValue');
    let optionsInput = document.getElementById('cfOptions');
    let reqBox = document.getElementById('cfRequired');
    let searchBox = document.getElementById('cfSearchable');
    let filterBox = document.getElementById('cfFilterable');
    let exportBox = document.getElementById('cfExportable');
    let enabledBox = document.getElementById('cfEnabled');

    let label = (labelInput?.value || '').trim();
    let key = (keyInput?.value || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    let type = typeSelect?.value || 'text';
    let module = moduleSelect?.value || 'all';

    if (!label) {
      global.toast('Field Label is required');
      labelInput?.focus();
      return;
    }
    if (!key) {
      global.toast('Internal Key is required');
      keyInput?.focus();
      return;
    }

    if (!global.appConfig.customFields) global.appConfig.customFields = [];

    let existingId = idInput?.value;
    let dup = global.appConfig.customFields.find(f => f.key === key && f.id !== existingId);
    if (dup) {
      global.toast(`Key "${key}" is already in use by field "${dup.label}". Choose a different key.`);
      keyInput?.focus();
      return;
    }

    let options = [];
    if (type === 'dropdown' || type === 'multiselect') {
      let rawOpts = (optionsInput?.value || '').trim();
      options = rawOpts ? rawOpts.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (!options.length) {
        global.toast('Please enter at least one option for dropdown/multiselect');
        optionsInput?.focus();
        return;
      }
    }

    let cfItem = {
      id: existingId || ('cf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
      key: key,
      label: label,
      type: type,
      appliesTo: module,
      placeholder: (placeholderInput?.value || '').trim(),
      defaultValue: (defaultValueInput?.value || '').trim(),
      options: options,
      required: !!reqBox?.checked,
      searchable: searchBox ? searchBox.checked : true,
      filterable: filterBox ? filterBox.checked : true,
      exportable: exportBox ? exportBox.checked : true,
      enabled: enabledBox ? enabledBox.checked : true,
      isExample: false
    };

    if (existingId) {
      let idx = global.appConfig.customFields.findIndex(f => f.id === existingId);
      if (idx >= 0) global.appConfig.customFields[idx] = cfItem;
      else global.appConfig.customFields.push(cfItem);
    } else {
      global.appConfig.customFields.push(cfItem);
    }

    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
    global.closeModal('customFieldModal');
    renderSettingsPage();
    global.toast(existingId ? 'Custom field updated' : 'Custom field added successfully');
  }

  function deleteCustomField(id) {
    let cf = (global.appConfig.customFields || []).find(f => f.id === id);
    if (!cf) return;
    if (!confirm(`Delete custom field "${cf.label}"? Existing records will keep their data, but the field won't show in forms.`)) return;

    global.appConfig.customFields = global.appConfig.customFields.filter(f => f.id !== id);
    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);

    currentSettingsTab = 'customFields';
    if (typeof global.currentPage !== 'undefined' && global.currentPage !== 'settings' && typeof global.showPage === 'function') {
      global.showPage('settings', false);
    }
    renderSettingsPage();
    global.toast(`Custom field "${cf.label}" deleted`);
  }

  function toggleCustomFieldEnabled(id) {
    let cf = (global.appConfig.customFields || []).find(f => f.id === id);
    if (!cf) return;
    cf.enabled = !cf.enabled;
    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
    renderSettingsPage();
  }

  function reorderCustomField(id, dir) {
    let list = global.appConfig.customFields || [];
    let idx = list.findIndex(f => f.id === id);
    if (idx < 0) return;
    let targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    let temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
    renderSettingsPage();
  }

  // ==================== APP RESET (DANGER ZONE) ====================
  function openResetAppModal() {
    let m = document.getElementById('resetAppModal');
    if (m) m.classList.add('show');
  }

  async function confirmResetApp() {
    try {
      // 1. Clear in-memory data
      global.data = [];
      if (typeof global.directData !== 'undefined') global.directData = [];
      global.upcomingData = [];

      // 2. Clear history records (Import History & Recently Deleted)
      if (typeof global.saveHistoryData === 'function') {
        global.saveHistoryData({ importHistory: [], recentlyDeleted: [] });
      }

      // 3. Clear search inputs if any
      let qEl = document.getElementById('search');
      if (qEl) qEl.value = '';
      let msEl = document.getElementById('masterSearchInput');
      if (msEl) msEl.value = '';
      let hsEl = document.getElementById('historySearchInput');
      if (hsEl) hsEl.value = '';

      // 4. Clear CRM datasets from LocalStorage safely (target CRM-only keys)
      try {
        localStorage.removeItem(global.KEY || 'property_manager_pro_v2');
        localStorage.removeItem(global.UP_KEY || 'property_manager_pro_v2_upcoming');
        localStorage.removeItem(global.DIRECT_KEY || 'property_manager_pro_direct_v1');
        localStorage.removeItem(global.HISTORY_KEY || 'property_manager_pro_history_v1');
        localStorage.removeItem(global.DEMO_VERSION_KEY || 'property_manager_pro_demo_v2');
        localStorage.setItem(global.DEMO_CLEARED_KEY || 'property_manager_pro_demo_cleared_v1', 'true');
      } catch (e) {}

      // 5. Clear IndexedDB stores
      try {
        if (global.db && typeof global.dbSaveAll === 'function') {
          await Promise.all([
            global.dbSaveAll('properties', []),
            global.dbSaveAll('upcoming_projects', []),
            global.dbSaveAll('direct_properties', [])
          ]);
        }
      } catch (e) {
        console.error('IndexedDB reset error:', e);
      }

      // 6. Close confirmation modal
      global.closeModal('resetAppModal');

      // 7. Navigate to Dashboard view
      if (typeof global.showPage === 'function') {
        global.showPage('dashboard');
      }

      // 8. Render clean empty state across views
      if (typeof global.renderAll === 'function') {
        global.renderAll();
      }

      // 9. Success feedback
      global.toast('App has been reset successfully');
    } catch (err) {
      console.error('Reset app error:', err);
      global.closeModal('resetAppModal');
      global.toast('App reset complete');
    }
  }

  function openConfigModal(mode = 'add', itemId = null) {
    let tab = currentSettingsTab;
    let meta = settingsTabMeta[tab] || {
      nameLabel: 'Name / Label *',
      namePlaceholder: 'Enter name...'
    };

    let tabInput = document.getElementById('cfgItemTab');
    let idInput = document.getElementById('cfgItemId');
    let nameLabel = document.getElementById('cfgNameLabel');
    let nameInput = document.getElementById('cfgName');

    if (tabInput) tabInput.value = tab;
    if (idInput) idInput.value = itemId || '';
    if (nameLabel) nameLabel.textContent = meta.nameLabel;
    if (nameInput) nameInput.placeholder = meta.namePlaceholder;

    let subcatGroup = document.getElementById('cfgSubcategoriesGroup');
    let badgeGroup = document.getElementById('cfgStatusBadgeGroup');
    let minPriceGroup = document.getElementById('cfgMinPriceGroup');
    let maxPriceGroup = document.getElementById('cfgMaxPriceGroup');
    let sortValGroup = document.getElementById('cfgSortValGroup');
    let filterOptionsGroup = document.getElementById('cfgFilterOptionsGroup');

    if (subcatGroup) subcatGroup.style.display = (tab === 'types') ? '' : 'none';
    if (badgeGroup) badgeGroup.style.display = (tab === 'statuses') ? '' : 'none';
    if (minPriceGroup) minPriceGroup.style.display = (tab === 'priceCategories' || tab === 'budgetSlabs') ? '' : 'none';
    if (maxPriceGroup) maxPriceGroup.style.display = (tab === 'priceCategories' || tab === 'budgetSlabs') ? '' : 'none';
    if (sortValGroup) sortValGroup.style.display = (tab === 'sortOptions') ? '' : 'none';
    if (filterOptionsGroup) filterOptionsGroup.style.display = (tab === 'customFilters') ? '' : 'none';

    let titleElem = document.getElementById('configModalTitle');

    if (mode === 'edit' && itemId) {
      let item = (global.appConfig[tab] || []).find(x => x.id === itemId);
      if (!item) return;

      if (titleElem) titleElem.textContent = meta.editTitle || ('Edit ' + meta.nameLabel.replace('*', '').trim());
      if (nameInput) nameInput.value = item.name || '';
      let appliesToSel = document.getElementById('cfgAppliesTo');
      if (appliesToSel) appliesToSel.value = item.appliesTo || 'both';
      let enabledBox = document.getElementById('cfgEnabled');
      if (enabledBox) enabledBox.checked = item.enabled !== false;

      if (tab === 'types') {
        let subInp = document.getElementById('cfgSubcategories');
        if (subInp) subInp.value = Array.isArray(item.subcategories) ? item.subcategories.join(', ') : '';
      } else if (tab === 'statuses') {
        let badgeSel = document.getElementById('cfgBadgeClass');
        if (badgeSel) badgeSel.value = item.badgeClass || 'available';
      } else if (tab === 'priceCategories' || tab === 'budgetSlabs') {
        let minInp = document.getElementById('cfgMinPrice');
        let maxInp = document.getElementById('cfgMaxPrice');
        if (minInp) minInp.value = item.minPrice != null ? item.minPrice : '';
        if (maxInp) maxInp.value = (item.maxPrice != null && item.maxPrice !== Infinity) ? item.maxPrice : '';
      } else if (tab === 'sortOptions') {
        let sortSel = document.getElementById('cfgSortVal');
        if (sortSel) sortSel.value = item.value || 'newest';
      } else if (tab === 'customFilters') {
        let optInp = document.getElementById('cfgFilterOptions');
        if (optInp) optInp.value = Array.isArray(item.options) ? item.options.join(', ') : '';
      }
    } else {
      if (titleElem) titleElem.textContent = meta.addTitle || ('Add ' + meta.nameLabel.replace('*', '').trim());
      if (nameInput) nameInput.value = '';
      let appliesToSel = document.getElementById('cfgAppliesTo');
      if (appliesToSel) appliesToSel.value = 'both';
      let enabledBox = document.getElementById('cfgEnabled');
      if (enabledBox) enabledBox.checked = true;

      if (tab === 'types') {
        let subInp = document.getElementById('cfgSubcategories');
        if (subInp) subInp.value = '';
      } else if (tab === 'statuses') {
        let badgeSel = document.getElementById('cfgBadgeClass');
        if (badgeSel) badgeSel.value = 'available';
      } else if (tab === 'priceCategories' || tab === 'budgetSlabs') {
        let minInp = document.getElementById('cfgMinPrice');
        let maxInp = document.getElementById('cfgMaxPrice');
        if (minInp) minInp.value = '';
        if (maxInp) maxInp.value = '';
      } else if (tab === 'sortOptions') {
        let sortSel = document.getElementById('cfgSortVal');
        if (sortSel) sortSel.value = 'newest';
      } else if (tab === 'customFilters') {
        let optInp = document.getElementById('cfgFilterOptions');
        if (optInp) optInp.value = '';
      }
    }

    document.getElementById('configItemModal')?.classList.add('show');
    setTimeout(() => document.getElementById('cfgName')?.focus(), 50);
  }

  function saveConfigItem() {
    let tab = document.getElementById('cfgItemTab')?.value || currentSettingsTab;
    let id = document.getElementById('cfgItemId')?.value;
    let name = (document.getElementById('cfgName')?.value || '').trim();
    let appliesTo = document.getElementById('cfgAppliesTo')?.value || 'both';
    let enabled = document.getElementById('cfgEnabled') ? document.getElementById('cfgEnabled').checked : true;

    if (!name) {
      global.toast('Please enter a name or label');
      document.getElementById('cfgName')?.focus();
      return;
    }

    if (!global.appConfig[tab]) global.appConfig[tab] = [];

    let itemData = {
      name,
      appliesTo,
      enabled,
      isExample: false
    };

    if (tab === 'types') {
      let subStr = (document.getElementById('cfgSubcategories')?.value || '').trim();
      itemData.subcategories = subStr ? subStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    } else if (tab === 'statuses') {
      itemData.badgeClass = document.getElementById('cfgBadgeClass')?.value || 'available';
    } else if (tab === 'priceCategories' || tab === 'budgetSlabs') {
      let minP = document.getElementById('cfgMinPrice')?.value;
      let maxP = document.getElementById('cfgMaxPrice')?.value;
      itemData.minPrice = (minP !== '' && minP != null) ? Number(minP) : 0;
      itemData.maxPrice = (maxP !== '' && maxP != null) ? Number(maxP) : Infinity;
    } else if (tab === 'sortOptions') {
      itemData.value = document.getElementById('cfgSortVal')?.value || 'newest';
    } else if (tab === 'customFilters') {
      let optStr = (document.getElementById('cfgFilterOptions')?.value || '').trim();
      itemData.options = optStr ? optStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    }

    if (id) {
      let idx = global.appConfig[tab].findIndex(x => x.id === id);
      if (idx !== -1) {
        global.appConfig[tab][idx] = { ...global.appConfig[tab][idx], ...itemData, id };
      }
    } else {
      itemData.id = tab.slice(0, 4) + '_' + Date.now();
      global.appConfig[tab].push(itemData);
    }

    if (!Array.isArray(global.appConfig.deletedIds)) global.appConfig.deletedIds = [];
    if (id && global.appConfig.deletedIds.includes(id)) {
      global.appConfig.deletedIds = global.appConfig.deletedIds.filter(x => x !== id);
    }
    let normName = name.toLowerCase();
    if (global.appConfig.deletedIds.includes(normName)) {
      global.appConfig.deletedIds = global.appConfig.deletedIds.filter(x => x !== normName);
    }

    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
    global.closeModal('configItemModal');
    renderSettingsPage();
    populateAllConfigDropdowns();
    global.toast(id ? 'Entry updated successfully' : 'New entry created successfully');
  }

  function deleteConfigItem(itemId) {
    let tab = currentSettingsTab || 'types';
    currentSettingsTab = tab;
    let item = (global.appConfig[tab] || []).find(x => x.id === itemId);
    let itemName = item ? item.name : 'this entry';
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }
    if (!Array.isArray(global.appConfig.deletedIds)) {
      global.appConfig.deletedIds = [];
    }
    if (itemId && !global.appConfig.deletedIds.includes(itemId)) {
      global.appConfig.deletedIds.push(itemId);
    }
    if (item && item.name) {
      let norm = String(item.name).trim().toLowerCase();
      if (!global.appConfig.deletedIds.includes(norm)) {
        global.appConfig.deletedIds.push(norm);
      }
    }
    global.appConfig[tab] = (global.appConfig[tab] || []).filter(x => x.id !== itemId);
    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);

    currentSettingsTab = tab;
    if (typeof global.currentPage !== 'undefined' && global.currentPage !== 'settings' && typeof global.showPage === 'function') {
      global.showPage('settings', false);
    }
    renderSettingsPage();
    populateAllConfigDropdowns();
    global.toast(`"${itemName}" deleted`);
  }

  function toggleConfigItem(itemId) {
    let tab = currentSettingsTab;
    let item = (global.appConfig[tab] || []).find(x => x.id === itemId);
    if (!item) return;
    item.enabled = !item.enabled;
    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
    renderSettingsPage();
    populateAllConfigDropdowns();
    global.toast(item.enabled ? `"${item.name}" enabled` : `"${item.name}" disabled`);
  }

  function reorderConfigItem(itemId, direction) {
    let tab = currentSettingsTab;
    let list = global.appConfig[tab] || [];
    let idx = list.findIndex(x => x.id === itemId);
    if (idx === -1) return;
    let targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    let temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
    renderSettingsPage();
    populateAllConfigDropdowns();
  }

  function populateAllConfigDropdowns() {
    let cfg = global.appConfig || (typeof global.loadAppConfig === 'function' ? global.loadAppConfig() : null);
    if (!cfg) return;

    function updateSelect(id, optionsHtml, preferredVal) {
      let sel = document.getElementById(id);
      if (!sel) return;
      let curVal = sel.value;
      sel.innerHTML = optionsHtml;
      let opts = sel.options ? Array.from(sel.options) : [];
      if (curVal && opts.some(o => o.value === curVal)) {
        sel.value = curVal;
      } else if (preferredVal !== undefined && opts.some(o => o.value === preferredVal)) {
        sel.value = preferredVal;
      }
    }

    let propList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];

    // 1. Locations
    let enabledLocs = (cfg.locations || []).filter(x => x.enabled);
    let disabledLocNames = new Set((cfg.locations || []).filter(x => !x.enabled).map(x => String(x.name || '').trim().toLowerCase()));

    let extraPropLocs = propList.map(p => p.location).filter(Boolean).filter(loc => !disabledLocNames.has(String(loc).trim().toLowerCase()));
    let extraDirectLocs = directList.map(p => p.location).filter(Boolean).filter(loc => !disabledLocNames.has(String(loc).trim().toLowerCase()));
    let extraUpLocs = upList.map(u => u.location).filter(Boolean).filter(loc => !disabledLocNames.has(String(loc).trim().toLowerCase()));

    let propLocs = [...new Set([
      ...enabledLocs.filter(x => x.appliesTo !== 'project').map(x => x.name),
      ...extraPropLocs
    ])].sort();

    let directLocs = [...new Set([
      ...enabledLocs.filter(x => x.appliesTo !== 'project').map(x => x.name),
      ...extraDirectLocs
    ])].sort();

    let upLocs = [...new Set([
      ...enabledLocs.filter(x => x.appliesTo !== 'property').map(x => x.name),
      ...extraUpLocs
    ])].sort();

    let masterLocs = [...new Set([
      ...enabledLocs.map(x => x.name),
      ...extraPropLocs,
      ...extraDirectLocs,
      ...extraUpLocs
    ])].sort();

    updateSelect('filterLocation', '<option value="">All locations</option>' + propLocs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('directFilterLocation', '<option value="">All locations</option>' + directLocs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('upFilterLocation', '<option value="">All locations</option>' + upLocs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('masterFilterLocation', '<option value="">All Locations / Cities</option>' + masterLocs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));

    let datalistEl = document.getElementById('configLocationsList');
    if (datalistEl) {
      datalistEl.innerHTML = masterLocs.map(x => `<option value="${global.esc(x)}">`).join('');
    }

    // 2. Types
    let enabledTypes = (cfg.types || []).filter(x => x.enabled);
    let propTypes = enabledTypes.filter(x => x.appliesTo !== 'project').map(x => x.name);
    let upTypes = enabledTypes.filter(x => x.appliesTo !== 'property').map(x => x.name);
    let allTypes = enabledTypes.map(x => x.name);

    updateSelect('filterType', '<option value="">All types</option>' + propTypes.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('directFilterType', '<option value="">All types</option>' + propTypes.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('upFilterType', '<option value="">All types</option>' + upTypes.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('masterFilterType', '<option value="">All Types</option>' + allTypes.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));

    if (propTypes.length) {
      updateSelect('fType', propTypes.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    }
    if (upTypes.length) {
      updateSelect('pType', upTypes.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    }

    // 3. Statuses
    let enabledStatuses = (cfg.statuses || []).filter(x => x.enabled);
    let propStatuses = enabledStatuses.filter(x => x.appliesTo !== 'project').map(x => x.name);
    let upStatuses = enabledStatuses.filter(x => x.appliesTo !== 'property').map(x => x.name);
    let allStatuses = enabledStatuses.map(x => x.name);

    updateSelect('filterStatus', '<option value="">All status</option>' + propStatuses.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('directFilterStatus', '<option value="">All status</option>' + propStatuses.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('upFilterStatus', '<option value="">All status</option>' + upStatuses.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('masterFilterStatus', '<option value="">All Statuses</option>' + allStatuses.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));

    if (propStatuses.length) {
      updateSelect('fStatus', propStatuses.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    }
    if (upStatuses.length) {
      updateSelect('pStatus', upStatuses.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    }

    // 4. Price Categories
    let enabledCats = (cfg.priceCategories || []).filter(x => x.enabled);
    let propCats = enabledCats.filter(x => x.appliesTo !== 'project').map(x => x.name);
    let upCats = enabledCats.filter(x => x.appliesTo !== 'property').map(x => x.name);
    let allCats = enabledCats.map(x => x.name);

    updateSelect('filterCategory', '<option value="">All price categories</option>' + propCats.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('directFilterCategory', '<option value="">All price categories</option>' + propCats.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('upFilterCategory', '<option value="">All price categories</option>' + upCats.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('masterFilterCategory', '<option value="">All Price Categories</option>' + allCats.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));

    // 5. Budget Slabs
    let enabledSlabs = (cfg.budgetSlabs || []).filter(x => x.enabled);
    let propSlabs = enabledSlabs.filter(x => x.appliesTo !== 'project').map(x => x.name);
    let upSlabs = enabledSlabs.filter(x => x.appliesTo !== 'property').map(x => x.name);

    updateSelect('filterSlab', '<option value="">All budget slabs</option>' + propSlabs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('directFilterSlab', '<option value="">All budget slabs</option>' + propSlabs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));
    updateSelect('upFilterSlab', '<option value="">All budget slabs</option>' + upSlabs.map(x => `<option value="${global.esc(x)}">${global.esc(x)}</option>`).join(''));

    // 6. Sort Options
    let enabledSorts = (cfg.sortOptions || []).filter(x => x.enabled);
    let propSorts = enabledSorts.filter(x => x.appliesTo !== 'project');
    let upSorts = enabledSorts.filter(x => x.appliesTo !== 'property');
    let allSorts = enabledSorts;

    if (propSorts.length) {
      updateSelect('sortBy', propSorts.map(x => `<option value="${global.esc(x.value)}">${global.esc(x.name)}</option>`).join(''), propSorts[0].value);
      updateSelect('directSortBy', propSorts.map(x => `<option value="${global.esc(x.value)}">${global.esc(x.name)}</option>`).join(''), propSorts[0].value);
    }
    if (upSorts.length) {
      updateSelect('upSortBy', upSorts.map(x => `<option value="${global.esc(x.value)}">${global.esc(x.name)}</option>`).join(''), upSorts[0].value);
    }
    if (allSorts.length) {
      updateSelect('masterSortBy', '<option value="relevance">Sort: Relevance / Newest</option>' + allSorts.map(x => `<option value="${global.esc(x.value)}">${global.esc(x.name)}</option>`).join(''), 'relevance');
    }
  }

  // Export to global scope
  global.settingsTabMeta = settingsTabMeta;
  global.currentSettingsTab = currentSettingsTab;
  global.centerActiveSettingsTab = centerActiveSettingsTab;
  global.setSettingsTab = setSettingsTab;
  global.getAppliesBadge = getAppliesBadge;
  global.renderSettingsItem = renderSettingsItem;
  global.renderCustomFieldSettingsList = renderCustomFieldSettingsList;
  global.renderSettingsPage = renderSettingsPage;
  global.openCustomFieldModal = openCustomFieldModal;
  global.onCustomFieldLabelInput = onCustomFieldLabelInput;
  global.onCustomFieldTypeChange = onCustomFieldTypeChange;
  global.saveCustomField = saveCustomField;
  global.deleteCustomField = deleteCustomField;
  global.toggleCustomFieldEnabled = toggleCustomFieldEnabled;
  global.reorderCustomField = reorderCustomField;
  global.openResetAppModal = openResetAppModal;
  global.confirmResetApp = confirmResetApp;
  global.openConfigModal = openConfigModal;
  global.saveConfigItem = saveConfigItem;
  global.deleteConfigItem = deleteConfigItem;
  global.toggleConfigItem = toggleConfigItem;
  global.reorderConfigItem = reorderConfigItem;
  global.populateAllConfigDropdowns = populateAllConfigDropdowns;

})(typeof window !== 'undefined' ? window : globalThis);
