/**
 * Cryptographic Subsystem using Web Crypto API
 * PBKDF2 Key Derivation + AES-GCM Encryption/Decryption
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LEN = 256;

// Derive AES-GCM Key from Master Password and Salt
export async function deriveMasterKey(password, salt) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    {
      name: "AES-GCM",
      length: KEY_LEN
    },
    false,
    ["encrypt", "decrypt"]
  );
}


// Encrypt plaintext payload using Derived Key
export async function encryptData(key, plaintext) {
  const enc = new TextEncoder();

  // 96-bit IV recommended for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    enc.encode(plaintext)
  );

  return {
    iv: Array.from(iv),
    ciphertext: Array.from(
      new Uint8Array(ciphertextBuffer)
    )
  };
}


// Decrypt encrypted payload using Derived Key
export async function decryptData(
  key,
  ivArray,
  ciphertextArray
) {
  const dec = new TextDecoder();

  const iv = new Uint8Array(ivArray);
  const ciphertext = new Uint8Array(ciphertextArray);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    ciphertext
  );

  return dec.decode(decryptedBuffer);
}


// Cryptographically Secure Password Generator
export function generateSecurePassword(
  length = 16,
  options = {}
) {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options;

  let chars = "";

  if (uppercase) {
    chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (lowercase) {
    chars += "abcdefghijklmnopqrstuvwxyz";
  }

  if (numbers) {
    chars += "0123456789";
  }

  if (symbols) {
    chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }

  if (!chars) {
    throw new Error(
      "At least one character set must be selected"
    );
  }

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}


// Generate random salt
export function generateSalt(length = 16) {
  return crypto.getRandomValues(
    new Uint8Array(length)
  );
}


// Base64 serialization helpers for Uint8Array
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}