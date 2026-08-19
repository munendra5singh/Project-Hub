/**
 * Main Application Orchestrator & Controller
 * Multi-Browser Multi-Device Architecture with Supabase Auth & Cloud Vault Storage
 */

import { deriveMasterKey, encryptData, decryptData, generateSecurePassword, generateSalt, base64ToBuffer } from './crypto.js';
import { initDB, getMetadata, setMetadata, getAllEncryptedAccounts, saveEncryptedAccount, deleteEncryptedAccount, clearAllVaultData } from './db.js';
import { showToast, evaluatePasswordStrength, renderAccountCard } from './ui.js';
import { registerUser, loginUser, logoutUser, getCurrentUser } from './auth.js';
import { syncVaultWithCloud, pushRemoteVault, fetchRemoteVault, initRemoteVaultRecord } from './vault.js';
import { isSupabaseReady } from './supabase.js';

// Application State
let activeMasterKey = null; // Stored purely in RAM
let autoLockTimer = null;
let autoLockMinutes = 10;
let clipboardClearSeconds = 20;
let cachedAccounts = [];
let activeCategory = 'All';
let searchQuery = '';

const VERIFY_STRING = 'VAULT_VERIFICATION_CHECK_PASS';

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const landingView = document.getElementById('landing-view');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const dashboardScreen = document.getElementById('dashboard-screen');
const setupPasswordInput = document.getElementById('setup-password');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const userWelcomeBadge = document.getElementById('user-welcome-badge');

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  showLandingView();
  setupEventListeners();
});

function showLandingView() {
  landingView.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginForm.classList.add('hidden');
}

function showLoginForm() {
  landingView.classList.add('hidden');
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  document.getElementById('unlock-username').focus();
}

function showRegisterForm() {
  landingView.classList.add('hidden');
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  document.getElementById('setup-fullname').focus();
}

