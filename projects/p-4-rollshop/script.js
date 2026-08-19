/**
 * ROLL HOUSE — Interactive JavaScript Engine
 * Handles cart state, live countdown timer, dynamic menu filtering,
 * modal lightbox, review slider, counters, and scroll events.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. Loading Screen Animation
  // --------------------------------------------------------------------------
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('fade-out');
    }, 400);
  });

  // --------------------------------------------------------------------------
  // 2. Navigation, Sticky Shrink & Scroll Spy
  // --------------------------------------------------------------------------
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Shrink header on scroll
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Show / Hide Back to top button
    if (scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }

    // Active link highlighting via scroll spy
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Navigation Drawer
  // --------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-link, #mobileOrderBtn');

  function openMobileDrawer() {
    mobileDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // --------------------------------------------------------------------------
  // 4. Deal Countdown Timer (Dynamic)
  // --------------------------------------------------------------------------
  const dealHoursEl = document.getElementById('dealHours');
  const dealMinsEl = document.getElementById('dealMins');
  const dealSecsEl = document.getElementById('dealSecs');

  let countdownTime = (3 * 3600) + (45 * 60) + 20; // 3h 45m 20s

  const countdownInterval = setInterval(() => {
    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      return;
    }
    countdownTime--;

    const hours = Math.floor(countdownTime / 3600);
    const minutes = Math.floor((countdownTime % 3600) / 60);
    const seconds = countdownTime % 60;

    if (dealHoursEl) dealHoursEl.textContent = String(hours).padStart(2, '0');
    if (dealMinsEl) dealMinsEl.textContent = String(minutes).padStart(2, '0');
    if (dealSecsEl) dealSecsEl.textContent = String(seconds).padStart(2, '0');
  }, 1000);

  // --------------------------------------------------------------------------
  // 5. Dynamic Category Filtering (Menu)
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      menuItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.classList.remove('hide');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 30);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          setTimeout(() => {
            item.classList.add('hide');
          }, 250);
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 6. Cart System with LocalStorage & Sliding Drawer
  // --------------------------------------------------------------------------
  let cart = JSON.parse(localStorage.getItem('rollhouse_cart')) || [];

  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const navCartBtn = document.getElementById('navCartBtn');
  const floatingCartBtn = document.getElementById('floatingCartBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const emptyCartState = document.getElementById('emptyCartState');
  const cartCountNav = document.getElementById('cartCountNav');
  const floatingCartCount = document.getElementById('floatingCartCount');
  const cartItemsCountText = document.getElementById('cartItemsCountText');

  const billSubtotal = document.getElementById('billSubtotal');
  const billTaxes = document.getElementById('billTaxes');
  const billGrandTotal = document.getElementById('billGrandTotal');
  const checkoutBtnTotal = document.getElementById('checkoutBtnTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const toastNotification = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');

  function showToast(message) {
    if (!toastNotification) return;
    toastMsg.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  function openCartDrawer() {
    cartDrawer.classList.add('active');
    cartBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    cartBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navCartBtn) navCartBtn.addEventListener('click', openCartDrawer);
  if (floatingCartBtn) floatingCartBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  const emptyCartExploreBtn = document.getElementById('emptyCartExploreBtn');
  if (emptyCartExploreBtn) {
    emptyCartExploreBtn.addEventListener('click', closeCartDrawer);
  }

  function saveAndRenderCart() {
    localStorage.setItem('rollhouse_cart', JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxAndPackaging = subtotal > 0 ? Math.round(subtotal * 0.05) + 15 : 0;
    const deliveryFee = subtotal > 0 ? 30 : 0;
    const grandTotal = subtotal + taxAndPackaging + deliveryFee;

    // Update Counts
    if (cartCountNav) cartCountNav.textContent = totalQuantity;
    if (floatingCartCount) floatingCartCount.textContent = totalQuantity;
    if (cartItemsCountText) cartItemsCountText.textContent = `(${totalQuantity} Items)`;

    // Update Bill
    if (billSubtotal) billSubtotal.textContent = `₹${subtotal}`;
    if (billTaxes) billTaxes.textContent = `₹${taxAndPackaging}`;
    if (billGrandTotal) billGrandTotal.textContent = `₹${grandTotal}`;
    if (checkoutBtnTotal) checkoutBtnTotal.textContent = grandTotal;

    // Render Items
    if (cart.length === 0) {
      if (emptyCartState) emptyCartState.style.display = 'block';
      if (cartItemsList) cartItemsList.innerHTML = '';
      if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
      if (emptyCartState) emptyCartState.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = false;
      if (cartItemsList) {
        cartItemsList.innerHTML = cart.map(item => `
          <div class="cart-item-row" data-id="${item.id}">
            <img src="${item.img}" alt="${item.name}" class="cart-item-thumb">
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.name}</h4>
              <span class="cart-item-price">₹${item.price}</span>
            </div>
            <div class="cart-qty-controls">
              <button class="qty-btn dec-btn" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn inc-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Handle Add To Cart Clicks
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const id = addBtn.getAttribute('data-id');
      const name = addBtn.getAttribute('data-name');
      const price = parseFloat(addBtn.getAttribute('data-price'));
      const img = addBtn.getAttribute('data-img');

      const existingIndex = cart.findIndex(item => item.id === id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({ id, name, price, img, qty: 1 });
      }

      saveAndRenderCart();
      showToast(`${name} added to tray! 🌯`);
    }

    // Handle Quantity Increments in Cart
    if (e.target.classList.contains('inc-btn')) {
      const id = e.target.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty += 1;
        saveAndRenderCart();
      }
    }

    // Handle Quantity Decrements in Cart
    if (e.target.classList.contains('dec-btn')) {
      const id = e.target.getAttribute('data-id');
      const itemIndex = cart.findIndex(i => i.id === id);
      if (itemIndex > -1) {
        if (cart[itemIndex].qty > 1) {
          cart[itemIndex].qty -= 1;
        } else {
          cart.splice(itemIndex, 1);
        }
        saveAndRenderCart();
      }
    }
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        showToast('Redirecting to secure payment... 🔥');
        setTimeout(() => {
          alert('Order Confirmed! Your hot & fresh Kathi Rolls are being prepared.');
          cart = [];
          saveAndRenderCart();
          closeCartDrawer();
        }, 1200);
      }
    });
  }

  // Initial cart render
  renderCart();

  // --------------------------------------------------------------------------
  // 7. Gallery Lightbox Modal
  // --------------------------------------------------------------------------
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  const galleryData = Array.from(galleryItems).map(item => ({
    src: item.getAttribute('data-src'),
    caption: item.getAttribute('data-caption')
  }));

  function openLightbox(index) {
    currentGalleryIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const data = galleryData[currentGalleryIndex];
    if (lightboxImg && data) {
      lightboxImg.src = data.src;
      lightboxCaption.textContent = data.caption;
    }
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
      updateLightbox();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
      updateLightbox();
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
      if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    }
  });

  // --------------------------------------------------------------------------
  // 8. Testimonials / Reviews Slider
  // --------------------------------------------------------------------------
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewCards = document.querySelectorAll('.review-card');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');
  const sliderDotsContainer = document.getElementById('sliderDots');

  let currentReview = 0;
  const totalReviews = reviewCards.length;

  if (sliderDotsContainer && totalReviews > 0) {
    sliderDotsContainer.innerHTML = '';
    for (let i = 0; i < totalReviews; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToReview(i));
      sliderDotsContainer.appendChild(dot);
    }
  }

  function updateSlider() {
    if (!reviewsTrack) return;
    reviewsTrack.style.transform = `translateX(-${currentReview * 100}%)`;

    const dots = document.querySelectorAll('.slider-dots .dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentReview);
    });
  }

  function goToReview(index) {
    currentReview = index;
    updateSlider();
  }

  if (sliderPrev) {
    sliderPrev.addEventListener('click', () => {
      currentReview = (currentReview - 1 + totalReviews) % totalReviews;
      updateSlider();
    });
  }

  if (sliderNext) {
    sliderNext.addEventListener('click', () => {
      currentReview = (currentReview + 1) % totalReviews;
      updateSlider();
    });
  }

  // Autoplay Slider
  let sliderInterval = setInterval(() => {
    currentReview = (currentReview + 1) % totalReviews;
    updateSlider();
  }, 6000);

  const sliderWrapper = document.querySelector('.reviews-slider-wrapper');
  if (sliderWrapper) {
    sliderWrapper.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    sliderWrapper.addEventListener('mouseleave', () => {
      sliderInterval = setInterval(() => {
        currentReview = (currentReview + 1) % totalReviews;
        updateSlider();
      }, 6000);
    });
  }

  // --------------------------------------------------------------------------
  // 9. Intersection Observer for Scroll Reveals & Number Counters
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-el');
  const statNumbers = document.querySelectorAll('.stat-num');
  let animatedStats = false;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Counter Animation Observer
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedStats) {
        animatedStats = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const duration = 2000;
          const stepTime = 20;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.textContent = target.toLocaleString('en-IN');
              clearInterval(timer);
            } else {
              stat.textContent = Math.floor(current).toLocaleString('en-IN');
            }
          }, stepTime);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) statsObserver.observe(aboutSection);

  // --------------------------------------------------------------------------
  // 10. Contact Form Validation
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('contactName');
      const phoneInput = document.getElementById('contactPhone');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');

      // Name check
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('error');
      }

      // Phone check (10 digits)
      const phoneVal = phoneInput.value.trim().replace(/\D/g, '');
      if (phoneVal.length < 10) {
        phoneInput.closest('.form-group').classList.add('error');
        isValid = false;
      } else {
        phoneInput.closest('.form-group').classList.remove('error');
      }

      // Email check (optional but validated if entered)
      if (emailInput.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('error');
        isValid = false;
      } else {
        emailInput.closest('.form-group').classList.remove('error');
      }

      // Message check
      if (!messageInput.value.trim()) {
        messageInput.closest('.form-group').classList.add('error');
        isValid = false;
      } else {
        messageInput.closest('.form-group').classList.remove('error');
      }

      if (isValid) {
        const submitBtn = document.getElementById('submitFormBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Message... 🚀';

        setTimeout(() => {
          showToast('Thank you! Your message has been received.');
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message 🚀';
        }, 1200);
      }
    });
  }

});