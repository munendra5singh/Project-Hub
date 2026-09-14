/**
 * PROPERTY MANAGER PRO — CORE STATE & SCHEMA ENGINE
 * ==================================================
 * Persistence keys, schema definitions, seed inventory, category math, and record normalizers.
 */

(function(global) {
  'use strict';

  // STORAGE KEYS (Separated to ensure zero interference)
  const KEY = 'property_manager_pro_v2';
  const UP_KEY = 'property_manager_pro_v2_upcoming';
  const DIRECT_KEY = 'property_manager_pro_direct_v1';
  const CONFIG_KEY = 'property_manager_pro_config_v1';
  const HISTORY_KEY = 'property_manager_pro_history_v1';
  const PROFILE_KEY = 'property_manager_pro_profile_v1';
  const PROFILE_SETUP_KEY = 'property_manager_pro_setup_completed_v1';
  const DEMO_VERSION_KEY = 'property_manager_pro_demo_v2';
  const DEMO_CLEARED_KEY = 'property_manager_pro_demo_cleared_v1';
  const RETENTION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days retention

  // CENTRAL CATEGORIES & FILTERS CONFIGURATION
  const defaultAppConfig = {
    version: 2,
    locations: [
      { id: 'loc_1', name: 'Rajpur', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'loc_2', name: 'Jakhan', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'loc_3', name: 'Sahastradhara Road', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'loc_4', name: 'Raipur Road', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'loc_5', name: 'Dehradun Central', appliesTo: 'both', enabled: true, isExample: true }
    ],
    types: [
      { id: 'type_1', name: 'Villa', appliesTo: 'both', subcategories: ['Luxury Villa', 'Independent Villa'], enabled: true, isExample: true },
      { id: 'type_2', name: 'Duplex', appliesTo: 'both', subcategories: ['3 BHK Duplex', '4 BHK Duplex'], enabled: true, isExample: true },
      { id: 'type_3', name: 'Plot', appliesTo: 'both', subcategories: ['Residential Plot', 'Commercial Plot'], enabled: true, isExample: true },
      { id: 'type_4', name: 'Apartment', appliesTo: 'both', subcategories: ['Penthouse', 'Studio', 'Standard'], enabled: true, isExample: true },
      { id: 'type_5', name: 'Commercial', appliesTo: 'both', subcategories: ['Office Space', 'Retail Shop'], enabled: true, isExample: true }
    ],
    statuses: [
      { id: 'stat_1', name: 'Available', appliesTo: 'property', badgeClass: 'available', enabled: true, isExample: true },
      { id: 'stat_2', name: 'Hold', appliesTo: 'property', badgeClass: 'hold', enabled: true, isExample: true },
      { id: 'stat_3', name: 'Sold', appliesTo: 'property', badgeClass: 'sold', enabled: true, isExample: true },
      { id: 'stat_4', name: 'Upcoming', appliesTo: 'project', badgeClass: 'upcoming', enabled: true, isExample: true },
      { id: 'stat_5', name: 'Ready', appliesTo: 'both', badgeClass: 'ready', enabled: true, isExample: true }
    ],
    priceCategories: [
      { id: 'pcat_1', name: 'Below ₹1 Cr', minPrice: 0, maxPrice: 9999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'pcat_2', name: 'Economical', minPrice: 10000000, maxPrice: 24999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'pcat_3', name: 'Mid-Premium', minPrice: 25000000, maxPrice: 49999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'pcat_4', name: 'Luxury', minPrice: 50000000, maxPrice: 99999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'pcat_5', name: 'Ultra Luxury', minPrice: 100000000, maxPrice: Infinity, appliesTo: 'both', enabled: true, isExample: true }
    ],
    budgetSlabs: [
      { id: 'slab_1', name: '₹1 Cr', minPrice: 0, maxPrice: 19999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'slab_2', name: '₹2 Cr', minPrice: 20000000, maxPrice: 29999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'slab_3', name: '₹3 Cr', minPrice: 30000000, maxPrice: 39999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'slab_4', name: '₹4 Cr', minPrice: 40000000, maxPrice: 49999999, appliesTo: 'both', enabled: true, isExample: true },
      { id: 'slab_5', name: '₹5 Cr+', minPrice: 50000000, maxPrice: Infinity, appliesTo: 'both', enabled: true, isExample: true }
    ],
    sortOptions: [
      { id: 'sort_1', name: 'Newest First', value: 'newest', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'sort_2', name: 'Oldest First', value: 'oldest', appliesTo: 'property', enabled: true, isExample: true },
      { id: 'sort_3', name: 'Price: Low to High', value: 'priceLow', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'sort_4', name: 'Price: High to Low', value: 'priceHigh', appliesTo: 'both', enabled: true, isExample: true },
      { id: 'sort_5', name: 'Name: A to Z', value: 'az', appliesTo: 'both', enabled: true, isExample: true }
    ],
    customFilters: [
      { id: 'cflt_1', name: 'Facing', appliesTo: 'both', options: ['East', 'North', 'West', 'South', 'North-East'], enabled: true, isExample: true },
      { id: 'cflt_2', name: 'BHK Configuration', appliesTo: 'both', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'], enabled: true, isExample: true },
      { id: 'cflt_3', name: 'Road Width', appliesTo: 'property', options: ['20 ft', '25 ft', '30 ft', '40 ft+'], enabled: true, isExample: true },
      { id: 'cflt_4', name: 'Possession Status', appliesTo: 'project', options: ['Ready', 'Under Construction', 'Immediate'], enabled: true, isExample: true },
      { id: 'cflt_5', name: 'Furnishing', appliesTo: 'both', options: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'], enabled: true, isExample: true }
    ],
    customFields: [
      {
        id: 'cf_floor_no',
        key: 'cf_floor_no',
        label: 'Floor Number',
        type: 'text',
        appliesTo: 'property',
        required: false,
        defaultValue: '',
        placeholder: 'e.g. 2nd Floor, Ground',
        options: [],
        order: 1,
        enabled: true,
        searchable: true,
        filterable: false,
        exportable: true,
        isExample: true
      },
      {
        id: 'cf_rera_id',
        key: 'cf_rera_id',
        label: 'RERA Registration No',
        type: 'text',
        appliesTo: 'both',
        required: false,
        defaultValue: '',
        placeholder: 'e.g. UKREP09260000123',
        options: [],
        order: 2,
        enabled: true,
        searchable: true,
        filterable: false,
        exportable: true,
        isExample: true
      },
      {
        id: 'cf_furnishing',
        key: 'cf_furnishing',
        label: 'Furnishing State',
        type: 'dropdown',
        appliesTo: 'both',
        required: false,
        defaultValue: 'Semi-Furnished',
        placeholder: 'Select furnishing status',
        options: ['Fully-Furnished', 'Semi-Furnished', 'Unfurnished', 'Bare Shell'],
        order: 3,
        enabled: true,
        searchable: true,
        filterable: true,
        exportable: true,
        isExample: true
      }
    ]
  };

  function hasActualUserDataOrConfig(passedCfg) {
    let hasProps = Array.isArray(global.data) && global.data.some(p => p && !p.isDemo);
    let hasDirect = Array.isArray(global.directData) && global.directData.some(p => p && !p.isDemo);
    let hasUpcoming = Array.isArray(global.upcomingData) && global.upcomingData.some(u => u && !u.isDemo);
    let demoCleared = false;
    try {
      if (typeof localStorage !== 'undefined') {
        demoCleared = localStorage.getItem(DEMO_CLEARED_KEY) === 'true';
        if (!hasProps) {
          let raw = localStorage.getItem(KEY);
          if (raw) {
            let parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.some(p => p && !p.isDemo)) hasProps = true;
          }
        }
        if (!hasDirect) {
          let raw = localStorage.getItem(DIRECT_KEY);
          if (raw) {
            let parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.some(p => p && !p.isDemo)) hasDirect = true;
          }
        }
        if (!hasUpcoming) {
          let raw = localStorage.getItem(UP_KEY);
          if (raw) {
            let parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.some(u => u && !u.isDemo)) hasUpcoming = true;
          }
        }
      }
    } catch (e) {}

    let hasCustomCfg = false;
    let cfg = passedCfg || (typeof global !== 'undefined' ? global.appConfig : null);
    if (!cfg) {
      try {
        if (typeof localStorage !== 'undefined') {
          let rawCfg = localStorage.getItem(CONFIG_KEY);
          if (rawCfg) cfg = JSON.parse(rawCfg);
        }
      } catch (e) {}
    }
    if (cfg && typeof cfg === 'object') {
      const catKeys = ['locations', 'types', 'statuses', 'priceCategories', 'budgetSlabs', 'sortOptions', 'customFilters', 'customFields'];
      for (const cat of catKeys) {
        if (Array.isArray(cfg[cat]) && cfg[cat].some(x => x && x.isExample === false)) {
          hasCustomCfg = true;
          break;
        }
      }
    }
    let hasDeleted = Array.isArray(cfg?.deletedIds) && cfg.deletedIds.length > 0;
    return !!(hasProps || hasDirect || hasUpcoming || demoCleared || hasCustomCfg || hasDeleted);
  }

  function syncConfigWithInventoryData(cfg) {
    if (!cfg || typeof cfg !== 'object') return cfg;
    let hasActual = hasActualUserDataOrConfig(cfg);
    if (!hasActual) return cfg;

    let propList = (Array.isArray(global.data) ? global.data : []).filter(p => p && !p.isDemo);
    let directList = (Array.isArray(global.directData) ? global.directData : []).filter(p => p && !p.isDemo);
    let upList = (Array.isArray(global.upcomingData) ? global.upcomingData : []).filter(u => u && !u.isDemo);
    let deletedIds = new Set(Array.isArray(cfg.deletedIds) ? cfg.deletedIds.map(x => String(x).trim().toLowerCase()) : []);

    // 1. Locations
    if (!Array.isArray(cfg.locations)) cfg.locations = [];
    let locMap = new Map();
    cfg.locations.forEach(l => {
      if (l && l.name) locMap.set(String(l.name).trim().toLowerCase(), l);
    });

    let inventoryLocs = new Map();
    propList.forEach(p => {
      if (p && p.location) {
        let k = String(p.location).trim();
        if (k) inventoryLocs.set(k.toLowerCase(), { name: k, module: 'property' });
      }
    });
    directList.forEach(p => {
      if (p && p.location) {
        let k = String(p.location).trim();
        if (k) {
          let ex = inventoryLocs.get(k.toLowerCase());
          inventoryLocs.set(k.toLowerCase(), { name: k, module: ex ? (ex.module !== 'direct' ? 'both' : 'direct') : 'direct' });
        }
      }
    });
    upList.forEach(u => {
      if (u && u.location) {
        let k = String(u.location).trim();
        if (k) {
          let ex = inventoryLocs.get(k.toLowerCase());
          inventoryLocs.set(k.toLowerCase(), { name: k, module: ex ? 'both' : 'project' });
        }
      }
    });

    inventoryLocs.forEach((info, norm) => {
      if (deletedIds.has(norm)) return;
      let existing = locMap.get(norm);
      if (existing) {
        existing.isExample = false;
      } else {
        let newLoc = {
          id: 'loc_dyn_' + Math.abs(norm.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36),
          name: info.name,
          appliesTo: info.module || 'both',
          enabled: true,
          isExample: false
        };
        cfg.locations.push(newLoc);
        locMap.set(norm, newLoc);
      }
    });

    if (hasActual) {
      cfg.locations = cfg.locations.filter(l => {
        if (!l) return false;
        if (l.isExample === false) return true;
        let norm = String(l.name || '').trim().toLowerCase();
        return inventoryLocs.has(norm);
      });
    }

    // 2. Types
    if (!Array.isArray(cfg.types)) cfg.types = [];
    let typeMap = new Map();
    cfg.types.forEach(t => {
      if (t && t.name) typeMap.set(String(t.name).trim().toLowerCase(), t);
    });

    let inventoryTypes = new Map();
    [...propList, ...directList].forEach(p => {
      if (p && p.type) {
        let k = String(p.type).trim();
        if (k) inventoryTypes.set(k.toLowerCase(), { name: k, module: 'property' });
      }
    });
    upList.forEach(u => {
      if (u && u.type) {
        let k = String(u.type).trim();
        if (k) {
          let ex = inventoryTypes.get(k.toLowerCase());
          inventoryTypes.set(k.toLowerCase(), { name: k, module: ex ? 'both' : 'project' });
        }
      }
    });

    inventoryTypes.forEach((info, norm) => {
      if (deletedIds.has(norm)) return;
      let existing = typeMap.get(norm);
      if (existing) {
        existing.isExample = false;
      } else {
        let newType = {
          id: 'type_dyn_' + Math.abs(norm.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36),
          name: info.name,
          appliesTo: info.module || 'both',
          subcategories: [],
          enabled: true,
          isExample: false
        };
        cfg.types.push(newType);
        typeMap.set(norm, newType);
      }
    });

    if (hasActual) {
      cfg.types = cfg.types.filter(t => {
        if (!t) return false;
        if (t.isExample === false) return true;
        let norm = String(t.name || '').trim().toLowerCase();
        return inventoryTypes.has(norm);
      });
    }

    // 3. Statuses
    if (!Array.isArray(cfg.statuses)) cfg.statuses = [];
    let statMap = new Map();
    cfg.statuses.forEach(s => {
      if (s && s.name) statMap.set(String(s.name).trim().toLowerCase(), s);
    });

    let inventoryStats = new Map();
    [...propList, ...directList, ...upList].forEach(p => {
      if (p && p.status) {
        let k = String(p.status).trim();
        if (k) inventoryStats.set(k.toLowerCase(), { name: k });
      }
    });

    inventoryStats.forEach((info, norm) => {
      if (deletedIds.has(norm)) return;
      let existing = statMap.get(norm);
      if (existing) {
        existing.isExample = false;
      } else {
        let newStat = {
          id: 'stat_dyn_' + Math.abs(norm.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36),
          name: info.name,
          appliesTo: 'both',
          badgeClass: norm.replace(/[^a-z0-9_-]/g, '-'),
          enabled: true,
          isExample: false
        };
        cfg.statuses.push(newStat);
        statMap.set(norm, newStat);
      }
    });

    if (hasActual) {
      const standardStatuses = new Set(['available', 'hold', 'sold', 'upcoming', 'ready']);
      cfg.statuses = cfg.statuses.filter(s => {
        if (!s) return false;
        if (s.isExample === false) return true;
        let norm = String(s.name || '').trim().toLowerCase();
        return inventoryStats.has(norm) || standardStatuses.has(norm);
      });
      cfg.statuses.forEach(s => { s.isExample = false; });
    }

    // 4. Custom Fields
    if (hasActual && Array.isArray(cfg.customFields)) {
      let allRecords = [...propList, ...directList, ...upList];
      cfg.customFields = cfg.customFields.filter(cf => {
        if (!cf) return false;
        if (cf.isExample === false) return true;
        let isUsed = allRecords.some(r => r && r.customFields && r.customFields[cf.key] != null && String(r.customFields[cf.key]).trim() !== '');
        return isUsed;
      });
      cfg.customFields.forEach(cf => { cf.isExample = false; });
    }

    // 5. Operational categories
    if (hasActual) {
      ['priceCategories', 'budgetSlabs', 'sortOptions', 'customFilters'].forEach(cat => {
        if (Array.isArray(cfg[cat])) {
          cfg[cat].forEach(item => { if (item) item.isExample = false; });
        }
      });
    }

    return cfg;
  }

  function reconcileConfigCategory(storedList, defaultList, deletedIds = new Set()) {
    if (!Array.isArray(storedList) || storedList.length === 0) {
      return JSON.parse(JSON.stringify(defaultList));
    }

    let result = [];
    let seenIds = new Set();
    let seenNames = new Set();
    let seenValues = new Set();
    let seenKeys = new Set();

    storedList.forEach(item => {
      if (!item || typeof item !== 'object') return;
      if (item.id) seenIds.add(item.id);
      if (item.key) seenKeys.add(item.key);
      if (item.name) seenNames.add(String(item.name).trim().toLowerCase());
      if (item.label) seenNames.add(String(item.label).trim().toLowerCase());
      if (item.value) seenValues.add(String(item.value).trim().toLowerCase());
      result.push(item);
    });

    let hasActual = hasActualUserDataOrConfig();
    if (hasActual) {
      return result;
    }

    defaultList.forEach((def, defIdx) => {
      let defNormName = (def.name || def.label || '').trim().toLowerCase();
      let defNormVal = (def.value || '').trim().toLowerCase();
      let hasMatch = false;

      if (def.id && seenIds.has(def.id)) {
        hasMatch = true;
      } else if (def.key && seenKeys.has(def.key)) {
        hasMatch = true;
      } else if (defNormName && seenNames.has(defNormName)) {
        hasMatch = true;
      } else if (defNormVal && seenValues.has(defNormVal)) {
        hasMatch = true;
      }

      if (!hasMatch && (!deletedIds.has(def.id) && !deletedIds.has(defNormName))) {
        let copy = JSON.parse(JSON.stringify(def));
        copy.isExample = true;
        if (defIdx < result.length) {
          result.splice(defIdx, 0, copy);
        } else {
          result.push(copy);
        }
        if (copy.id) seenIds.add(copy.id);
        if (copy.key) seenKeys.add(copy.key);
        if (defNormName) seenNames.add(defNormName);
        if (defNormVal) seenValues.add(defNormVal);
      }
    });

    return result;
  }

  function loadAppConfig() {
    let needsSave = false;
    let finalConfig = { ...defaultAppConfig, deletedIds: [] };

    try {
      let raw = localStorage.getItem(CONFIG_KEY);
      if (raw) {
        let parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          finalConfig.version = Math.max(Number(parsed.version) || 1, defaultAppConfig.version);
          let deletedIds = new Set(Array.isArray(parsed.deletedIds) ? parsed.deletedIds : []);
          finalConfig.deletedIds = Array.from(deletedIds);

          const catKeys = ['locations', 'types', 'statuses', 'priceCategories', 'budgetSlabs', 'sortOptions', 'customFilters', 'customFields'];
          catKeys.forEach(cat => {
            let storedList = parsed[cat];
            let defaultList = defaultAppConfig[cat] || [];
            let reconciled = reconcileConfigCategory(storedList, defaultList, deletedIds);
            finalConfig[cat] = reconciled;
            if (!Array.isArray(storedList) || storedList.length < defaultList.length) {
              needsSave = true;
            }
          });
        } else {
          needsSave = true;
        }
      } else {
        needsSave = true;
      }
    } catch (e) {
      finalConfig = JSON.parse(JSON.stringify(defaultAppConfig));
      needsSave = true;
    }

    finalConfig = syncConfigWithInventoryData(finalConfig);

    if (needsSave) {
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(finalConfig));
      } catch (e) {}
    }
    return finalConfig;
  }

  let appConfig = loadAppConfig();

  function saveAppConfig(cfg) {
    appConfig = cfg;
    global.appConfig = cfg;
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {}
    if (typeof global.populateAllConfigDropdowns === 'function') global.populateAllConfigDropdowns();
  }

  // DEFAULT PROPERTIES DEMO DATA
  const initial = [
    {
      name: 'Nature Crest — 3 BHK Duplex',
      location: 'Rajpur',
      type: 'Duplex',
      bhk: '3 BHK',
      area: 240,
      dim: '35 × 60',
      facing: 'East',
      road: '30 ft',
      price: 19000000,
      status: 'Available',
      owner: 'Amit Sharma',
      phone: '9876543210',
      follow: '2026-09-14',
      map: 'https://maps.google.com/?q=Rajpur+Dehradun',
      photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
      video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      notes: 'Premium 3 BHK duplex near Rajpur Road. Buyer site visit scheduled with family.',
      favorite: true,
      isDemo: true,
      created: '2026-09-01'
    },
    {
      name: 'Sinola Villa',
      location: 'Rajpur',
      type: 'Villa',
      bhk: '4 BHK',
      area: 420,
      dim: '50 × 75',
      facing: 'North',
      road: '40 ft',
      price: 32000000,
      status: 'Available',
      owner: 'RNP Realty',
      phone: '9800001122',
      follow: '2026-09-22',
      map: 'https://maps.google.com/?q=Sinola+Dehradun',
      photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
      video: '',
      notes: 'Independent 4 BHK villa with lush private lawn, servant quarters and scenic valley views.',
      favorite: false,
      isDemo: true,
      created: '2026-08-30'
    },
    {
      name: '5 BHK Villa Jakhan',
      location: 'Jakhan',
      type: 'Villa',
      bhk: '5 BHK',
      area: 500,
      dim: '60 × 80',
      facing: 'West',
      road: '30 ft',
      price: 45000000,
      status: 'Hold',
      owner: 'Orchid Sales',
      phone: '9877001100',
      follow: '2026-09-10',
      map: 'https://maps.google.com/?q=Jakhan+Dehradun',
      photo: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop&q=80',
      video: '',
      notes: 'Prime location on Jakhan main road. Hold for client awaiting bank loan sanction.',
      favorite: false,
      isDemo: true,
      created: '2026-08-28'
    },
    {
      name: '4 BHK Villa Johri Gaon',
      location: 'Johri Gaon',
      type: 'Villa',
      bhk: '4 BHK',
      area: 350,
      dim: '45 × 70',
      facing: 'South',
      road: '25 ft',
      price: 28000000,
      status: 'Available',
      owner: 'Pankaj Negi',
      phone: '9765432109',
      follow: '',
      map: 'https://maps.google.com/?q=Johri+Gaon+Dehradun',
      photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80',
      video: '',
      notes: 'Corner villa in quiet residential surroundings with mountain views and wide access road.',
      favorite: false,
      isDemo: true,
      created: '2026-08-27'
    },
    {
      name: 'Sarthak',
      location: 'Rajpur Mussoorie Road',
      type: 'Plot',
      bhk: '',
      area: 300,
      dim: '40 × 67',
      facing: 'East',
      road: '40 ft',
      price: 15000000,
      status: 'Sold',
      owner: 'Sarthak Properties',
      phone: '9876501234',
      follow: '',
      map: 'https://maps.google.com/?q=Rajpur+Mussoorie+Road',
      photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80',
      video: '',
      notes: 'Clear title residential plot with 40 ft road frontage. Registry completed.',
      favorite: true,
      isDemo: true,
      created: '2026-08-25'
    }
  ];

  // DEFAULT UPCOMING PROJECTS DEMO DATA
  const initialUpcoming = [
    {
      name: 'Himalayan Heights',
      developer: 'Himalayan Infra Group',
      location: 'Sahastradhara Road',
      type: 'Apartment',
      bhk: '2 & 3 BHK Luxury',
      area: '1450 - 1950 sq.ft',
      price: 18000000,
      maxPrice: 24000000,
      priceCategory: 'Economical',
      budgetSlab: '₹1 Cr',
      launchDate: 'Q4 2026',
      possessionDate: 'Dec 2028',
      status: 'Upcoming',
      owner: 'Sunil Verma',
      phone: '9811223344',
      map: 'https://maps.google.com/?q=Sahastradhara+Road+Dehradun',
      photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop&q=80',
      video: '',
      brochure: 'https://example.com/himalayan-heights.pdf',
      notes: 'Eco-friendly high-rise towers with panoramic Himalayan views, clubhouse, and badminton courts.',
      favorite: false,
      isDemo: true,
      created: '2026-09-05'
    },
    {
      name: 'Rajpur Valley Villas',
      developer: 'Pinecrest Developers',
      location: 'Rajpur',
      type: 'Villa',
      bhk: '4 & 5 BHK Estate Villas',
      area: '3200 - 4500 sq.ft',
      price: 55000000,
      maxPrice: 75000000,
      priceCategory: 'Luxury',
      budgetSlab: '₹5 Cr+',
      launchDate: 'Nov 2026',
      possessionDate: 'Mar 2029',
      status: 'Pre-Launch',
      owner: 'Amit Negi',
      phone: '9823456781',
      map: 'https://maps.google.com/?q=Rajpur+Dehradun',
      photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
      video: '',
      brochure: 'https://example.com/rajpur-villas.pdf',
      notes: 'Exclusive gated community of luxury mountain villas with private gardens, infinity pool, and club amenities.',
      favorite: true,
      isDemo: true,
      created: '2026-09-04'
    },
    {
      name: 'Jakhan Residency',
      developer: 'Imperial Infra Group',
      location: 'Jakhan',
      type: 'Apartment',
      bhk: '3 BHK Ultra Suites',
      area: '2100 sq.ft',
      price: 28000000,
      maxPrice: 35000000,
      priceCategory: 'Mid-Premium',
      budgetSlab: '₹2 Cr',
      launchDate: 'Sep 2026',
      possessionDate: 'June 2028',
      status: 'Launched',
      owner: 'Vikas Malhotra',
      phone: '9876541230',
      map: 'https://maps.google.com/?q=Jakhan+Dehradun',
      photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
      video: '',
      brochure: 'https://example.com/jakhan-residency.pdf',
      notes: 'Centrally located premium residences with smart home automation and multi-level parking.',
      favorite: false,
      isDemo: true,
      created: '2026-09-02'
    },
    {
      name: 'Mussoorie Road Township',
      developer: 'Earth & Wood Developers',
      location: 'Rajpur Mussoorie Road',
      type: 'Township',
      bhk: 'Plotted & 4 BHK Chalets',
      area: '250 - 500 yd²',
      price: 35000000,
      maxPrice: 60000000,
      priceCategory: 'Mid-Premium',
      budgetSlab: '₹3 Cr',
      launchDate: 'Jan 2027',
      possessionDate: 'Dec 2029',
      status: 'Upcoming',
      owner: 'Dheeraj Bansal',
      phone: '9871122334',
      map: 'https://maps.google.com/?q=Rajpur+Mussoorie+Road',
      photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80',
      video: '',
      brochure: 'https://example.com/mussoorie-township.pdf',
      notes: 'Integrated mountain-view township with shopping plaza, medical center, and international school nearby.',
      favorite: false,
      isDemo: true,
      created: '2026-08-28'
    },
    {
      name: 'Raipur Commercial Hub',
      developer: 'Aura Skylines Commercial',
      location: 'Raipur Road',
      type: 'Commercial',
      bhk: 'Office & Retail Spaces',
      area: '800 - 3500 sq.ft',
      price: 22000000,
      maxPrice: 48000000,
      priceCategory: 'Economical',
      budgetSlab: '₹2 Cr',
      launchDate: 'Aug 2026',
      possessionDate: 'Mid 2028',
      status: 'Upcoming',
      owner: 'Karan Anand',
      phone: '9810998877',
      map: 'https://maps.google.com/?q=Raipur+Road+Dehradun',
      photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80',
      video: '',
      brochure: 'https://example.com/raipur-hub.pdf',
      notes: 'State-of-the-art grade A commercial tower with high footfall retail frontage on main Raipur road.',
      favorite: false,
      isDemo: true,
      created: '2026-08-20'
    }
  ];

  // DEFAULT DIRECT PROPERTY DEMO DATA
  const initialDirect = [
    {
      id: 'dp_1',
      name: 'Green Valley Direct Villa',
      location: 'Sahastradhara Road',
      type: 'Villa',
      bhk: '4 BHK',
      area: 320,
      dim: '40 × 72',
      facing: 'North-East',
      road: '30 ft',
      price: 24000000,
      status: 'Available',
      owner: 'Rajeev (Direct Owner)',
      phone: '9899002233',
      follow: '2026-09-18',
      map: 'https://maps.google.com/?q=Sahastradhara+Road+Dehradun',
      photo: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
      video: '',
      notes: 'Direct client sourcing from owner Rajeev. Clear freehold title, corner plot with mountain views.',
      favorite: false,
      isDirect: true,
      source: 'direct',
      isDemo: true,
      created: '2026-09-02'
    },
    {
      id: 'dp_2',
      name: 'Premium Rajpur Direct Plot',
      location: 'Rajpur',
      type: 'Plot',
      bhk: '',
      area: 250,
      dim: '30 × 75',
      facing: 'East',
      road: '40 ft',
      price: 12500000,
      status: 'Available',
      owner: 'Mohit Verma (Client)',
      phone: '9810004455',
      follow: '',
      map: 'https://maps.google.com/?q=Rajpur+Dehradun',
      photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
      video: '',
      notes: 'Direct from owner. Prime freehold residential plot on main Rajpur axis with clean documentation.',
      favorite: true,
      isDirect: true,
      source: 'direct',
      isDemo: true,
      created: '2026-09-04'
    },
    {
      id: 'dp_3',
      name: 'Jakhan Heights Direct Apartment',
      location: 'Jakhan',
      type: 'Apartment',
      bhk: '3 BHK',
      area: 190,
      dim: '30 × 57',
      facing: 'North',
      road: '30 ft',
      price: 13500000,
      status: 'Hold',
      owner: 'Neha Kapoor (Owner)',
      phone: '9822007788',
      follow: '2026-09-13',
      map: 'https://maps.google.com/?q=Jakhan+Dehradun',
      photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
      video: '',
      notes: 'Direct exclusive mandate from owner Neha Kapoor. Buyer discussion scheduled for today.',
      favorite: false,
      isDirect: true,
      source: 'direct',
      isDemo: true,
      created: '2026-09-06'
    },
    {
      id: 'dp_4',
      name: 'Pacific View Direct Duplex',
      location: 'Dehradun Central',
      type: 'Duplex',
      bhk: '4 BHK',
      area: 290,
      dim: '35 × 75',
      facing: 'West',
      road: '25 ft',
      price: 27500000,
      status: 'Available',
      owner: 'Vikram Singh (Client)',
      phone: '9876003344',
      follow: '',
      map: 'https://maps.google.com/?q=Dehradun',
      photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      video: '',
      notes: 'Direct client listing. Luxury modern duplex with Italian marble flooring, 2 covered car parks.',
      favorite: false,
      isDirect: true,
      source: 'direct',
      isDemo: true,
      created: '2026-09-07'
    },
    {
      id: 'dp_5',
      name: 'Direct Commercial Space',
      location: 'Raipur Road',
      type: 'Commercial',
      bhk: '',
      area: 350,
      dim: '45 × 70',
      facing: 'South',
      road: '60 ft',
      price: 38000000,
      status: 'Available',
      owner: 'Suresh Mehta (Direct Client)',
      phone: '9866002211',
      follow: '',
      map: 'https://maps.google.com/?q=Raipur+Road+Dehradun',
      photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
      video: '',
      notes: 'Prime commercial frontage on main Raipur Road. Direct exclusive sourcing from owner Suresh Mehta.',
      favorite: true,
      isDirect: true,
      source: 'direct',
      isDemo: true,
      created: '2026-09-09'
    }
  ];

  // PRICE CATEGORIES & BUDGET SLABS
  function getPriceCategory(price) {
    let p = Number(price) || 0;
    if (typeof appConfig !== 'undefined' && appConfig && Array.isArray(appConfig.priceCategories)) {
      let enabledCats = appConfig.priceCategories.filter(x => x.enabled);
      if (enabledCats.length) {
        let match = enabledCats.find(c => {
          let min = Number(c.minPrice) || 0;
          let max = (c.maxPrice == null || c.maxPrice === '' || c.maxPrice === Infinity) ? Infinity : Number(c.maxPrice);
          return p >= min && p <= max;
        });
        if (match) return match.name;
      }
    }
    if (p >= 50000000) return 'Luxury';
    if (p >= 25000000) return 'Mid-Premium';
    if (p >= 10000000) return 'Economical';
    return 'Below ₹1 Cr';
  }

  function getBudgetSlab(price) {
    let p = Number(price) || 0;
    if (typeof appConfig !== 'undefined' && appConfig && Array.isArray(appConfig.budgetSlabs)) {
      let enabledSlabs = appConfig.budgetSlabs.filter(x => x.enabled);
      if (enabledSlabs.length) {
        let match = enabledSlabs.find(s => {
          let min = Number(s.minPrice) || 0;
          let max = (s.maxPrice == null || s.maxPrice === '' || s.maxPrice === Infinity) ? Infinity : Number(s.maxPrice);
          return p >= min && p <= max;
        });
        if (match) return match.name;
      }
    }
    let cr = p / 10000000;
    if (cr >= 5) return '₹5 Cr+';
    if (cr >= 4) return '₹4 Cr';
    if (cr >= 3) return '₹3 Cr';
    if (cr >= 2) return '₹2 Cr';
    if (cr >= 1) return '₹1 Cr';
    return 'Below ₹1 Cr';
  }

  function getPropertyCategory(price) {
    return getPriceCategory(price);
  }

  function getPropertyBudgetSlab(price) {
    return getBudgetSlab(price);
  }

  function matchRecordPriceCategory(price, catName) {
    if (!catName) return true;
    let p = Number(price) || 0;
    let cfg = (typeof appConfig !== 'undefined' && appConfig) ? appConfig : defaultAppConfig;
    let target = String(catName).trim().toLowerCase();
    let catObj = (cfg.priceCategories || []).find(c => String(c.name || '').trim().toLowerCase() === target);
    if (catObj) {
      let min = (catObj.minPrice != null && catObj.minPrice !== '') ? Number(catObj.minPrice) : 0;
      let max = (catObj.maxPrice == null || catObj.maxPrice === '' || catObj.maxPrice === Infinity) ? Infinity : Number(catObj.maxPrice);
      return p >= min && p <= max;
    }
    return String(getPriceCategory(p)).trim().toLowerCase() === target;
  }

  function matchRecordBudgetSlab(price, slabName) {
    if (!slabName) return true;
    let p = Number(price) || 0;
    let cfg = (typeof appConfig !== 'undefined' && appConfig) ? appConfig : defaultAppConfig;
    let target = String(slabName).trim().toLowerCase();
    let slabObj = (cfg.budgetSlabs || []).find(s => String(s.name || '').trim().toLowerCase() === target);
    if (slabObj) {
      let min = (slabObj.minPrice != null && slabObj.minPrice !== '') ? Number(slabObj.minPrice) : 0;
      let max = (slabObj.maxPrice == null || slabObj.maxPrice === '' || slabObj.maxPrice === Infinity) ? Infinity : Number(slabObj.maxPrice);
      return p >= min && p <= max;
    }
    return String(getBudgetSlab(p)).trim().toLowerCase() === target;
  }

  // SCHEMA RECORD NORMALIZERS
  function normalizeCustomFields(cfObj) {
    let result = {};
    if (cfObj && typeof cfObj === 'object' && !Array.isArray(cfObj)) {
      for (const [k, v] of Object.entries(cfObj)) {
        if (v !== undefined && v !== null) {
          result[k] = v;
        }
      }
    }
    return result;
  }

  function normalizeProperty(p) {
    if (!p || typeof p !== 'object') p = {};
    let price = Number(p.price) || 0;
    let areaUnit = (p.areaUnit === 'sqft' || p.areaUnit === 'sqmtr' || p.areaUnit === 'sqyard') ? p.areaUnit : 'sqyard';
    let dimensionUnit = (p.dimensionUnit === 'ft' || p.dimensionUnit === 'meter' || p.dimensionUnit === 'yard') ? p.dimensionUnit : 'yard';
    let dimVal = String(p.dim || p.dimensions || '').trim();

    return {
      id: String(p.id || ('p' + Date.now())),
      name: String(p.name || 'Unnamed Property').trim(),
      location: String(p.location || '').trim(),
      type: String(p.type || 'Villa').trim(),
      bhk: String(p.bhk || '').trim(),
      area: Number(p.area) || 0,
      areaUnit: areaUnit,
      dim: dimVal,
      dimensions: dimVal,
      dimensionUnit: dimensionUnit,
      facing: String(p.facing || '').trim(),
      road: String(p.road || '').trim(),
      price: price,
      priceCategory: getPropertyCategory(price),
      budgetSlab: getPropertyBudgetSlab(price),
      status: String(p.status || 'Available').trim(),
      owner: String(p.owner || '').trim(),
      phone: String(p.phone || '').trim(),
      follow: String(p.follow || '').trim(),
      map: global.safeUrl ? global.safeUrl(p.map) : String(p.map || ''),
      photo: String(p.photo || '').trim(),
      video: global.safeUrl ? global.safeUrl(p.video) : String(p.video || ''),
      notes: String(p.notes || '').trim(),
      favorite: !!p.favorite,
      isDirect: false,
      source: String(p.source || 'company'),
      isDemo: !!p.isDemo,
      created: String(p.created || new Date().toISOString().slice(0, 10)),
      importBatchId: p.importBatchId || null,
      customFields: normalizeCustomFields(p.customFields)
    };
  }

  function normalizeDirectProperty(dp) {
    let norm = normalizeProperty(dp);
    norm.isDirect = true;
    norm.source = 'direct';
    if (!norm.id || norm.id.startsWith('p')) norm.id = norm.id.replace(/^p/, 'dp_');
    return norm;
  }

  function normalizeUpcoming(u) {
    if (!u || typeof u !== 'object') u = {};
    let price = Number(u.price) || 0;
    let maxPrice = Number(u.maxPrice) || 0;

    return {
      id: String(u.id || ('up' + Date.now())),
      name: String(u.name || 'Unnamed Project').trim(),
      developer: String(u.developer || '').trim(),
      location: String(u.location || '').trim(),
      type: String(u.type || 'Apartment').trim(),
      bhk: String(u.bhk || '').trim(),
      area: String(u.area || '').trim(),
      price: price,
      maxPrice: maxPrice,
      priceCategory: getPriceCategory(price),
      budgetSlab: getBudgetSlab(price),
      launchDate: String(u.launchDate || '').trim(),
      possessionDate: String(u.possessionDate || '').trim(),
      status: String(u.status || 'Upcoming').trim(),
      owner: String(u.owner || '').trim(),
      phone: String(u.phone || '').trim(),
      map: global.safeUrl ? global.safeUrl(u.map) : String(u.map || ''),
      photo: String(u.photo || '').trim(),
      video: global.safeUrl ? global.safeUrl(u.video) : String(u.video || ''),
      brochure: global.safeUrl ? global.safeUrl(u.brochure) : String(u.brochure || ''),
      notes: String(u.notes || '').trim(),
      favorite: !!u.favorite,
      isDemo: !!u.isDemo,
      created: String(u.created || new Date().toISOString().slice(0, 10)),
      importBatchId: u.importBatchId || null,
      customFields: normalizeCustomFields(u.customFields)
    };
  }

  function sortRecords(list, sortByVal) {
    let sortKey = sortByVal || 'new';
    return (list || []).slice().sort((x, y) => {
      if (sortKey === 'az') return String(x.name || '').localeCompare(String(y.name || ''));
      if (sortKey === 'za') return String(y.name || '').localeCompare(String(x.name || ''));
      if (sortKey === 'priceLow') return (Number(x.price) || 0) - (Number(y.price) || 0);
      if (sortKey === 'priceHigh') return (Number(y.price) || 0) - (Number(x.price) || 0);
      if (sortKey === 'areaHigh') return (Number(x.area) || 0) - (Number(y.area) || 0);
      if (sortKey === 'old' || sortKey === 'oldest') return String(x.created || x.id || '').localeCompare(String(y.created || y.id || ''));
      return String(y.created || y.id || '').localeCompare(String(x.created || x.id || ''));
    });
  }

  // DEMO DATA RECONCILIATION & LOADING
  function reconcileDemoData() {
    try {
      let demoCleared = false;
      try { demoCleared = localStorage.getItem(DEMO_CLEARED_KEY) === 'true'; } catch (e) {}
      if (demoCleared) return;

      let migrated = false;
      try { migrated = localStorage.getItem(DEMO_VERSION_KEY) === '2'; } catch (e) {}
      if (migrated) return;

      let oldDemoNames = new Set([
        'nature crest - 3 bhk duplex', 'sinola villa', '5 bhk villa jakhan', '4 bhk villa johri gao',
        'sarthak', 'narula', 'kochar colony', 'pacific hills', '6 bhk duplex near mb homes',
        'r.n.p', 'orchid', 'kala gao', 'drone vatika', 'vishwanath enclave', 'tanishq vihar',
        'ghati valley', 'central park', 'krishna palm', 'mount crest', 'orchid park', 'supriya',
        'aarunya', 'bima vihar', 'shipra vihar', 'doon divine', '117 gaj raipur road', '199 gaj raipur road'
      ]);

      let oldDirectNames = new Set([
        'rajpur green view villa', 'jakhan main road commercial plot', 'canal road luxury penthouse'
      ]);

      let oldUpcomingNames = new Set([
        'greenwood valley towers', 'sinola hills enclave', 'the grand pine residences',
        'imperial signature estates', 'skyline opus heights', 'the sovereign mansions',
        'aura celestial towers', 'forest hills reserve'
      ]);

      // 1. Properties
      let storedProps = [];
      try { storedProps = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
      let userProps = Array.isArray(storedProps)
        ? storedProps.filter(p => p && p.name && !oldDemoNames.has(String(p.name).trim().toLowerCase()))
        : [];
      let seededProps = initial.map((p, i) => ({
        ...p,
        id: 'p' + (i + 1),
        isDemo: true,
        priceCategory: getPropertyCategory(p.price),
        budgetSlab: getPropertyBudgetSlab(p.price)
      }));
      let finalProps = [...seededProps, ...userProps];
      try { localStorage.setItem(KEY, JSON.stringify(finalProps)); } catch (e) {}

      // 2. Direct Properties
      let storedDirect = [];
      try { storedDirect = JSON.parse(localStorage.getItem(DIRECT_KEY)) || []; } catch (e) {}
      let userDirect = Array.isArray(storedDirect)
        ? storedDirect.filter(p => p && p.name && !oldDirectNames.has(String(p.name).trim().toLowerCase()))
        : [];
      let seededDirect = initialDirect.map(p => ({
        ...p,
        isDemo: true,
        priceCategory: getPropertyCategory(p.price),
        budgetSlab: getPropertyBudgetSlab(p.price),
        isDirect: true,
        source: 'direct'
      }));
      let finalDirect = [...seededDirect, ...userDirect];
      try { localStorage.setItem(DIRECT_KEY, JSON.stringify(finalDirect)); } catch (e) {}

      // 3. Upcoming Projects
      let storedUp = [];
      try { storedUp = JSON.parse(localStorage.getItem(UP_KEY)) || []; } catch (e) {}
      let userUp = Array.isArray(storedUp)
        ? storedUp.filter(p => p && p.name && !oldUpcomingNames.has(String(p.name).trim().toLowerCase()))
        : [];
      let seededUp = initialUpcoming.map((p, i) => ({
        ...p,
        id: p.id || ('up' + (i + 1)),
        isDemo: true,
        priceCategory: getPriceCategory(p.price),
        budgetSlab: getBudgetSlab(p.price),
        favorite: p.favorite || false
      }));
      let finalUp = [...seededUp, ...userUp];
      try { localStorage.setItem(UP_KEY, JSON.stringify(finalUp)); } catch (e) {}

      try { localStorage.setItem(DEMO_VERSION_KEY, '2'); } catch (e) {}
    } catch (err) {
      console.error('Demo data reconciliation error:', err);
    }
  }

  function loadInitialProperties() {
    reconcileDemoData();
    try {
      let x = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(x) && x.length) return x;
    } catch (e) {}
    let demoCleared = false;
    try { demoCleared = localStorage.getItem(DEMO_CLEARED_KEY) === 'true'; } catch (e) {}
    if (demoCleared) return [];
    return initial.map((p, i) => ({
      ...p,
      id: 'p' + (i + 1),
      isDemo: true,
      priceCategory: getPropertyCategory(p.price),
      budgetSlab: getPropertyBudgetSlab(p.price)
    }));
  }

  function loadInitialUpcoming() {
    reconcileDemoData();
    try {
      let x = JSON.parse(localStorage.getItem(UP_KEY));
      if (Array.isArray(x) && x.length) return x;
    } catch (e) {}
    let demoCleared = false;
    try { demoCleared = localStorage.getItem(DEMO_CLEARED_KEY) === 'true'; } catch (e) {}
    if (demoCleared) return [];
    return initialUpcoming.map((p, i) => ({
      ...p,
      id: 'up' + (i + 1),
      isDemo: true,
      priceCategory: getPriceCategory(p.price),
      budgetSlab: getBudgetSlab(p.price),
      favorite: p.favorite || false
    }));
  }

  function loadInitialDirectProperties() {
    reconcileDemoData();
    try {
      let x = JSON.parse(localStorage.getItem(DIRECT_KEY));
      if (Array.isArray(x) && x.length) return x;
    } catch (e) {}
    let demoCleared = false;
    try { demoCleared = localStorage.getItem(DEMO_CLEARED_KEY) === 'true'; } catch (e) {}
    if (demoCleared) return [];
    return initialDirect.map(p => ({
      ...p,
      isDemo: true,
      priceCategory: getPropertyCategory(p.price),
      budgetSlab: getPropertyBudgetSlab(p.price),
      isDirect: true,
      source: 'direct'
    }));
  }

  let data = loadInitialProperties();
  let upcomingData = loadInitialUpcoming();
  let directData = loadInitialDirectProperties();

  function markExistingDemoRecords() {
    let demoCleared = false;
    try { demoCleared = localStorage.getItem(DEMO_CLEARED_KEY) === 'true'; } catch (e) {}
    if (demoCleared) return;

    const demoPropNames = new Set(initial.map(p => p.name.trim().toLowerCase()));
    const demoDirectNames = new Set(initialDirect.map(p => p.name.trim().toLowerCase()));
    const demoUpNames = new Set(initialUpcoming.map(p => p.name.trim().toLowerCase()));

    if (Array.isArray(data)) {
      data.forEach(p => {
        if (p && p.isDemo === undefined && demoPropNames.has(String(p.name || '').trim().toLowerCase())) {
          p.isDemo = true;
        }
      });
    }
    if (typeof directData !== 'undefined' && Array.isArray(directData)) {
      directData.forEach(p => {
        if (p && p.isDemo === undefined && demoDirectNames.has(String(p.name || '').trim().toLowerCase())) {
          p.isDemo = true;
        }
      });
    }
    if (Array.isArray(upcomingData)) {
      upcomingData.forEach(u => {
        if (u && u.isDemo === undefined && demoUpNames.has(String(u.name || '').trim().toLowerCase())) {
          u.isDemo = true;
        }
      });
    }
  }
  markExistingDemoRecords();

  function clearDemoDataIfNeeded() {
    let hadDemo = false;
    if (Array.isArray(data) && data.some(p => p && p.isDemo === true)) {
      data = data.filter(p => !p || p.isDemo !== true);
      hadDemo = true;
      if (typeof global.save === 'function') global.save();
    }
    if (typeof directData !== 'undefined' && Array.isArray(directData) && directData.some(p => p && p.isDemo === true)) {
      directData = directData.filter(p => !p || p.isDemo !== true);
      hadDemo = true;
      if (typeof global.saveDirect === 'function') global.saveDirect();
    }
    if (Array.isArray(upcomingData) && upcomingData.some(u => u && u.isDemo === true)) {
      upcomingData = upcomingData.filter(u => !u || u.isDemo !== true);
      hadDemo = true;
      if (typeof global.saveUpcoming === 'function') global.saveUpcoming();
    }
    try {
      localStorage.setItem(DEMO_CLEARED_KEY, 'true');
    } catch (e) {}
    return hadDemo;
  }

  // PROFILE STATE & STORAGE
  const defaultProfile = {
    name: 'Munendra Singh',
    role: 'Property Manager',
    phone: '+91 98765 43210',
    email: 'munendra.singh@propertypro.com',
    company: 'Property Pro Real Estate',
    photo: ''
  };

  function loadProfile() {
    try {
      let x = JSON.parse(localStorage.getItem(PROFILE_KEY));
      if (x && typeof x === 'object') return { ...defaultProfile, ...x };
    } catch (e) {}
    return { ...defaultProfile };
  }

  function saveProfile(p) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch (e) {}
    if (typeof global.dbSaveProfile === 'function') global.dbSaveProfile(p);
  }

  function isProfileSetupCompleted() {
    try {
      if (localStorage.getItem(PROFILE_SETUP_KEY) === 'true') return true;
      let raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        let p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          if (p.setupCompleted === true) return true;
          if (p.name && typeof p.name === 'string' && p.name.trim().length > 0) {
            return true;
          }
        }
      }
    } catch (e) {}
    return false;
  }

  let currentProfile = loadProfile();
  let profileTempPhoto = '';
  let setupTempPhoto = '';

  function updateProfileAvatars() {
    let p = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile : (typeof loadProfile === 'function' ? loadProfile() : null);
    if (!p) return;
    let hasPhoto = p.photo && typeof p.photo === 'string' && p.photo.trim().length > 0;
    let safePhoto = hasPhoto ? String(p.photo).replace(/["<>]/g, '') : '';
    let safeName = String(p.name || 'Profile').replace(/["<>]/g, '');
    let avatarImgHtml = hasPhoto
      ? `<img src="${safePhoto}" alt="${safeName}" onerror="this.onerror=null;this.parentElement.innerHTML='👤'">`
      : '👤';

    let dashAvatar = document.getElementById('dashProfileAvatar');
    if (dashAvatar) dashAvatar.innerHTML = avatarImgHtml;

    let topAvatar = document.getElementById('topProfileAvatar');
    if (topAvatar) topAvatar.innerHTML = avatarImgHtml;

    let mainAvatar = document.getElementById('profileAvatar');
    if (mainAvatar) mainAvatar.innerHTML = avatarImgHtml;
  }

  // Export to global scope
  global.KEY = KEY;
  global.UP_KEY = UP_KEY;
  global.DIRECT_KEY = DIRECT_KEY;
  global.CONFIG_KEY = CONFIG_KEY;
  global.HISTORY_KEY = HISTORY_KEY;
  global.PROFILE_KEY = PROFILE_KEY;
  global.PROFILE_SETUP_KEY = PROFILE_SETUP_KEY;
  global.DEMO_VERSION_KEY = DEMO_VERSION_KEY;
  global.DEMO_CLEARED_KEY = DEMO_CLEARED_KEY;
  global.RETENTION_MS = RETENTION_MS;
  global.defaultAppConfig = defaultAppConfig;
  global.reconcileConfigCategory = reconcileConfigCategory;
  global.loadAppConfig = loadAppConfig;
  global.appConfig = appConfig;
  global.saveAppConfig = saveAppConfig;
  global.hasActualUserDataOrConfig = hasActualUserDataOrConfig;
  global.syncConfigWithInventoryData = syncConfigWithInventoryData;
  global.initial = initial;
  global.initialUpcoming = initialUpcoming;
  global.initialDirect = initialDirect;
  global.getPriceCategory = getPriceCategory;
  global.getBudgetSlab = getBudgetSlab;
  global.getPropertyCategory = getPropertyCategory;
  global.getPropertyBudgetSlab = getPropertyBudgetSlab;
  global.matchRecordPriceCategory = matchRecordPriceCategory;
  global.matchRecordBudgetSlab = matchRecordBudgetSlab;
  global.normalizeCustomFields = normalizeCustomFields;
  global.normalizeProperty = normalizeProperty;
  global.normalizeDirectProperty = normalizeDirectProperty;
  global.normalizeUpcoming = normalizeUpcoming;
  global.sortRecords = sortRecords;
  global.reconcileDemoData = reconcileDemoData;
  global.loadInitialProperties = loadInitialProperties;
  global.loadInitialUpcoming = loadInitialUpcoming;
  global.loadInitialDirectProperties = loadInitialDirectProperties;
  global.data = data;
  global.upcomingData = upcomingData;
  global.directData = directData;
  global.markExistingDemoRecords = markExistingDemoRecords;
  global.clearDemoDataIfNeeded = clearDemoDataIfNeeded;
  global.defaultProfile = defaultProfile;
  global.loadProfile = loadProfile;
  global.saveProfile = saveProfile;
  global.isProfileSetupCompleted = isProfileSetupCompleted;
  global.currentProfile = currentProfile;
  global.profileTempPhoto = profileTempPhoto;
  global.setupTempPhoto = setupTempPhoto;
  global.updateProfileAvatars = updateProfileAvatars;

})(typeof window !== 'undefined' ? window : globalThis);
