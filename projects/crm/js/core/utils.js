/**
 * PROPERTY MANAGER PRO — CORE UTILITIES
 * =====================================
 * Pure formatting, sanitation, image compression, math, and communication helpers.
 */

(function(global) {
  'use strict';

  /**
   * Formats numbers into Indian Lakhs (L) and Crores (Cr) currency notation.
   */
  function money(n) {
    n = Number(n) || 0;
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(n % 10000000 ? 1 : 0) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 ? 1 : 0) + ' L';
    return n ? '₹' + n.toLocaleString('en-IN') : '—';
  }

  /**
   * Formats a price range e.g. "₹1.8 Cr – ₹2.4 Cr".
   */
  function moneyRange(start, max) {
    let s = money(start);
    if (max && Number(max) > Number(start)) return s + ' – ' + money(max);
    return s;
  }

  /**
   * Escapes HTML entities to prevent XSS.
   */
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  /**
   * Sanitizes external URLs against javascript: and malicious protocols.
   */
  function safeUrl(url) {
    if (!url) return '';
    let str = String(url).trim();
    if (!str) return '';
    let lower = str.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) return '#';
    if (lower.startsWith('data:') && !lower.startsWith('data:image/')) return '#';
    if (lower.startsWith('tel:') || lower.startsWith('mailto:')) return str;
    if (lower.startsWith('http://') || lower.startsWith('https://')) return str;
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(str)) {
      return 'https://' + str;
    }
    return str;
  }

  /**
   * Normalizes phone numbers with Indian/international E.164 convention.
   */
  function normalizePhoneNumber(phone) {
    if (!phone) return '';
    let str = String(phone).trim();
    let digits = str.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
    if (digits.length === 10) return '+91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
    if (str.startsWith('+')) return '+' + digits;
    return '+' + digits;
  }

  /**
   * Generates wa.me chat link with optional pre-filled message.
   */
  function getWhatsAppUrl(phone, msg = '') {
    let normalized = normalizePhoneNumber(phone);
    if (!normalized) return '';
    let digits = normalized.replace(/\D/g, '');
    let base = 'https://wa.me/' + digits;
    if (msg) base += '?text=' + encodeURIComponent(msg);
    return base;
  }

  /**
   * Generates tel: dialing link.
   */
  function getTelUrl(phone) {
    if (!phone) return '';
    let norm = normalizePhoneNumber(phone);
    if (norm) return 'tel:' + norm;
    let clean = String(phone).replace(/[^\d+]/g, '');
    return clean ? ('tel:' + clean) : '';
  }

  /**
   * Returns standardized area unit key.
   */
  function getAreaUnit(p) {
    let u = (p && p.areaUnit) ? String(p.areaUnit).toLowerCase().trim() : 'sqyard';
    if (u === 'sqft') return 'sqft';
    if (u === 'sqmtr') return 'sqmtr';
    return 'sqyard';
  }

  /**
   * Returns human-readable area unit label.
   */
  function getAreaUnitLabel(unit) {
    let u = String(unit || '').toLowerCase().trim();
    if (u === 'sqft') return 'Sqft';
    if (u === 'sqmtr') return 'Sqmtr';
    return 'Sqyard';
  }

  /**
   * Formats property area with its assigned unit.
   */
  function formatArea(p) {
    if (!p || p.area === undefined || p.area === null || p.area === '' || p.area === 0) return '';
    if (typeof p.area === 'string' && !/^\d+(\.\d+)?$/.test(p.area.trim())) return p.area;
    let unit = getAreaUnit(p);
    let label = getAreaUnitLabel(unit);
    return `${p.area} ${label}`;
  }

  /**
   * Returns dimension unit key, defaulting from area unit if needed.
   */
  function getDimensionUnit(p) {
    if (p && p.dimensionUnit && String(p.dimensionUnit).trim()) {
      let u = String(p.dimensionUnit).toLowerCase().trim();
      if (u === 'ft') return 'ft';
      if (u === 'meter') return 'meter';
      if (u === 'yard') return 'yard';
    }
    let au = getAreaUnit(p);
    if (au === 'sqft') return 'ft';
    if (au === 'sqmtr') return 'meter';
    return 'yard';
  }

  /**
   * Returns human-readable dimension unit label.
   */
  function getDimensionUnitLabel(unit) {
    let u = String(unit || '').toLowerCase().trim();
    if (u === 'ft') return 'Ft';
    if (u === 'meter') return 'Meter';
    return 'Yard';
  }

  /**
   * Formats property dimensions with assigned unit.
   */
  function formatDimensions(p) {
    let dim = (p && (p.dim || p.dimensions)) ? String(p.dim || p.dimensions).trim() : '';
    if (!dim) return '';
    let unit = getDimensionUnit(p);
    let label = getDimensionUnitLabel(unit);
    return `${dim} ${label}`;
  }

  /**
   * Syncs dimension unit selector when area unit selector changes in forms.
   */
  function onAreaUnitChange() {
    let areaUnit = document.getElementById('fAreaUnit')?.value || 'sqyard';
    let dimUnitSelect = document.getElementById('fDimUnit');
    if (!dimUnitSelect) return;
    if (areaUnit === 'sqft') {
      dimUnitSelect.value = 'ft';
    } else if (areaUnit === 'sqmtr') {
      dimUnitSelect.value = 'meter';
    } else {
      dimUnitSelect.value = 'yard';
    }
  }

  /**
   * Intelligent auto-formatting for dimensions input field (e.g. "30 " -> "30 × ").
   */
  function setupDimensionsInput(input) {
    if (!input || input._dimBound) return;
    input._dimBound = true;

    input.addEventListener('paste', function(e) {
      let pasted = (e.clipboardData || window.clipboardData)?.getData('text');
      if (!pasted) return;
      let trimmed = pasted.trim();
      let m = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:[xX*×]|\s+)\s*(\d+(?:\.\d+)?)$/);
      if (m) {
        e.preventDefault();
        input.value = `${m[1]} × ${m[2]}`;
      }
    });

    input.addEventListener('input', function(e) {
      if (e.inputType && e.inputType.startsWith('delete')) return;
      let v = input.value;
      if (!v) return;

      let full = v.trim().match(/^(\d+(?:\.\d+)?)\s*(?:[xX*]|\s{2,}|\s)\s*(\d+(?:\.\d+)?)$/);
      if (full && (!v.includes('×') || /[xX*]/.test(v))) {
        let pos = `${full[1]} × ${full[2]}`.length;
        input.value = `${full[1]} × ${full[2]}`;
        try { input.setSelectionRange(pos, pos); } catch (err) {}
        return;
      }

      let spaceMatch = v.match(/^(\d+(?:\.\d+)?)\s+$/);
      if (spaceMatch) {
        input.value = `${spaceMatch[1]} × `;
        return;
      }

      let xMatch = v.match(/^(\d+(?:\.\d+)?)\s*[xX*]\s*$/);
      if (xMatch) {
        input.value = `${xMatch[1]} × `;
        return;
      }

      let parts = v.split('×');
      if (parts.length > 2) {
        input.value = parts[0].trim() + ' × ' + parts.slice(1).join('').trim();
      }
    });
  }

  /**
   * Validates image MIME type and extension.
   */
  function isValidImageFile(file) {
    if (!file) return false;
    if (file.type) {
      if (/image\/(jpeg|jpg|pjpeg|png|webp)/i.test(file.type)) return true;
      if (file.type.toLowerCase().startsWith('image/')) return true;
    }
    if (file.name && /\.(jpe?g|png|webp)$/i.test(file.name)) {
      return true;
    }
    return false;
  }

  /**
   * Compresses image using HTML Canvas for offline storage.
   */
  function compressImage(file, maxWidth = 1000, maxHeight = 800, quality = 0.75) {
    return new Promise((resolve, reject) => {
      if (!isValidImageFile(file)) {
        return reject(new Error('Please upload a valid image (JPG, JPEG, PNG, or WEBP).'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        if (!result) {
          return reject(new Error('Failed to read image data.'));
        }
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (!w || !h) {
            return reject(new Error('Unable to determine image dimensions.'));
          }
          if (w > maxWidth || h > maxHeight) {
            if (w / h > maxWidth / maxHeight) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            } else {
              w = Math.round((w * maxHeight) / h);
              h = maxHeight;
            }
          }
          try {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (canvasErr) {
            resolve(result);
          }
        };
        img.onerror = () => reject(new Error('Unable to decode image file.'));
        img.src = result;
      };
      reader.onerror = () => reject(new Error('Error reading image file.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Displays brief non-intrusive toast notification.
   */
  let toastTimer;
  function toast(t, actionHtml, duration = 2400) {
    let e = document.getElementById('toast');
    if (!e) return;
    if (actionHtml) {
      e.innerHTML = `<span>${t}</span>${actionHtml}`;
    } else {
      e.textContent = t;
    }
    e.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => e.classList.remove('show'), duration);
  }

  // Export to global scope for 100% backward compatibility
  global.money = money;
  global.moneyRange = moneyRange;
  global.esc = esc;
  global.safeUrl = safeUrl;
  global.normalizePhoneNumber = normalizePhoneNumber;
  global.getWhatsAppUrl = getWhatsAppUrl;
  global.getTelUrl = getTelUrl;
  global.getAreaUnit = getAreaUnit;
  global.getAreaUnitLabel = getAreaUnitLabel;
  global.formatArea = formatArea;
  global.getDimensionUnit = getDimensionUnit;
  global.getDimensionUnitLabel = getDimensionUnitLabel;
  global.formatDimensions = formatDimensions;
  global.onAreaUnitChange = onAreaUnitChange;
  global.setupDimensionsInput = setupDimensionsInput;
  global.isValidImageFile = isValidImageFile;
  global.compressImage = compressImage;
  global.toast = toast;

})(typeof window !== 'undefined' ? window : globalThis);
