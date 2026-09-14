/**
 * PROPERTY MANAGER PRO — CENTRALIZED PROPERTY SHARE MODULE
 * ==========================================================
 * Responsible for:
 * 1. Resolving property / project records across all 3 modules (Company, Direct, Upcoming)
 * 2. Compiling 100% of available property fields without mutating the original object
 * 3. Safely handling missing/empty values with ZERO undefined/null outputs
 * 4. Generating clean, readable, structured text with section headers & emojis
 * 5. Invoking Native Share (navigator.share) where supported
 * 6. Falling back to clipboard copy with user feedback toast
 */

(function(global) {
  'use strict';

  /**
   * Resolves a property or project record from an object or ID.
   * Searches across data (Company), directData (Direct), and upcomingData (Projects).
   */
  function resolveProperty(propertyOrId, moduleHint) {
    if (!propertyOrId) return null;
    if (typeof propertyOrId === 'object') return propertyOrId;

    const id = String(propertyOrId);

    // 1. Check hint if provided
    if (moduleHint === 'upcoming' || moduleHint === 'project') {
      if (typeof upcomingData !== 'undefined' && Array.isArray(upcomingData)) {
        const found = upcomingData.find(x => x && x.id === id);
        if (found) return found;
      }
    } else if (moduleHint === 'direct') {
      if (typeof directData !== 'undefined' && Array.isArray(directData)) {
        const found = directData.find(x => x && x.id === id);
        if (found) return found;
      }
    } else if (moduleHint === 'property' || moduleHint === 'company') {
      if (typeof data !== 'undefined' && Array.isArray(data)) {
        const found = data.find(x => x && x.id === id);
        if (found) return found;
      }
    }

    // 2. ID prefix heuristics
    if (id.startsWith('dp_')) {
      if (typeof directData !== 'undefined' && Array.isArray(directData)) {
        const found = directData.find(x => x && x.id === id);
        if (found) return found;
      }
    }
    if (id.startsWith('up')) {
      if (typeof upcomingData !== 'undefined' && Array.isArray(upcomingData)) {
        const found = upcomingData.find(x => x && x.id === id);
        if (found) return found;
      }
    }

    // 3. Fallback search across all collections
    if (typeof data !== 'undefined' && Array.isArray(data)) {
      const found = data.find(x => x && x.id === id);
      if (found) return found;
    }
    if (typeof directData !== 'undefined' && Array.isArray(directData)) {
      const found = directData.find(x => x && x.id === id);
      if (found) return found;
    }
    if (typeof upcomingData !== 'undefined' && Array.isArray(upcomingData)) {
      const found = upcomingData.find(x => x && x.id === id);
      if (found) return found;
    }

    return null;
  }

  /**
   * Helper to determine module type of a resolved record.
   */
  function detectModuleType(p, moduleHint) {
    if (moduleHint === 'upcoming' || moduleHint === 'project') return 'project';
    if (moduleHint === 'direct') return 'direct';
    if (moduleHint === 'property' || moduleHint === 'company') return 'property';

    if (p.source === 'project' || p.source === 'upcoming' || p.developer || p.launchDate || p.possessionDate || (p.id && String(p.id).startsWith('up'))) {
      return 'project';
    }
    if (p.isDirect || p.source === 'direct' || (p.id && String(p.id).startsWith('dp_'))) {
      return 'direct';
    }
    return 'property';
  }

  /**
   * Safely formats currency using existing money / moneyRange or clean fallback.
   */
  function formatMoneyVal(val) {
    if (typeof money === 'function') {
      return money(val);
    }
    const n = Number(val) || 0;
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(n % 10000000 ? 1 : 0) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 ? 1 : 0) + ' L';
    return n ? '₹' + n.toLocaleString('en-IN') : '—';
  }

  function formatMoneyRangeVal(min, max) {
    if (typeof moneyRange === 'function') {
      return moneyRange(min, max);
    }
    if (!max || Number(max) <= Number(min)) return formatMoneyVal(min);
    return `${formatMoneyVal(min)} – ${formatMoneyVal(max)}`;
  }

  /**
   * Safely formats area using existing formatArea or clean fallback.
   */
  function formatAreaVal(p) {
    if (typeof formatArea === 'function') {
      const formatted = formatArea(p);
      if (formatted && formatted !== '—') return formatted;
    }
    if (!p || !p.area) return '';
    const areaStr = String(p.area).trim();
    if (!/^\d+(\.\d+)?$/.test(areaStr)) return areaStr;
    return areaStr + (p.areaUnit ? ' ' + p.areaUnit : ' sq.yd');
  }

  /**
   * Safely formats dimensions using existing formatDimensions or clean fallback.
   */
  function formatDimensionsVal(p) {
    if (typeof formatDimensions === 'function') {
      const formatted = formatDimensions(p);
      if (formatted && formatted !== '—') return formatted;
    }
    if (!p || !p.dim) return '';
    const dimStr = String(p.dim).trim();
    if (/[a-zA-Z]/.test(dimStr)) return dimStr;
    return dimStr + (p.dimensionUnit ? ' ' + p.dimensionUnit : ' ft');
  }

  /**
   * Extracts and formats all dynamic custom fields belonging to this record.
   */
  function extractCustomFields(p, moduleType) {
    const results = [];
    if (!p || !p.customFields || typeof p.customFields !== 'object') {
      return results;
    }

    const cfObj = p.customFields;
    const handledKeys = new Set();

    // 1. Check against appConfig.customFields if available
    let definedFields = [];
    if (typeof appConfig !== 'undefined' && Array.isArray(appConfig.customFields)) {
      definedFields = appConfig.customFields.filter(cf => {
        if (!cf || cf.enabled === false) return false;
        return cf.appliesTo === 'all' || cf.appliesTo === 'both' || cf.appliesTo === moduleType;
      });
    }

    definedFields.forEach(cf => {
      const val = cfObj[cf.key];
      handledKeys.add(cf.key);

      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val) && val.length === 0) return;

      let displayVal = '';
      if (cf.type === 'checkbox') {
        displayVal = (val === true || val === 'true' || val === 1) ? 'Yes' : 'No';
      } else if (cf.type === 'currency') {
        displayVal = typeof val === 'number' ? formatMoneyVal(val) : '₹' + val;
      } else if (Array.isArray(val)) {
        displayVal = val.join(', ');
      } else {
        displayVal = String(val).trim();
      }

      if (displayVal) {
        results.push({
          key: cf.key,
          label: cf.label || cf.key,
          value: displayVal
        });
      }
    });

    // 2. Include any additional custom field values not explicitly defined in appConfig
    Object.keys(cfObj).forEach(key => {
      if (handledKeys.has(key)) return;
      const val = cfObj[key];
      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val) && val.length === 0) return;

      let displayVal = Array.isArray(val) ? val.join(', ') : String(val).trim();
      if (displayVal) {
        // Format key into Title Case label (e.g., cf_floor_no -> Floor No)
        let label = key.replace(/^cf_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        results.push({
          key: key,
          label: label,
          value: displayVal
        });
      }
    });

    return results;
  }

  /**
   * Compiles complete property share data object.
   * Does NOT modify original property object.
   */
  function buildPropertyShareData(propertyOrId, moduleHint) {
    const raw = resolveProperty(propertyOrId, moduleHint);
    if (!raw) return null;

    // Shallow clone to ensure complete non-mutation
    const p = { ...raw };
    const moduleType = detectModuleType(p, moduleHint);

    let categoryLabel = 'Company Inventory';
    if (moduleType === 'project') categoryLabel = 'Upcoming Project';
    else if (moduleType === 'direct') categoryLabel = 'Direct Property (Direct Owner)';

    // Price calculation
    let priceFormatted = '';
    let priceCategory = p.priceCategory || '';
    let budgetSlab = p.budgetSlab || '';

    if (moduleType === 'project') {
      priceFormatted = formatMoneyRangeVal(p.price, p.maxPrice);
      if (!priceCategory && typeof getPriceCategory === 'function') {
        priceCategory = getPriceCategory(p.price);
      }
      if (!budgetSlab && typeof getBudgetSlab === 'function') {
        budgetSlab = getBudgetSlab(p.price);
      }
    } else {
      priceFormatted = formatMoneyVal(p.price);
      if (!priceCategory && typeof getPropertyCategory === 'function') {
        priceCategory = getPropertyCategory(p.price);
      }
      if (!budgetSlab && typeof getPropertyBudgetSlab === 'function') {
        budgetSlab = getPropertyBudgetSlab(p.price);
      }
    }

    const customFieldsList = extractCustomFields(p, moduleType);

    return {
      id: p.id || '',
      name: p.name || 'Untitled Property',
      moduleType: moduleType,
      categoryLabel: categoryLabel,
      location: p.location || '',
      type: p.type || '',
      bhk: p.bhk || '',
      areaFormatted: formatAreaVal(p),
      dimensionsFormatted: formatDimensionsVal(p),
      facing: p.facing || '',
      road: p.road || '',
      priceFormatted: priceFormatted,
      priceCategory: priceCategory,
      budgetSlab: budgetSlab,
      status: p.status || '',
      developer: p.developer || '',
      launchDate: p.launchDate || '',
      possessionDate: p.possessionDate || '',
      owner: p.owner || '',
      phone: p.phone ? String(p.phone).trim() : '',
      follow: p.follow || '',
      notes: p.notes || '',
      map: p.map || '',
      photo: p.photo || '',
      video: p.video || '',
      brochure: p.brochure || '',
      customFields: customFieldsList
    };
  }

  /**
   * Generates formatted share text from property data.
   * Completely omits missing fields, preventing any 'undefined' or 'null'.
   */
  function buildPropertyShareText(propertyOrId, moduleHint) {
    const data = buildPropertyShareData(propertyOrId, moduleHint);
    if (!data) return '';

    const lines = [];

    // Header with primary details
    const headerEmoji = data.moduleType === 'project' ? '🏗️' : '🏡';
    lines.push(`${headerEmoji} ${data.name}`);

    if (data.location) {
      lines.push(`📍 Location: ${data.location}`);
    }

    if (data.priceFormatted && data.priceFormatted !== '—') {
      let priceLine = `💰 Price: ${data.priceFormatted}`;
      const badges = [];
      if (data.priceCategory) badges.push(data.priceCategory);
      if (data.budgetSlab) badges.push(data.budgetSlab);
      if (badges.length) {
        priceLine += ` (${badges.join(' • ')})`;
      }
      lines.push(priceLine);
    }

    if (data.status) {
      lines.push(`🏷️ Status: ${data.status}`);
    }

    lines.push(`🔑 Category: ${data.categoryLabel}`);

    // Section 1: Specifications / Project Details
    const specLines = [];
    if (data.id) specLines.push(`• Reference ID: ${data.id}`);
    if (data.developer) specLines.push(`• Developer / Builder: ${data.developer}`);
    if (data.type) specLines.push(`• Property Type: ${data.type}`);
    if (data.bhk) specLines.push(`• Configuration: ${data.bhk}`);
    if (data.areaFormatted) specLines.push(`• Area / Size: ${data.areaFormatted}`);
    if (data.dimensionsFormatted) specLines.push(`• Dimensions: ${data.dimensionsFormatted}`);
    if (data.facing) specLines.push(`• Facing: ${data.facing}`);
    if (data.road) specLines.push(`• Road Width: ${data.road}`);
    if (data.launchDate) specLines.push(`• Expected Launch: ${data.launchDate}`);
    if (data.possessionDate) specLines.push(`• Possession Date: ${data.possessionDate}`);

    if (specLines.length) {
      lines.push('');
      lines.push(data.moduleType === 'project' ? '📐 PROJECT SPECIFICATIONS:' : '📐 PROPERTY SPECIFICATIONS:');
      lines.push(...specLines);
    }

    // Section 2: Contact Information
    const contactLines = [];
    if (data.owner) {
      const label = data.moduleType === 'project' ? 'Contact Person' : (data.moduleType === 'direct' ? 'Direct Owner / Client' : 'Owner / Representative');
      contactLines.push(`• ${label}: ${data.owner}`);
    }
    if (data.phone) {
      contactLines.push(`• Phone / Mobile: ${data.phone}`);
    }
    if (data.follow) {
      contactLines.push(`• Scheduled Follow-up: ${data.follow}`);
    }

    if (contactLines.length) {
      lines.push('');
      lines.push('👤 CONTACT INFORMATION:');
      lines.push(...contactLines);
    }

    // Section 3: Dynamic Custom Fields
    if (data.customFields && data.customFields.length) {
      lines.push('');
      lines.push('📝 ADDITIONAL DETAILS:');
      data.customFields.forEach(cf => {
        lines.push(`• ${cf.label}: ${cf.value}`);
      });
    }

    // Section 4: Notes & Amenities
    if (data.notes && data.notes.trim()) {
      lines.push('');
      lines.push(data.moduleType === 'project' ? '📌 NOTES & AMENITIES:' : '📌 PROPERTY NOTES:');
      lines.push(data.notes.trim());
    }

    // Section 5: Media & External Links
    const linkLines = [];
    if (data.brochure && data.brochure.trim()) {
      linkLines.push(`• Project Brochure: ${data.brochure.trim()}`);
    }
    if (data.map && data.map.trim()) {
      linkLines.push(`• Google Maps Location: ${data.map.trim()}`);
    }
    if (data.video && data.video.trim()) {
      linkLines.push(`• Video Tour: ${data.video.trim()}`);
    }
    if (data.photo && data.photo.trim() && !data.photo.startsWith('data:image')) {
      // Include image link if it is an accessible URL (not a massive raw base64 data URI)
      linkLines.push(`• Property Photo: ${data.photo.trim()}`);
    }

    if (linkLines.length) {
      lines.push('');
      lines.push('🔗 LINKS & MEDIA:');
      lines.push(...linkLines);
    }

    lines.push('');
    lines.push('— Shared via Property Manager Pro');

    return lines.join('\n');
  }

  /**
   * Fallback clipboard copy using standard navigator.clipboard or execCommand.
   */
  async function copyToClipboard(text) {
    if (!text) return false;

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Continue to execCommand fallback
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (e) {
      return false;
    }
  }

  /**
   * Helper to display user notification toast using app's toast() function.
   */
  function showFeedback(msg) {
    if (typeof toast === 'function') {
      toast(msg);
    } else {
      console.log(msg);
    }
  }

  /**
   * Copies formatted complete property details to clipboard.
   */
  async function copyPropertyDetails(propertyOrId, moduleHint) {
    const text = buildPropertyShareText(propertyOrId, moduleHint);
    if (!text) {
      showFeedback('⚠️ Unable to find property details to copy.');
      return false;
    }

    const copied = await copyToClipboard(text);
    if (copied) {
      showFeedback('📋 Complete property details copied to clipboard!');
      return true;
    } else {
      showFeedback('⚠️ Unable to copy details to clipboard.');
      return false;
    }
  }

  /**
   * Native Share API implementation with reliable clipboard fallback.
   */
  async function nativeShareProperty(propertyOrId, moduleHint) {
    const shareData = buildPropertyShareData(propertyOrId, moduleHint);
    if (!shareData) {
      showFeedback('⚠️ Property record not found.');
      return;
    }

    const shareText = buildPropertyShareText(propertyOrId, moduleHint);
    const payload = {
      title: shareData.name,
      text: shareText
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        // User aborted share sheet or unsupported payload
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return; // User cancelled, do not trigger fallback or error
        }
      }
    }

    // Fallback to clipboard
    await copyPropertyDetails(propertyOrId, moduleHint);
  }

  /**
   * Central entry point called wherever a property is displayed.
   */
  function shareProperty(propertyOrId, moduleHint) {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      nativeShareProperty(propertyOrId, moduleHint);
    } else {
      copyPropertyDetails(propertyOrId, moduleHint);
    }
  }

  // Export to global scope
  global.resolveProperty = resolveProperty;
  global.buildPropertyShareData = buildPropertyShareData;
  global.buildPropertyShareText = buildPropertyShareText;
  global.copyPropertyDetails = copyPropertyDetails;
  global.nativeShareProperty = nativeShareProperty;
  global.shareProperty = shareProperty;

})(typeof window !== 'undefined' ? window : globalThis);
