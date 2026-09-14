/**
 * PROPERTY MANAGER PRO — PROFILE & ONBOARDING MODULE
 * ==================================================
 * Manager identity, agency details, avatar processing, and first-time setup flow.
 */

(function(global) {
  'use strict';

  function renderProfile() {
    if (typeof global.loadProfile === 'function') {
      global.currentProfile = global.loadProfile();
    }
    if (typeof global.updateProfileAvatars === 'function') {
      global.updateProfileAvatars();
    }

    let p = global.currentProfile || {};

    let nameEl = document.getElementById('profileDisplayName');
    if (nameEl) nameEl.textContent = p.name || 'Munendra Singh';

    let roleEl = document.getElementById('profileDisplayRole');
    if (roleEl) roleEl.textContent = p.role || 'Property Manager';

    // Personal Information
    let infoNameEl = document.getElementById('infoName');
    if (infoNameEl) infoNameEl.textContent = p.name || '—';

    let infoPhoneEl = document.getElementById('infoPhone');
    if (infoPhoneEl) infoPhoneEl.textContent = p.phone || '—';

    let infoEmailEl = document.getElementById('infoEmail');
    if (infoEmailEl) infoEmailEl.textContent = p.email || '—';

    let infoCompanyEl = document.getElementById('infoCompany');
    if (infoCompanyEl) infoCompanyEl.textContent = p.company || '—';

    // My Activity - Dynamically calculated from CRM data
    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];

    let actPropsEl = document.getElementById('actProps');
    if (actPropsEl) actPropsEl.textContent = dataList.length;

    let actProjectsEl = document.getElementById('actProjects');
    if (actProjectsEl) actProjectsEl.textContent = upList.length;

    let actFavsEl = document.getElementById('actFavs');
    if (actFavsEl) {
      let propFavCount = dataList.filter(x => x.favorite).length;
      let directFavCount = directList.filter(x => x.favorite).length;
      let upFavCount = upList.filter(u => u.favorite).length;
      actFavsEl.textContent = propFavCount + directFavCount + upFavCount;
    }

    let actFollowsEl = document.getElementById('actFollows');
    if (actFollowsEl) {
      let propFollow = dataList.filter(x => x.follow).length;
      let directFollow = directList.filter(x => x.follow).length;
      actFollowsEl.textContent = propFollow + directFollow;
    }
  }

  function openProfileModal() {
    if (typeof global.loadProfile === 'function') {
      global.currentProfile = global.loadProfile();
    }
    let p = global.currentProfile || {};

    let nameInput = document.getElementById('editProfileName');
    let roleInput = document.getElementById('editProfileRole');
    let phoneInput = document.getElementById('editProfilePhone');
    let emailInput = document.getElementById('editProfileEmail');
    let compInput = document.getElementById('editProfileCompany');
    let urlInput = document.getElementById('editProfilePhotoUrl');
    let fileInput = document.getElementById('editProfilePhotoFile');

    if (nameInput) nameInput.value = p.name || '';
    if (roleInput) roleInput.value = p.role || 'Property Manager';
    if (phoneInput) phoneInput.value = p.phone || '';
    if (emailInput) emailInput.value = p.email || '';
    if (compInput) compInput.value = p.company || '';
    if (urlInput) urlInput.value = p.photo && !p.photo.startsWith('data:') ? p.photo : '';
    if (fileInput) fileInput.value = '';

    global.profileTempPhoto = p.photo || '';
    updateProfilePhotoPreview(global.profileTempPhoto);

    let modal = document.getElementById('editProfileModal');
    if (modal) modal.classList.add('show');
  }

  function updateProfilePhotoPreview(src) {
    const wrap = document.getElementById('editProfilePhotoPreviewWrap');
    const img = document.getElementById('editProfilePhotoPreview');
    if (wrap && img) {
      if (src && typeof src === 'string' && src.trim()) {
        img.onerror = function() {
          this.onerror = null;
          this.src = '';
          wrap.style.display = 'none';
        };
        img.onload = function() {
          wrap.style.display = 'flex';
        };
        img.src = src.trim();
        wrap.style.display = 'flex';
      } else {
        img.onerror = null;
        img.onload = null;
        img.src = '';
        wrap.style.display = 'none';
      }
    }
  }

  async function handleProfilePhotoUpload(inputOrFile) {
    const file = (inputOrFile instanceof File) ? inputOrFile : (inputOrFile?.files && inputOrFile.files[0]);
    const fileInput = document.getElementById('editProfilePhotoFile');

    if (!file) return;

    if (typeof global.isValidImageFile === 'function' && !global.isValidImageFile(file)) {
      global.toast('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      if (fileInput) fileInput.value = '';
      return;
    }

    let blobUrl = '';
    try {
      blobUrl = URL.createObjectURL(file);
      updateProfilePhotoPreview(blobUrl);
    } catch (e) {}

    try {
      const dataUrl = await global.compressImage(file, 400, 400, 0.85);
      global.profileTempPhoto = dataUrl;
      updateProfilePhotoPreview(dataUrl);

      if (blobUrl && blobUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(blobUrl); } catch (e) {}
      }

      global.currentProfile = {
        ...global.currentProfile,
        photo: dataUrl
      };
      if (typeof global.saveProfile === 'function') global.saveProfile(global.currentProfile);
      if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
      global.toast('Profile photo updated');
    } catch (err) {
      console.error('Error processing profile photo:', err);
      global.toast(err.message || 'Failed to read image file');
      if (blobUrl && blobUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(blobUrl); } catch (e) {}
      }
      if (!global.profileTempPhoto) {
        updateProfilePhotoPreview('');
      }
      if (fileInput) fileInput.value = '';
    }
  }

  function handleProfileUrlInput(val) {
    let cleanVal = (val || '').trim();
    if (cleanVal) {
      global.profileTempPhoto = cleanVal;
      updateProfilePhotoPreview(cleanVal);
      global.currentProfile = {
        ...global.currentProfile,
        photo: cleanVal
      };
      if (typeof global.saveProfile === 'function') global.saveProfile(global.currentProfile);
      if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
    } else if (!document.getElementById('editProfilePhotoFile')?.files?.length) {
      global.profileTempPhoto = '';
      updateProfilePhotoPreview('');
      global.currentProfile = {
        ...global.currentProfile,
        photo: ''
      };
      if (typeof global.saveProfile === 'function') global.saveProfile(global.currentProfile);
      if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
    }
  }

  function removeProfilePhoto() {
    global.profileTempPhoto = '';
    let fileInput = document.getElementById('editProfilePhotoFile');
    let urlInput = document.getElementById('editProfilePhotoUrl');
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    updateProfilePhotoPreview('');

    global.currentProfile = {
      ...global.currentProfile,
      photo: ''
    };
    if (typeof global.saveProfile === 'function') global.saveProfile(global.currentProfile);
    if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
    global.toast('Profile photo removed');
  }

  function saveProfileForm() {
    let name = (document.getElementById('editProfileName')?.value || '').trim() || 'Munendra Singh';
    let role = (document.getElementById('editProfileRole')?.value || '').trim() || 'Property Manager';
    let phone = (document.getElementById('editProfilePhone')?.value || '').trim();
    let email = (document.getElementById('editProfileEmail')?.value || '').trim();
    let company = (document.getElementById('editProfileCompany')?.value || '').trim();

    global.currentProfile = {
      ...global.currentProfile,
      name,
      role,
      phone,
      email,
      company,
      photo: global.profileTempPhoto
    };
    if (typeof global.saveProfile === 'function') global.saveProfile(global.currentProfile);
    renderProfile();
    global.closeModal('editProfileModal');
    global.toast('Profile updated successfully');
  }

  // ==================== FIRST-TIME ONBOARDING SETUP HANDLERS ====================

  function openProfileSetupModal() {
    let nameInput = document.getElementById('setupProfileName');
    let roleInput = document.getElementById('setupProfileRole');
    let phoneInput = document.getElementById('setupProfilePhone');
    let emailInput = document.getElementById('setupProfileEmail');
    let compInput = document.getElementById('setupProfileCompany');
    let urlInput = document.getElementById('setupProfilePhotoUrl');
    let fileInput = document.getElementById('setupProfilePhotoFile');

    if (nameInput) nameInput.value = '';
    if (roleInput) roleInput.value = 'Property Manager';
    if (phoneInput) phoneInput.value = '';
    if (emailInput) emailInput.value = '';
    if (compInput) compInput.value = '';
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';

    global.setupTempPhoto = '';
    updateSetupPhotoPreview('');

    let modal = document.getElementById('profileSetupModal');
    if (modal) modal.classList.add('show');
  }

  function updateSetupPhotoPreview(src) {
    const wrap = document.getElementById('setupProfilePhotoPreviewWrap');
    const img = document.getElementById('setupProfilePhotoPreview');
    if (wrap && img) {
      if (src && typeof src === 'string' && src.trim()) {
        img.onerror = function() {
          this.onerror = null;
          this.src = '';
          wrap.style.display = 'none';
        };
        img.onload = function() {
          wrap.style.display = 'flex';
        };
        img.src = src.trim();
        wrap.style.display = 'flex';
      } else {
        img.onerror = null;
        img.onload = null;
        img.src = '';
        wrap.style.display = 'none';
      }
    }
  }

  async function handleSetupPhotoUpload(inputOrFile) {
    const file = (inputOrFile instanceof File) ? inputOrFile : (inputOrFile?.files && inputOrFile.files[0]);
    const fileInput = document.getElementById('setupProfilePhotoFile');

    if (!file) return;

    if (typeof global.isValidImageFile === 'function' && !global.isValidImageFile(file)) {
      global.toast('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      if (fileInput) fileInput.value = '';
      return;
    }

    let blobUrl = '';
    try {
      blobUrl = URL.createObjectURL(file);
      updateSetupPhotoPreview(blobUrl);
    } catch (e) {}

    try {
      const dataUrl = await global.compressImage(file, 400, 400, 0.85);
      global.setupTempPhoto = dataUrl;
      updateSetupPhotoPreview(dataUrl);
      if (blobUrl && blobUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(blobUrl); } catch (e) {}
      }
      global.toast('Profile photo selected');
    } catch (err) {
      console.error('Error processing setup profile photo:', err);
      global.toast(err.message || 'Failed to read image file');
      if (blobUrl && blobUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(blobUrl); } catch (e) {}
      }
      if (!global.setupTempPhoto) {
        updateSetupPhotoPreview('');
      }
      if (fileInput) fileInput.value = '';
    }
  }

  function handleSetupPhotoUrlInput(val) {
    let cleanVal = (val || '').trim();
    if (cleanVal) {
      global.setupTempPhoto = cleanVal;
      updateSetupPhotoPreview(cleanVal);
    } else if (!document.getElementById('setupProfilePhotoFile')?.files?.length) {
      global.setupTempPhoto = '';
      updateSetupPhotoPreview('');
    }
  }

  function removeSetupPhoto() {
    global.setupTempPhoto = '';
    let fileInput = document.getElementById('setupProfilePhotoFile');
    let urlInput = document.getElementById('setupProfilePhotoUrl');
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    updateSetupPhotoPreview('');
    global.toast('Profile photo removed');
  }

  function saveFirstTimeProfile() {
    let nameInput = document.getElementById('setupProfileName');
    let name = (nameInput?.value || '').trim();

    if (!name) {
      global.toast('Please enter your Full Name to continue.');
      if (nameInput) {
        nameInput.focus();
        nameInput.style.borderColor = 'var(--danger)';
        setTimeout(() => { if (nameInput) nameInput.style.borderColor = ''; }, 2500);
      }
      return;
    }

    let role = (document.getElementById('setupProfileRole')?.value || '').trim() || 'Property Manager';
    let phone = (document.getElementById('setupProfilePhone')?.value || '').trim();
    let email = (document.getElementById('setupProfileEmail')?.value || '').trim();
    let company = (document.getElementById('setupProfileCompany')?.value || '').trim();

    let newProfile = {
      ...(global.defaultProfile || {}),
      name,
      role,
      phone,
      email,
      company,
      photo: global.setupTempPhoto || '',
      setupCompleted: true
    };

    if (typeof global.saveProfile === 'function') global.saveProfile(newProfile);
    try {
      localStorage.setItem(global.PROFILE_SETUP_KEY || 'property_manager_pro_setup_completed_v1', 'true');
    } catch (e) {}

    global.currentProfile = newProfile;
    renderProfile();
    if (typeof global.updateProfileAvatars === 'function') global.updateProfileAvatars();
    global.closeModal('profileSetupModal');
    if (typeof global.showPage === 'function') global.showPage('dashboard');
    global.toast(`Welcome to Property Manager, ${name}!`);
  }

  function skipProfileSetup() {
    try {
      localStorage.setItem(global.PROFILE_SETUP_KEY || 'property_manager_pro_setup_completed_v1', 'true');
    } catch (e) {}
    global.closeModal('profileSetupModal');
    if (typeof global.showPage === 'function') global.showPage('dashboard');
    global.toast('You can complete your profile anytime from Profile → Edit Profile.');
  }

  function handleMobileSearchNav() {
    if (typeof global.showPage === 'function') global.showPage('properties');
    setTimeout(() => {
      let s = document.getElementById('search');
      if (s) {
        s.focus();
        s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Export to global scope
  global.renderProfile = renderProfile;
  global.openProfileModal = openProfileModal;
  global.updateProfilePhotoPreview = updateProfilePhotoPreview;
  global.handleProfilePhotoUpload = handleProfilePhotoUpload;
  global.handleProfileUrlInput = handleProfileUrlInput;
  global.removeProfilePhoto = removeProfilePhoto;
  global.saveProfileForm = saveProfileForm;
  global.openProfileSetupModal = openProfileSetupModal;
  global.updateSetupPhotoPreview = updateSetupPhotoPreview;
  global.handleSetupPhotoUpload = handleSetupPhotoUpload;
  global.handleSetupPhotoUrlInput = handleSetupPhotoUrlInput;
  global.removeSetupPhoto = removeSetupPhoto;
  global.saveFirstTimeProfile = saveFirstTimeProfile;
  global.skipProfileSetup = skipProfileSetup;
  global.handleMobileSearchNav = handleMobileSearchNav;

})(typeof window !== 'undefined' ? window : globalThis);
