/**
 * Cloud Vault Synchronization Engine (Supabase Cloud Source of Truth)
 * 
 * Manages zero-knowledge encrypted vault push/pull, salt & metadata persistence in cloud,
 * multi-device synchronization, and conflict detection via vault versioning.
 */

import { getSupabase, isSupabaseReady } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { encryptData, decryptData, bufferToBase64, base64ToBuffer } from './crypto.js';
import { getAllEncryptedAccounts, saveEncryptedAccount, setMetadata } from './db.js';

/**
 * Fetch remote encrypted vault record from Supabase database by authenticated user_id
 */
export async function fetchRemoteVault() {
  if (!isSupabaseReady()) return null;

  const supabase = getSupabase();
  const user = getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('vaults')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[Vault Sync] Error fetching remote vault record:', error.message);
    throw new Error('Failed to fetch user vault from cloud: ' + error.message);
  }

  return data;
}

/**
 * Initialize a new user's cloud vault record in Supabase upon registration
 * @param {Object} params - { masterKey, salt, verifyIv, verifyCipher }
 */
export async function initRemoteVaultRecord({ masterKey, salt, verifyIv, verifyCipher }) {
  if (!isSupabaseReady()) {
    throw new Error('Supabase client is not configured.');
  }

  const supabase = getSupabase();
  const user = getCurrentUser();
  if (!user) throw new Error('User session not active.');

  // Create an initial encrypted empty accounts list
  const emptyAccountsJSON = JSON.stringify([]);
  const encryptedPayload = await encryptData(masterKey, emptyAccountsJSON);

  const vaultRecord = {
    user_id: user.id,
    encrypted_vault: JSON.stringify({
      iv: encryptedPayload.iv,
      ciphertext: encryptedPayload.ciphertext
    }),
    salt: bufferToBase64(salt),
    verify_iv: bufferToBase64(verifyIv),
    verify_cipher: bufferToBase64(verifyCipher),
    version: 1,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('vaults')
    .upsert(vaultRecord, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[Vault Sync] Error initializing remote vault:', error.message);
    throw new Error('Failed to create cloud vault record: ' + error.message);
  }

  return data;
}

/**
 * Push updated encrypted vault data & accounts to Supabase database
 * @param {Object} params - { masterKey, accountsArray, salt, verifyIv, verifyCipher, currentVersion }
 */
export async function pushRemoteVault({ masterKey, accountsArray, salt, verifyIv, verifyCipher, currentVersion = 1 }) {
  if (!isSupabaseReady()) return null;

  const supabase = getSupabase();
  const user = getCurrentUser();
  if (!user) return null;

  // Encrypt the full vault payload (accounts array)
  const plaintextJSON = JSON.stringify(accountsArray);
  const encryptedPayload = await encryptData(masterKey, plaintextJSON);

  const vaultRecord = {
    user_id: user.id,
    encrypted_vault: JSON.stringify({
      iv: encryptedPayload.iv,
      ciphertext: encryptedPayload.ciphertext
    }),
    salt: bufferToBase64(salt),
    verify_iv: bufferToBase64(verifyIv),
    verify_cipher: bufferToBase64(verifyCipher),
    version: currentVersion + 1,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('vaults')
    .upsert(vaultRecord, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[Vault Sync] Error pushing remote vault:', error.message);
    throw new Error('Failed to update cloud vault database: ' + error.message);
  }

  return data;
}

/**
 * Synchronize local IndexedDB cache with remote Supabase cloud vault
 * @param {CryptoKey} masterKey
 */
export async function syncVaultWithCloud(masterKey) {
  if (!isSupabaseReady()) {
    console.log('[Vault Sync] Supabase not configured.');
    return { synced: false, source: 'local' };
  }

  const remoteData = await fetchRemoteVault();

  if (!remoteData) {
    return { synced: false, reason: 'no_remote_vault' };
  }

  // Remote data exists -> Decrypt remote accounts payload
  try {
    const rawEncryptedPayload = JSON.parse(remoteData.encrypted_vault);
    const decryptedJSON = await decryptData(
      masterKey,
      rawEncryptedPayload.iv,
      rawEncryptedPayload.ciphertext
    );
    const remoteAccounts = JSON.parse(decryptedJSON);

    // Save remote accounts into local IndexedDB cache for offline access
    for (const accRecord of remoteAccounts) {
      await saveEncryptedAccount(accRecord);
    }

    // Save remote metadata locally
    await setMetadata({
      userId: remoteData.user_id,
      salt: Array.from(base64ToBuffer(remoteData.salt)),
      verifyIv: Array.from(base64ToBuffer(remoteData.verify_iv)),
      verifyCipher: Array.from(base64ToBuffer(remoteData.verify_cipher)),
      version: remoteData.version,
      updatedAt: remoteData.updated_at
    });

    return { synced: true, action: 'pulled_remote', version: remoteData.version, count: remoteAccounts.length };
  } catch (err) {
    console.error('[Vault Sync] Failed to decrypt remote vault with current key:', err);
    throw new Error('Master password failed to decrypt remote cloud vault.');
  }
}
