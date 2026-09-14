/**
 * PROPERTY MANAGER PRO — UI MODAL & VIEWER MODULE
 * ===============================================
 * Centralized modal controls, lightboxes, and notice dialogs.
 */

(function(global) {
  'use strict';

  /**
   * Closes active modal dialog by ID and syncs browser back navigation safely.
   */
  function closeModal(id) {
    let el = document.getElementById(id);
    if (!el) return;
    if (id === 'exitConfirmModal') {
      el.classList.remove('show');
      return;
    }
    const hadModalInHistory = (history.state && history.state.modal === id);
    if (hadModalInHistory && !global.isClosingViaHistory && !global.isClosingViaCode) {
      global.isClosingViaCode = true;
      history.back();
    }
    el.classList.remove('show');
  }

  /**
   * Opens image lightbox viewer.
   */
  function openLightbox(src, caption) {
    if (!src) return;
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    if (img) img.src = src;
    if (cap) cap.textContent = caption || '';
    if (modal) modal.classList.add('show');
  }

  /**
   * Closes image lightbox viewer safely.
   */
  function closeLightbox(e) {
    if (!e || e.target.id === 'lightboxModal' || e.target.classList.contains('lightbox-close')) {
      let el = document.getElementById('lightboxModal');
      if (!el) return;
      const hadModalInHistory = (history.state && history.state.modal === 'lightboxModal');
      if (hadModalInHistory && !global.isClosingViaHistory && !global.isClosingViaCode) {
        global.isClosingViaCode = true;
        history.back();
      }
      el.classList.remove('show');
    }
  }

  /**
   * Safe delete action from detail modals (property, direct, upcoming).
   * Prompts for confirmation. Canceling keeps modal open with zero side-effects.
   * Confirming deletes the record, safely dismisses modal, and preserves active tab.
   */
  function handleDetailDelete(type, id) {
    let targetRecord = null;
    let label = 'Property';
    if (type === 'property') {
      targetRecord = (global.data || []).find(x => x.id === id);
      label = 'Property';
    } else if (type === 'direct') {
      targetRecord = (global.directData || []).find(x => x.id === id);
      label = 'Direct Property';
    } else if (type === 'upcoming') {
      targetRecord = (global.upcomingData || []).find(x => x.id === id);
      label = 'Upcoming Project';
    }

    if (!targetRecord) return;
    if (!confirm(`Delete ${label} "${targetRecord.name}"? It will be moved to Recently Deleted (kept for 5 days).`)) {
      return;
    }

    let activePage = global.currentPage || (type === 'upcoming' ? 'upcoming' : (type === 'direct' ? 'directProperty' : 'properties'));

    if (type === 'property') {
      global.data = (global.data || []).filter(x => x.id !== id);
      if (typeof global.save === 'function') global.save();
      if (typeof global.moveToRecentlyDeleted === 'function') global.moveToRecentlyDeleted('property', targetRecord);
    } else if (type === 'direct') {
      global.directData = (global.directData || []).filter(x => x.id !== id);
      if (typeof global.saveDirect === 'function') global.saveDirect();
      if (typeof global.moveToRecentlyDeleted === 'function') global.moveToRecentlyDeleted('direct', targetRecord);
    } else if (type === 'upcoming') {
      global.upcomingData = (global.upcomingData || []).filter(x => x.id !== id);
      if (typeof global.saveUpcoming === 'function') global.saveUpcoming();
      if (typeof global.moveToRecentlyDeleted === 'function') global.moveToRecentlyDeleted('upcoming', targetRecord);
    }

    let modalId = type === 'upcoming' ? 'projectDetailModal' : 'detailModal';
    closeModal(modalId);

    if (typeof global.currentPage !== 'undefined' && global.currentPage !== activePage && typeof global.showPage === 'function') {
      global.showPage(activePage, false);
    } else if (typeof global.renderAll === 'function') {
      global.renderAll();
    }

    if (typeof global.toast === 'function') {
      global.toast(`${label} moved to Recently Deleted`);
    }
  }

  /**
   * Displays alert / notice modal with custom button action.
   */
  function showNotice(icon, title, subtext, actionBtn) {
    const iconEl = document.getElementById('noticeIcon');
    const titleEl = document.getElementById('noticeTitle');
    const subtextEl = document.getElementById('noticeSubtext');
    const actionsEl = document.getElementById('noticeActions');
    const noticeModal = document.getElementById('actionNoticeModal');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (subtextEl) subtextEl.textContent = subtext;

    if (actionsEl) {
      if (actionBtn) {
        actionsEl.innerHTML = `
          <button class="btn" onclick="closeModal('actionNoticeModal')">Close</button>
          <button class="btn primary" id="noticeCustomBtn">${global.esc ? global.esc(actionBtn.label) : actionBtn.label}</button>
        `;
        const customBtn = document.getElementById('noticeCustomBtn');
        if (customBtn) customBtn.onclick = actionBtn.onClick;
      } else {
        actionsEl.innerHTML = `<button class="btn primary" style="min-width:90px" onclick="closeModal('actionNoticeModal')">OK</button>`;
      }
    }

    if (noticeModal) noticeModal.classList.add('show');
  }

  /**
   * Phone call action from property / project detail modal.
   */
  function handleDetailCall(type, id) {
    let p = type === 'property' ? ((global.data || []).find(x => x.id === id) || (global.directData ? global.directData.find(x => x.id === id) : null)) : (global.upcomingData || []).find(x => x.id === id);
    if (!p) return;
    let telUrl = typeof global.getTelUrl === 'function' ? global.getTelUrl(p.phone) : null;
    if (telUrl) {
      window.location.href = telUrl;
    } else {
      let mod = type === 'upcoming' ? 'Project' : 'Property';
      showNotice('📞', 'Phone Number Available नहीं है', `इस ${mod} में कोई मान्य Phone Number दर्ज नहीं किया गया है।`);
    }
  }

  /**
   * WhatsApp action from property / project detail modal.
   */
  function handleDetailWhatsApp(type, id) {
    let p = type === 'property' ? ((global.data || []).find(x => x.id === id) || (global.directData ? global.directData.find(x => x.id === id) : null)) : (global.upcomingData || []).find(x => x.id === id);
    if (!p) return;
    let waUrl = typeof global.getWhatsAppUrl === 'function' ? global.getWhatsAppUrl(p.phone, `Hi, inquiring about ${p.name || 'property'}`) : null;
    if (waUrl) {
      window.open(waUrl, '_blank');
    } else {
      let mod = type === 'upcoming' ? 'Project' : 'Property';
      showNotice('💬', 'WhatsApp Number Available नहीं है', `इस ${mod} में कोई मान्य WhatsApp Phone Number दर्ज नहीं किया गया है।`);
    }
  }

  /**
   * Google Maps navigation action from detail modal.
   */
  function handleDetailMaps(type, id) {
    let p = type === 'property' ? ((global.data || []).find(x => x.id === id) || (global.directData ? global.directData.find(x => x.id === id) : null)) : (global.upcomingData || []).find(x => x.id === id);
    if (!p) return;
    let map = typeof global.safeUrl === 'function' ? global.safeUrl(p.map) : null;
    if (map) {
      window.open(map, '_blank');
    } else {
      let mod = type === 'upcoming' ? 'Project' : 'Property';
      showNotice('📍', 'Google Maps Location Available नहीं है', `इस ${mod} के लिए कोई मान्य Google Maps URL दर्ज नहीं किया गया है।`);
    }
  }

  /**
   * Image lightbox or Add Image modal trigger from detail modal.
   */
  function handleDetailImage(type, id) {
    let p = type === 'property' ? ((global.data || []).find(x => x.id === id) || (global.directData ? global.directData.find(x => x.id === id) : null)) : (global.upcomingData || []).find(x => x.id === id);
    if (!p) return;
    let photo = (p.photo || '').trim();
    if (photo) {
      openLightbox(photo, p.name);
    } else {
      let mod = type === 'upcoming' ? 'Project' : (p.isDirect ? 'Direct Property' : 'Property');
      showNotice(
        '📷',
        'Image Available नहीं है',
        `इस ${mod} की Image अभी Add नहीं की गई है।`,
        {
          label: '＋ Add Image',
          onClick: () => {
            closeModal('actionNoticeModal');
            if (type === 'upcoming') {
              closeModal('projectDetailModal');
              if (typeof global.openProjectForm === 'function') global.openProjectForm(id, true);
            } else if (p.isDirect || (p.id && p.id.startsWith('dp_'))) {
              closeModal('detailModal');
              if (typeof global.openDirectPropertyForm === 'function') global.openDirectPropertyForm(id, true);
            } else {
              closeModal('detailModal');
              if (typeof global.openForm === 'function') global.openForm(id, true);
            }
          }
        }
      );
    }
  }

  function showNoImageModal(type, id) {
    handleDetailImage(type, id);
  }

  /**
   * Toggles favorite shortlist status from detail modal header.
   */
  function toggleDetailFav(type, id) {
    if (type === 'property') {
      let p = (global.data || []).find(x => x.id === id);
      let isDirect = false;
      if (!p && global.directData) {
        p = global.directData.find(x => x.id === id);
        isDirect = true;
      }
      if (!p) return;
      p.favorite = !p.favorite;
      if (isDirect && typeof global.saveDirect === 'function') global.saveDirect();
      else if (typeof global.save === 'function') global.save();
      if (typeof global.renderAll === 'function') global.renderAll();
      let btn = document.getElementById('dPropFavBtn');
      if (btn) {
        btn.innerHTML = p.favorite ? '★ Shortlisted' : '⭐ Favorite';
        btn.style.background = p.favorite ? '#eff6ff' : '';
        btn.style.color = p.favorite ? '#1d4ed8' : '';
        btn.style.borderColor = p.favorite ? '#93c5fd' : '';
        btn.style.fontWeight = p.favorite ? '700' : '';
      }
      if (typeof global.toast === 'function') {
        global.toast(p.favorite ? (isDirect ? 'Direct Property added to favorites' : 'Property added to favorites') : (isDirect ? 'Direct Property removed from favorites' : 'Property removed from favorites'));
      }
    } else {
      let p = (global.upcomingData || []).find(x => x.id === id);
      if (!p) return;
      p.favorite = !p.favorite;
      if (typeof global.saveUpcoming === 'function') global.saveUpcoming();
      if (typeof global.renderAll === 'function') global.renderAll();
      let btn = document.getElementById('dProjectFavBtn');
      if (btn) {
        btn.innerHTML = p.favorite ? '★ Shortlisted' : '⭐ Favorite';
        btn.style.background = p.favorite ? '#eff6ff' : '';
        btn.style.color = p.favorite ? '#1d4ed8' : '';
        btn.style.borderColor = p.favorite ? '#93c5fd' : '';
        btn.style.fontWeight = p.favorite ? '700' : '';
      }
      if (typeof global.toast === 'function') {
        global.toast(p.favorite ? 'Project added to favorites' : 'Project removed from favorites');
      }
    }
  }

  // Export to global scope
  global.closeModal = closeModal;
  global.openLightbox = openLightbox;
  global.closeLightbox = closeLightbox;
  global.showNotice = showNotice;
  global.handleDetailCall = handleDetailCall;
  global.handleDetailWhatsApp = handleDetailWhatsApp;
  global.handleDetailMaps = handleDetailMaps;
  global.handleDetailImage = handleDetailImage;
  global.showNoImageModal = showNoImageModal;
  global.toggleDetailFav = toggleDetailFav;
  global.handleDetailDelete = handleDetailDelete;

})(typeof window !== 'undefined' ? window : globalThis);