function setupEventListeners() {
  // Landing Page Buttons
  document.getElementById('btn-show-login').addEventListener('click', showLoginForm);
  document.getElementById('btn-show-register').addEventListener('click', showRegisterForm);
  document.getElementById('btn-switch-to-login').addEventListener('click', showLoginForm);
  document.getElementById('btn-switch-to-register').addEventListener('click', showRegisterForm);

  // Password Strength Checker
  setupPasswordInput.addEventListener('input', (e) => {
    const val = e.target.value;
    const { score, text, color } = evaluatePasswordStrength(val);
    strengthBar.style.width = `${score}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.innerText = `Strength: ${text}`;
  });

  // Registration Form Handler (Global Supabase Auth)
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('setup-fullname').value.trim();
    const username = document.getElementById('setup-username').value.trim();
    const pass = document.getElementById('setup-password').value;
    const confirm = document.getElementById('setup-confirm').value;

    if (pass !== confirm) {
      showToast('Master passwords do not match.', 'error');
      return;
    }

    try {
      // 1. Create global user account in Supabase Auth
      const user = await registerUser({ fullName, username, masterPassword: pass });

      // 2. Generate local salt & derive key
      const salt = generateSalt(16);
      const key = await deriveMasterKey(pass, salt);
      const verEnc = await encryptData(key, VERIFY_STRING);

      if (user.hasSession) {
        // Active session exists -> Initialize cloud vault immediately
        await initRemoteVaultRecord({
          masterKey: key,
          salt: salt,
          verifyIv: verEnc.iv,
          verifyCipher: verEnc.ciphertext
        });

        await setMetadata({
          userId: user.id,
          username: user.username,
          salt: Array.from(salt),
          verifyIv: verEnc.iv,
          verifyCipher: verEnc.ciphertext
        });

        activeMasterKey = key;
        updateUserWelcome(user.fullName || user.username);
        showToast('Account & Vault created successfully!');
        transitionToDashboard();
      } else {
        // Session requires login
        showToast('Account registered successfully! Please log in to unlock your vault.');
        showLoginForm();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create account.', 'error');
    }
  });

  // Login Form Handler (Global Supabase Auth + Cloud Vault Fetch/Init & Decrypt)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('unlock-username').value.trim();
    const pass = document.getElementById('unlock-password').value;

    try {
      // 1. Authenticate user session with Supabase Auth (establishes JWT token)
      const user = await loginUser({ username, masterPassword: pass });

      // 2. Fetch user's encrypted vault & salt record from Supabase Cloud under JWT session
      let remoteData = await fetchRemoteVault();

      if (!remoteData || !remoteData.salt) {
        // First login after registration -> Initialize vault record now under active JWT session
        const salt = generateSalt(16);
        const key = await deriveMasterKey(pass, salt);
        const verEnc = await encryptData(key, VERIFY_STRING);

        remoteData = await initRemoteVaultRecord({
          masterKey: key,
          salt: salt,
          verifyIv: verEnc.iv,
          verifyCipher: verEnc.ciphertext
        });
      }

      // 3. Extract cloud salt and verification parameters
      const salt = base64ToBuffer(remoteData.salt);
      const verifyIv = base64ToBuffer(remoteData.verify_iv);
      const verifyCipher = base64ToBuffer(remoteData.verify_cipher);

      // 4. Derive Master Key locally from entered Master Password + Cloud Salt
      const key = await deriveMasterKey(pass, salt);
      const decryptedVer = await decryptData(key, verifyIv, verifyCipher);

      if (decryptedVer === VERIFY_STRING) {
        activeMasterKey = key;
        
        // Cache metadata locally
        await setMetadata({
          userId: user.id,
          username: user.username,
          salt: Array.from(salt),
          verifyIv: Array.from(verifyIv),
          verifyCipher: Array.from(verifyCipher),
          version: remoteData.version
        });

        updateUserWelcome(user.fullName || user.username);
        showToast('Vault Unlocked Successfully');
        transitionToDashboard();
      } else {
        showToast('Incorrect master password.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed.', 'error');
    }
  });

  // Lock Actions
  document.getElementById('btn-manual-lock').addEventListener('click', lockVault);

  // Auto-Lock Reset Activity Listeners
  ['mousemove', 'keydown', 'click'].forEach(evt => {
    window.addEventListener(evt, resetAutoLockTimer);
  });

  // Global Quick Focus Search Key
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
  });

  // Category & Search Filters
  document.getElementById('category-list').addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      document.getElementById('current-category-title').innerText = activeCategory === 'All' ? 'All Items' : activeCategory;
      renderAccounts();
    }
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderAccounts();
  });

  // Modals Toggles
  document.getElementById('btn-add-account').addEventListener('click', () => openAccountModal());
  document.getElementById('btn-close-modal').addEventListener('click', closeAccountModal);
  document.getElementById('btn-cancel-acc').addEventListener('click', closeAccountModal);
  document.getElementById('account-form').addEventListener('submit', handleSaveAccount);

  // Generator Modals
  document.getElementById('btn-open-generator').addEventListener('click', openGeneratorModal);
  document.getElementById('btn-close-generator').addEventListener('click', closeGeneratorModal);
  document.getElementById('gen-length').addEventListener('input', (e) => {
    document.getElementById('gen-length-val').innerText = e.target.value;
    generatePasswordInModal();
  });
  document.getElementById('btn-regenerate').addEventListener('click', generatePasswordInModal);
  document.getElementById('btn-use-password').addEventListener('click', () => {
    document.getElementById('acc-password').value = document.getElementById('gen-output').value;
    closeGeneratorModal();
  });

  // Settings
  document.getElementById('btn-settings-toggle').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
  });

  document.getElementById('setting-autolock').addEventListener('change', (e) => {
    autoLockMinutes = parseInt(e.target.value, 10);
    document.getElementById('lock-timer-badge').innerText = autoLockMinutes === 0 ? 'Auto-Lock: Off' : `Auto-Lock: ${autoLockMinutes}m`;
    resetAutoLockTimer();
  });

  document.getElementById('setting-theme').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
  });

  // Import / Export
  document.getElementById('btn-export-vault').addEventListener('click', handleExportVault);
  document.getElementById('btn-import-vault').addEventListener('click', () => document.getElementById('import-file-input').click());
  document.getElementById('import-file-input').addEventListener('change', handleImportVault);

  // Purge
  document.getElementById('btn-purge-data').addEventListener('click', async () => {
    if (confirm('CRITICAL WARNING: This will permanently delete all stored credentials and reset your vault. Continue?')) {
      await clearAllVaultData();
      await logoutUser();
      location.reload();
    }
  });
}

function updateUserWelcome(name) {
  if (userWelcomeBadge) {
    userWelcomeBadge.innerText = `Welcome, ${name}`;
  }
}

// Transition to Dashboard
async function transitionToDashboard() {
  authScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  resetAutoLockTimer();

  try {
    const syncStatus = await syncVaultWithCloud(activeMasterKey);
    if (syncStatus.synced && syncStatus.action === 'pulled_remote') {
      showToast(`Synced ${syncStatus.count} account(s) from cloud database`);
    }
  } catch (err) {
    console.warn('Cloud sync error:', err);
  }

  await fetchAndDecryptAccounts();
}

// Lock Vault Execution
async function lockVault() {
  activeMasterKey = null; // Clear key from memory
  cachedAccounts = [];
  if (autoLockTimer) clearTimeout(autoLockTimer);
  await logoutUser();
  dashboardScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  showLandingView();
  registerForm.reset();
  loginForm.reset();
  showToast('Vault Locked');
}

// Auto-Lock Timer Logic
function resetAutoLockTimer() {
  if (!activeMasterKey || autoLockMinutes === 0) return;
  if (autoLockTimer) clearTimeout(autoLockTimer);
  autoLockTimer = setTimeout(() => {
    lockVault();
    showToast('Vault auto-locked due to inactivity.', 'info');
  }, autoLockMinutes * 60 * 1000);
}

// Account Processing & Encryption Operations
async function fetchAndDecryptAccounts() {
  const encryptedRecords = await getAllEncryptedAccounts();
  cachedAccounts = [];

  for (const record of encryptedRecords) {
    try {
      const decryptedJSON = await decryptData(activeMasterKey, record.iv, record.ciphertext);
      const data = JSON.parse(decryptedJSON);
      cachedAccounts.push({ id: record.id, ...data });
    } catch (e) {
      console.error('Failed to decrypt record', record.id);
    }
  }
  renderAccounts();
}

function renderAccounts() {
  const container = document.getElementById('accounts-grid');
  const emptyState = document.getElementById('empty-state');
  container.innerHTML = '';

  const filtered = cachedAccounts.filter(acc => {
    const matchesCategory = activeCategory === 'All' || acc.category === activeCategory;
    const matchesSearch = !searchQuery || 
      acc.website.toLowerCase().includes(searchQuery) ||
      (acc.username && acc.username.toLowerCase().includes(searchQuery)) ||
      (acc.email && acc.email.toLowerCase().includes(searchQuery)) ||
      (acc.name && acc.name.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  document.getElementById('account-count').innerText = `${filtered.length} Accounts`;

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(acc => {
      const card = renderAccountCard(acc, {
        onShow: handleShowPassword,
        onCopy: handleCopyPassword,
        onEdit: openAccountModal,
        onDelete: handleDeleteAccount
      });
      container.appendChild(card);
    });
  }
}

// Show Password Temporary Mechanism
function handleShowPassword(id) {
  const acc = cachedAccounts.find(a => a.id === id);
  if (!acc) return;
  
  const el = document.getElementById(`pass-val-${id}`);
  el.innerText = acc.password;

  setTimeout(() => {
    if (el) el.innerText = '••••••••••••';
  }, 10000); // Hide after 10 sec
}

// Copy Password to Clipboard with Auto-Clear
async function handleCopyPassword(id) {
  const acc = cachedAccounts.find(a => a.id === id);
  if (!acc) return;

  await navigator.clipboard.writeText(acc.password);
  showToast(`Password copied. Auto-clearing in ${clipboardClearSeconds}s.`);

  setTimeout(async () => {
    try {
      const currentClip = await navigator.clipboard.readText();
      if (currentClip === acc.password) {
        await navigator.clipboard.writeText('');
        showToast('Clipboard cleared.');
      }
    } catch (err) {
      // Permission issues in some browsers
    }
  }, clipboardClearSeconds * 1000);
}

// Save Account (Create or Edit)
async function handleSaveAccount(e) {
  e.preventDefault();
  const id = document.getElementById('acc-id').value || crypto.randomUUID();
  
  const payload = {
    website: document.getElementById('acc-website').value,
    url: document.getElementById('acc-url').value,
    name: document.getElementById('acc-name').value,
    category: document.getElementById('acc-category').value,
    username: document.getElementById('acc-username').value,
    email: document.getElementById('acc-email').value,
    password: document.getElementById('acc-password').value,
    notes: document.getElementById('acc-notes').value,
    updatedAt: new Date().toISOString()
  };

  const encrypted = await encryptData(activeMasterKey, JSON.stringify(payload));
  
  await saveEncryptedAccount({
    id: id,
    iv: encrypted.iv,
    ciphertext: encrypted.ciphertext
  });

  // Push updated vault payload to cloud
  const meta = await getMetadata();
  const allAccounts = await getAllEncryptedAccounts();
  if (meta && meta.salt) {
    try {
      await pushRemoteVault({
        masterKey: activeMasterKey,
        accountsArray: allAccounts,
        salt: new Uint8Array(meta.salt),
        verifyIv: new Uint8Array(meta.verifyIv),
        verifyCipher: new Uint8Array(meta.verifyCipher),
        currentVersion: meta.version || 1
      });
    } catch (err) {
      console.warn('Cloud update warning:', err);
    }
  }

  showToast('Account saved securely & synchronized.');
  closeAccountModal();
  await fetchAndDecryptAccounts();
}

// Delete Account
async function handleDeleteAccount(id) {
  if (confirm('Are you sure you want to permanently delete this credential?')) {
    await deleteEncryptedAccount(id);

    // Push updated vault payload to cloud after deletion
    const meta = await getMetadata();
    const allAccounts = await getAllEncryptedAccounts();
    if (meta && meta.salt) {
      try {
        await pushRemoteVault({
          masterKey: activeMasterKey,
          accountsArray: allAccounts,
          salt: new Uint8Array(meta.salt),
          verifyIv: new Uint8Array(meta.verifyIv),
          verifyCipher: new Uint8Array(meta.verifyCipher),
          currentVersion: meta.version || 1
        });
      } catch (err) {
        console.warn('Cloud update warning after deletion:', err);
      }
    }

    showToast('Account deleted.');
    await fetchAndDecryptAccounts();
  }
}

// Modal Handlers
function openAccountModal(acc = null) {
  document.getElementById('account-form').reset();
  if (acc) {
    document.getElementById('modal-title').innerText = 'Edit Account';
    document.getElementById('acc-id').value = acc.id;
    document.getElementById('acc-website').value = acc.website;
    document.getElementById('acc-url').value = acc.url || '';
    document.getElementById('acc-name').value = acc.name || '';
    document.getElementById('acc-category').value = acc.category;
    document.getElementById('acc-username').value = acc.username || '';
    document.getElementById('acc-email').value = acc.email || '';
    document.getElementById('acc-password').value = acc.password;
    document.getElementById('acc-notes').value = acc.notes || '';
  } else {
    document.getElementById('modal-title').innerText = 'Add New Account';
    document.getElementById('acc-id').value = '';
  }
  document.getElementById('account-modal').classList.remove('hidden');
}

function closeAccountModal() {
  document.getElementById('account-modal').classList.add('hidden');
}

function openGeneratorModal() {
  generatePasswordInModal();
  document.getElementById('generator-modal').classList.remove('hidden');
}

function closeGeneratorModal() {
  document.getElementById('generator-modal').classList.add('hidden');
}

function generatePasswordInModal() {
  const length = parseInt(document.getElementById('gen-length').value, 10);
  const options = {
    uppercase: document.getElementById('gen-uppercase').checked,
    lowercase: document.getElementById('gen-lowercase').checked,
    numbers: document.getElementById('gen-numbers').checked,
    symbols: document.getElementById('gen-symbols').checked
  };

  try {
    const pass = generateSecurePassword(length, options);
    document.getElementById('gen-output').value = pass;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Encrypted Backup & Restore Logic
async function handleExportVault() {
  const meta = await getMetadata();
  const accounts = await getAllEncryptedAccounts();

  const backupData = {
    version: 1,
    exportDate: new Date().toISOString(),
    meta: meta,
    accounts: accounts
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-secure-vault-backup-${new Date().toISOString().slice(0, 10)}.enc`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Encrypted backup exported.');
}

async function handleImportVault(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!parsed.meta || !parsed.accounts) {
        throw new Error('Invalid backup format');
      }

      if (confirm('Importing will overwrite existing metadata and merge accounts. Continue?')) {
        await setMetadata(parsed.meta);
        for (const acc of parsed.accounts) {
          await saveEncryptedAccount(acc);
        }
        showToast('Vault restored successfully. Reloading...');
        setTimeout(() => location.reload(), 1500);
      }
    } catch (err) {
      showToast('Invalid or corrupted backup file.', 'error');
    }
  };
  reader.readAsText(file);
}