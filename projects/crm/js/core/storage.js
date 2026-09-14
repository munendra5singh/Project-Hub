/**
 * PROPERTY MANAGER PRO — STORAGE ENGINE
 * =====================================
 * IndexedDB (primary source of truth) & LocalStorage (fast offline cache) dual sync.
 */

(function(global) {
  'use strict';

  const DB_NAME = 'PropertyManagerProDB';
  const DB_VERSION = 3;
  let db = null;
  let isStorageReady = false;

  /**
   * Opens or upgrades IndexedDB with required object stores.
   */
  function openDB() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not supported, using localStorage fallback.');
        return resolve(null);
      }
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const dbInstance = e.target.result;
          if (!dbInstance.objectStoreNames.contains('properties')) {
            dbInstance.createObjectStore('properties', { keyPath: 'id' });
          }
          if (!dbInstance.objectStoreNames.contains('upcoming_projects')) {
            dbInstance.createObjectStore('upcoming_projects', { keyPath: 'id' });
          }
          if (!dbInstance.objectStoreNames.contains('direct_properties')) {
            dbInstance.createObjectStore('direct_properties', { keyPath: 'id' });
          }
          if (!dbInstance.objectStoreNames.contains('profile')) {
            dbInstance.createObjectStore('profile', { keyPath: 'id' });
          }
          if (!dbInstance.objectStoreNames.contains('config')) {
            dbInstance.createObjectStore('config', { keyPath: 'id' });
          }
          if (!dbInstance.objectStoreNames.contains('history')) {
            dbInstance.createObjectStore('history', { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => {
          console.warn('IndexedDB open error:', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB error:', err);
        resolve(null);
      }
    });
  }

  function dbSaveProfile(p) {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('profile')) return resolve(false);
      try {
        const tx = db.transaction('profile', 'readwrite');
        const store = tx.objectStore('profile');
        store.put({ id: 'current', ...p });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  function dbGetProfile() {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('profile')) return resolve(null);
      try {
        const tx = db.transaction('profile', 'readonly');
        const store = tx.objectStore('profile');
        const req = store.get('current');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  function dbSaveConfig(cfg) {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('config')) return resolve(false);
      try {
        const tx = db.transaction('config', 'readwrite');
        const store = tx.objectStore('config');
        store.put({ id: 'app_config', ...cfg });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  function dbGetConfig() {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('config')) return resolve(null);
      try {
        const tx = db.transaction('config', 'readonly');
        const store = tx.objectStore('config');
        const req = store.get('app_config');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  function dbSaveHistory(hist) {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('history')) return resolve(false);
      try {
        const tx = db.transaction('history', 'readwrite');
        const store = tx.objectStore('history');
        store.put({ id: 'app_history', ...hist });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  function dbGetHistory() {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains('history')) return resolve(null);
      try {
        const tx = db.transaction('history', 'readonly');
        const store = tx.objectStore('history');
        const req = store.get('app_history');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  function dbGetAll(storeName) {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains(storeName)) return resolve(null);
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  function dbSaveAll(storeName, items) {
    return new Promise((resolve) => {
      if (!db || !db.objectStoreNames || !db.objectStoreNames.contains(storeName)) return resolve(false);
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        for (const item of items) {
          if (item && item.id) {
            store.put(item);
          }
        }
        tx.oncomplete = () => resolve(true);
        tx.onerror = (err) => {
          console.warn(`IndexedDB write error for ${storeName}:`, err);
          resolve(false);
        };
      } catch (err) {
        console.warn(`IndexedDB tx error for ${storeName}:`, err);
        resolve(false);
      }
    });
  }

  /**
   * Persists Company Properties to IndexedDB and LocalStorage.
   */
  function save() {
    if (db && isStorageReady && typeof dbSaveAll === 'function') {
      dbSaveAll('properties', global.data || []);
    }
    try {
      localStorage.setItem(global.KEY || 'property_manager_pro_v2', JSON.stringify(global.data || []));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, data safely kept in IndexedDB:', e);
    }
  }

  /**
   * Persists Upcoming Projects to IndexedDB and LocalStorage.
   */
  function saveUpcoming() {
    if (db && isStorageReady && typeof dbSaveAll === 'function') {
      dbSaveAll('upcoming_projects', global.upcomingData || []);
    }
    try {
      localStorage.setItem(global.UP_KEY || 'property_manager_pro_v2_upcoming', JSON.stringify(global.upcomingData || []));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, data safely kept in IndexedDB:', e);
    }
  }

  /**
   * Persists Direct Properties to IndexedDB and LocalStorage.
   */
  function saveDirect() {
    if (db && isStorageReady && typeof dbSaveAll === 'function') {
      dbSaveAll('direct_properties', global.directData || []);
    }
    try {
      localStorage.setItem(global.DIRECT_KEY || 'property_manager_pro_direct_v1', JSON.stringify(global.directData || []));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, data safely kept in IndexedDB:', e);
    }
  }

  /**
   * Initializes IndexedDB & LocalStorage sync.
   */
  async function initStorage() {
    try {
      db = await openDB();
      let demoCleared = false;
      try { demoCleared = localStorage.getItem(global.DEMO_CLEARED_KEY || 'pm_pro_demo_cleared') === 'true'; } catch (e) {}

      if (db) {
        // Load or sync config from IndexedDB
        let dbCfg = await dbGetConfig();
        if (dbCfg && typeof dbCfg === 'object') {
          delete dbCfg.id;
          global.appConfig = { ...(global.defaultAppConfig || {}), ...dbCfg };
          try { localStorage.setItem(global.CONFIG_KEY || 'pm_pro_config_v1', JSON.stringify(global.appConfig)); } catch (e) {}
        } else if (global.appConfig) {
          await dbSaveConfig(global.appConfig);
        }

        // 1. Properties
        let dbProps = await dbGetAll('properties');
        if (Array.isArray(dbProps) && dbProps.length > 0) {
          global.data = dbProps.map(p => typeof global.normalizeProperty === 'function' ? global.normalizeProperty(p) : p);
        } else {
          let localProps = null;
          try { localProps = JSON.parse(localStorage.getItem(global.KEY || 'property_manager_pro_v2')); } catch (e) {}
          if (Array.isArray(localProps) && localProps.length > 0) {
            global.data = localProps.map(p => typeof global.normalizeProperty === 'function' ? global.normalizeProperty(p) : p);
          } else if (!demoCleared && Array.isArray(global.initial)) {
            global.data = global.initial.map((p, i) => typeof global.normalizeProperty === 'function' ? global.normalizeProperty({
              ...p,
              id: 'p' + (i + 1),
              isDemo: true
            }) : p);
          } else {
            global.data = [];
          }
          await dbSaveAll('properties', global.data);
        }

        // 2. Direct Properties
        let dbDirect = await dbGetAll('direct_properties');
        if (Array.isArray(dbDirect) && dbDirect.length > 0) {
          global.directData = dbDirect.map(dp => typeof global.normalizeDirectProperty === 'function' ? global.normalizeDirectProperty(dp) : dp);
        } else {
          let localDirect = null;
          try { localDirect = JSON.parse(localStorage.getItem(global.DIRECT_KEY || 'property_manager_pro_direct_v1')); } catch (e) {}
          if (Array.isArray(localDirect) && localDirect.length > 0) {
            global.directData = localDirect.map(dp => typeof global.normalizeDirectProperty === 'function' ? global.normalizeDirectProperty(dp) : dp);
          } else if (!demoCleared && Array.isArray(global.initialDirect)) {
            global.directData = global.initialDirect.map(dp => typeof global.normalizeDirectProperty === 'function' ? global.normalizeDirectProperty({
              ...dp,
              isDemo: true,
              isDirect: true,
              source: 'direct'
            }) : dp);
          } else {
            global.directData = [];
          }
          await dbSaveAll('direct_properties', global.directData);
        }

        // 3. Upcoming Projects
        let dbUpcoming = await dbGetAll('upcoming_projects');
        if (Array.isArray(dbUpcoming) && dbUpcoming.length > 0) {
          global.upcomingData = dbUpcoming.map(u => typeof global.normalizeUpcoming === 'function' ? global.normalizeUpcoming(u) : u);
        } else {
          let localUp = null;
          try { localUp = JSON.parse(localStorage.getItem(global.UP_KEY || 'property_manager_pro_v2_upcoming')); } catch (e) {}
          if (Array.isArray(localUp) && localUp.length > 0) {
            global.upcomingData = localUp.map(u => typeof global.normalizeUpcoming === 'function' ? global.normalizeUpcoming(u) : u);
          } else if (!demoCleared && Array.isArray(global.initialUpcoming)) {
            global.upcomingData = global.initialUpcoming.map((u, i) => typeof global.normalizeUpcoming === 'function' ? global.normalizeUpcoming({
              ...u,
              id: u.id || ('up' + (i + 1)),
              isDemo: true
            }) : u);
          } else {
            global.upcomingData = [];
          }
          await dbSaveAll('upcoming_projects', global.upcomingData);
        }

        // 4. Profile
        let dbProf = await dbGetProfile();
        if (dbProf && dbProf.name) {
          global.currentProfile = { ...(global.defaultProfile || {}), ...dbProf };
          if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
          if (global.currentPage === 'profile' && typeof global.renderProfile === 'function') global.renderProfile();
        } else if (global.currentProfile) {
          await dbSaveProfile(global.currentProfile);
        }

        // 5. History
        let dbHist = await dbGetHistory();
        if (dbHist && typeof dbHist === 'object') {
          delete dbHist.id;
          try { localStorage.setItem(global.HISTORY_KEY || 'pm_pro_history_v1', JSON.stringify(dbHist)); } catch (e) {}
        }
      } else {
        // LocalStorage fallback
        let localProps = null;
        try { localProps = JSON.parse(localStorage.getItem(global.KEY || 'property_manager_pro_v2')); } catch (e) {}
        if (Array.isArray(localProps)) {
          global.data = localProps.map(p => typeof global.normalizeProperty === 'function' ? global.normalizeProperty(p) : p);
        }
        let localDirect = null;
        try { localDirect = JSON.parse(localStorage.getItem(global.DIRECT_KEY || 'property_manager_pro_direct_v1')); } catch (e) {}
        if (Array.isArray(localDirect)) {
          global.directData = localDirect.map(dp => typeof global.normalizeDirectProperty === 'function' ? global.normalizeDirectProperty(dp) : dp);
        }
        let localUp = null;
        try { localUp = JSON.parse(localStorage.getItem(global.UP_KEY || 'property_manager_pro_v2_upcoming')); } catch (e) {}
        if (Array.isArray(localUp)) {
          global.upcomingData = localUp.map(u => typeof global.normalizeUpcoming === 'function' ? global.normalizeUpcoming(u) : u);
        }
      }
      if (typeof global.markExistingDemoRecords === 'function') global.markExistingDemoRecords();
    } catch (e) {
      console.error('Storage initialization failed:', e);
    } finally {
      isStorageReady = true;
      global.isStorageReady = true;
      if (typeof global.cleanupExpiredDeletedItems === 'function') global.cleanupExpiredDeletedItems();
      if (typeof global.populateAllConfigDropdowns === 'function') global.populateAllConfigDropdowns();
      if (typeof global.renderAll === 'function') global.renderAll();
    }
  }

  // Export to global scope
  global.DB_NAME = DB_NAME;
  global.DB_VERSION = DB_VERSION;
  global.openDB = openDB;
  global.dbSaveProfile = dbSaveProfile;
  global.dbGetProfile = dbGetProfile;
  global.dbSaveConfig = dbSaveConfig;
  global.dbGetConfig = dbGetConfig;
  global.dbSaveHistory = dbSaveHistory;
  global.dbGetHistory = dbGetHistory;
  global.dbGetAll = dbGetAll;
  global.dbSaveAll = dbSaveAll;
  global.initStorage = initStorage;
  global.save = save;
  global.saveUpcoming = saveUpcoming;
  global.saveDirect = saveDirect;

})(typeof window !== 'undefined' ? window : globalThis);
