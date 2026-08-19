/**
 * MILK & MEADOW — Vanilla JavaScript Core Engine
 * Handles Cart Management, LocalStorage Persistence, Category Filtering,
 * Live Countdown, Lightbox, Reviews Carousel, Stat Counters & Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. Initial Loading Screen
  // --------------------------------------------------------------------------
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('fade-out');
    }, 450);
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

    // Back to Top button visibility
    if (scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }

    // Active Navigation Highlighting
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
  // 4. Live Offer Countdown Timer
  // --------------------------------------------------------------------------
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');

  let remainingSeconds = (4 * 3600) + (32 * 60) + 48; // 4 hours, 32 mins, 48 secs

  const countdownTimer = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(countdownTimer);
      return;
    }
    remainingSeconds--;

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMins) cdMins.textContent = String(minutes).padStart(2, '0');
    if (cdSecs) cdSecs.textContent = String(seconds).padStart(2, '0');
  }, 1000);

  // --------------------------------------------------------------------------
  // 5. Interactive Category Filter (No Page Reload)
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  function applyProductFilter(category) {
    // Update active filter button
    filterBtns.forEach(btn => {
      const match = btn.getAttribute('data-filter') === category;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    // Show/hide product cards
    productCards.forEach(card => {
      const itemCat = card.getAttribute('data-category');
      if (category === 'all' || itemCat === category) {
        card.classList.remove('hide-card');
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 30);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        setTimeout(() => {
          card.classList.add('hide-card');
        }, 250);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCat = btn.getAttribute('data-filter');
      applyProductFilter(selectedCat);
    });
  });

  // Allow clicking category card link to filter
  document.querySelectorAll('.cat-btn').forEach(catBtn => {
    catBtn.addEventListener('click', (e) => {
      const filter = catBtn.getAttribute('data-filter');
      if (filter) applyProductFilter(filter);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Shopping Cart System with LocalStorage & Sliding Drawer
  // --------------------------------------------------------------------------
  let cart = JSON.parse(localStorage.getItem('milkandmeadow_cart')) || [];

  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const navCartBtn = document.getElementById('navCartBtn');
  const floatingCartBtn = document.getElementById('floatingCartBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const emptyCartState = document.getElementById('emptyCartState');
  const cartCountNav = document.getElementById('cartCountNav');
  const floatingCartCount = document.getElementById('floatingCartCount');
  const cartItemCountLabel = document.getElementById('cartItemCountLabel');

  const billSubtotal = document.getElementById('billSubtotal');
  const billGrandTotal = document.getElementById('billGrandTotal');
  const checkoutBtnTotal = document.getElementById('checkoutBtnTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  function showToast(msg) {
    if (!toastNotification) return;
    toastMessage.textContent = msg;
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

  const emptyCartShopBtn = document.getElementById('emptyCartShopBtn');
  if (emptyCartShopBtn) {
    emptyCartShopBtn.addEventListener('click', closeCartDrawer);
  }

  function saveAndRenderCart() {
    localStorage.setItem('milkandmeadow_cart', JSON.stringify(cart));
    renderCartUI();
  }

  function renderCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartCountNav) cartCountNav.textContent = totalCount;
    if (floatingCartCount) floatingCartCount.textContent = totalCount;
    if (cartItemCountLabel) cartItemCountLabel.textContent = `(${totalCount} Items)`;

    if (billSubtotal) billSubtotal.textContent = `₹${subtotal}`;
    if (billGrandTotal) billGrandTotal.textContent = `₹${subtotal}`;
    if (checkoutBtnTotal) checkoutBtnTotal.textContent = subtotal;

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
            <div class="cart-qty-pill">
              <button class="cart-qty-btn dec-btn" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn inc-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Handle Add to Cart Clicks Globally
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const id = addBtn.getAttribute('data-id');
      const name = addBtn.getAttribute('data-name');
      const price = parseFloat(addBtn.getAttribute('data-price'));
      const img = addBtn.getAttribute('data-img');

      const existingIndex = cart.findIndex(i => i.id === id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({ id, name, price, img, qty: 1 });
      }

      saveAndRenderCart();
      showToast(`${name} added to your basket! 🥛`);
    }

    // Cart Quantity Increment
    if (e.target.classList.contains('inc-btn')) {
      const id = e.target.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty += 1;
        saveAndRenderCart();
      }
    }

    // Cart Quantity Decrement
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

  // Subscription Buttons Handler
  document.querySelectorAll('.sub-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      showToast(`Selected ${plan}! Setting up daily delivery... 📅`);
      setTimeout(() => {
        openCartDrawer();
      }, 500);
    });
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        showToast('Redirecting to contactless checkout... 🌿');
        setTimeout(() => {
          alert('Thank you for choosing pure milk! Your morning delivery order has been placed successfully.');
          cart = [];
          saveAndRenderCart();
          closeCartDrawer();
        }, 1200);
      }
    });
  }

  // Initial cart render
  renderCartUI();

  // --------------------------------------------------------------------------
  // 7. Fullscreen Gallery Lightbox
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
    updateLightboxUI();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightboxUI() {
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
      updateLightboxUI();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
      updateLightboxUI();
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
  // 8. Testimonials / Reviews Carousel
  // --------------------------------------------------------------------------
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewSlides = document.querySelectorAll('.review-slide');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');
  const sliderDotsContainer = document.getElementById('sliderDots');

  let currentReview = 0;
  const totalReviews = reviewSlides.length;

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

  function updateReviewSlider() {
    if (!reviewsTrack) return;
    reviewsTrack.style.transform = `translateX(-${currentReview * 100}%)`;

    const dots = document.querySelectorAll('.carousel-dots .dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentReview);
    });
  }

  function goToReview(index) {
    currentReview = index;
    updateReviewSlider();
  }

  if (sliderPrev) {
    sliderPrev.addEventListener('click', () => {
      currentReview = (currentReview - 1 + totalReviews) % totalReviews;
      updateReviewSlider();
    });
  }

  if (sliderNext) {
    sliderNext.addEventListener('click', () => {
      currentReview = (currentReview + 1) % totalReviews;
      updateReviewSlider();
    });
  }

  // Autoplay Testimonial Carousel
  let reviewInterval = setInterval(() => {
    currentReview = (currentReview + 1) % totalReviews;
    updateReviewSlider();
  }, 6000);

  const reviewsWrapper = document.querySelector('.reviews-carousel-wrapper');
  if (reviewsWrapper) {
    reviewsWrapper.addEventListener('mouseenter', () => clearInterval(reviewInterval));
    reviewsWrapper.addEventListener('mouseleave', () => {
      reviewInterval = setInterval(() => {
        currentReview = (currentReview + 1) % totalReviews;
        updateReviewSlider();
      }, 6000);
    });
  }

  // --------------------------------------------------------------------------
  // 9. Intersection Observer (Scroll Reveal & Statistics Counter)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-el');
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsTriggered = false;

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => scrollObserver.observe(el));

  // Statistics Counter Animation
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsTriggered) {
        statsTriggered = true;
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
  }, { threshold: 0.25 });

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

      const nameInput = document.getElementById('cName');
      const phoneInput = document.getElementById('cPhone');
      const emailInput = document.getElementById('cEmail');
      const msgInput = document.getElementById('cMessage');

      // Name Check
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group').classList.remove('has-error');
      }

      // Phone Check (10 digits)
      const phoneClean = phoneInput.value.trim().replace(/\D/g, '');
      if (phoneClean.length < 10) {
        phoneInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        phoneInput.closest('.form-group').classList.remove('has-error');
      }

      // Email Check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        emailInput.closest('.form-group').classList.remove('has-error');
      }

      // Message Check
      if (msgInput.value.trim().length < 10) {
        msgInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      } else {
        msgInput.closest('.form-group').classList.remove('has-error');
      }

      if (isValid) {
        const submitBtn = document.getElementById('submitFormBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Enquiry... 🌿';

        setTimeout(() => {
          showToast('Thank you! Your enquiry has been received. 🥛');
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Enquiry 🥛';
        }, 1200);
      }
    });
  }

});