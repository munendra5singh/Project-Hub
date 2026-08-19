/**
 * IndexedDB Local Data Storage Abstraction
 */

const DB_NAME = 'SecureVaultDB';
const DB_VERSION = 1;
const STORE_META = 'metadata';
const STORE_ACCOUNTS = 'accounts';

let dbInstance = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ACCOUNTS)) {
        db.createObjectStore(STORE_ACCOUNTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => reject('Database failed to open: ' + event.target.error);
  });
}

// Metadata helper (Salt & Verification Payload)
export async function getMetadata() {
  return new Promise((resolve) => {
    const tx = dbInstance.transaction(STORE_META, 'readonly');
    const store = tx.objectStore(STORE_META);
    const request = store.get('vault_meta');
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function setMetadata(metaObj) {
  return new Promise((resolve) => {
    const tx = dbInstance.transaction(STORE_META, 'readwrite');
    const store = tx.objectStore(STORE_META);
    store.put({ id: 'vault_meta', ...metaObj });
    tx.oncomplete = () => resolve();
  });
}

// Account CRUD Operations
export async function getAllEncryptedAccounts() {
  return new Promise((resolve) => {
    const tx = dbInstance.transaction(STORE_ACCOUNTS, 'readonly');
    const store = tx.objectStore(STORE_ACCOUNTS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function saveEncryptedAccount(accountRecord) {
  return new Promise((resolve) => {
    const tx = dbInstance.transaction(STORE_ACCOUNTS, 'readwrite');
    const store = tx.objectStore(STORE_ACCOUNTS);
    store.put(accountRecord);
    tx.oncomplete = () => resolve();
  });
}

export async function deleteEncryptedAccount(id) {
  return new Promise((resolve) => {
    const tx = dbInstance.transaction(STORE_ACCOUNTS, 'readwrite');
    const store = tx.objectStore(STORE_ACCOUNTS);
    store.delete(id);
    tx.oncomplete = () => resolve();
  });
}

export async function clearAllVaultData() {
  return new Promise((resolve) => {
    const tx = dbInstance.transaction([STORE_META, STORE_ACCOUNTS], 'readwrite');
    tx.objectStore(STORE_META).clear();
    tx.objectStore(STORE_ACCOUNTS).clear();
    tx.oncomplete = () => resolve();
  });
}