/**
 * ROYAL SPICE - MAIN JAVASCRIPT BUNDLE
 * Features: Pure Vanilla JS, Zero External Libraries.
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initActiveNavSpy();
  initMenuFilter();
  initCartSystem();
  initReservationForm();
  initTestimonialSlider();
  initFaqAccordion();
  initOfferCountdown();
  initGalleryLightbox();
  initScrollAnimations();
  initStatsCounter();
  initContactForm();
  initBackToTop();
  initMobileMoreSheet();
});

/* ==========================================================================
   1. STICKY NAVBAR & ACTIVE SPY
   ========================================================================== */
function initStickyNav() {
  const header = document.getElementById('desktopHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav-links .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item');

  function updateActiveLink() {
    const scrollY = window.pageYOffset + 200;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        // Desktop
        desktopLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });

        // Mobile
        mobileLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-target') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

/* ==========================================================================
   2. MENU FILTERING SYSTEM
   ========================================================================== */
const MENU_DATABASE = [
  { id: 'm1', name: 'Paneer Malai Tikka', cat: 'starters', type: 'veg', price: 299, rating: '4.9', img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=80', desc: 'Creamy marinated paneer char-roasted in tandoor with aromatic cardamom.' },
  { id: 'm2', name: 'Chicken Seekh Kebab', cat: 'starters', type: 'non-veg', price: 349, rating: '4.8', img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80', desc: 'Succulent minced chicken skewers seasoned with ginger, green chillies & cilantro.' },
  { id: 'm3', name: 'Dal Makhani', cat: 'main-course', type: 'veg', price: 269, rating: '5.0', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80', desc: 'Black lentils slow cooked overnight on charcoal with butter and fresh cream.' },
  { id: 'm4', name: 'Shahi Butter Chicken', cat: 'main-course', type: 'non-veg', price: 359, rating: '4.9', img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80', desc: 'Tender chicken simmered in rich satin tomato and cashew butter sauce.' },
  { id: 'm5', name: 'Hyderabadi Mutton Biryani', cat: 'biryani', type: 'non-veg', price: 449, rating: '5.0', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80', desc: 'Slow-dum basmati rice layered with juicy mutton and aromatic saffron pot.' },
  { id: 'm6', name: 'Subz Dum Biryani', cat: 'biryani', type: 'veg', price: 299, rating: '4.7', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80', desc: 'Farm-fresh garden vegetables infused with kewra, mint and basmati rice.' },
  { id: 'm7', name: 'Butter Garlic Naan', cat: 'breads', type: 'veg', price: 89, rating: '4.8', img: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=80', desc: 'Tandoor-baked flatbread infused with golden roasted garlic and desi ghee.' },
  { id: 'm8', name: 'Laccha Paratha', cat: 'breads', type: 'veg', price: 79, rating: '4.7', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80', desc: 'Multi-layered crispy whole-wheat bread baked to golden perfection.' },
  { id: 'm9', name: 'Royal Gulab Jamun', cat: 'desserts', type: 'veg', price: 149, rating: '4.9', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80', desc: 'Warm cottage cheese dumplings soaked in saffron & green cardamom syrup.' },
  { id: 'm10', name: 'Mango Kulfi Falooda', cat: 'desserts', type: 'veg', price: 179, rating: '4.8', img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=500&q=80', desc: 'Traditional reduced milk ice cream topped with falooda noodles & rose syrup.' },
  { id: 'm11', name: 'Royal Kesariya Lassi', cat: 'drinks', type: 'veg', price: 129, rating: '4.9', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=80', desc: 'Thick churned sweet yogurt flavored with saffron strands and crushed pistachios.' },
  { id: 'm12', name: 'Fresh Mint Mojito', cat: 'drinks', type: 'veg', price: 139, rating: '4.7', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80', desc: 'Refreshing blend of crushed garden mint, zesty lime, and sparkling soda.' }
];

function initMenuFilter() {
  const container = document.getElementById('menuItemsGrid');
  const tabBtns = document.querySelectorAll('.menu-tab-btn');
  if (!container) return;

  function renderItems(filterCategory) {
    container.innerHTML = '';
    const filtered = (filterCategory === 'all')
      ? MENU_DATABASE
      : MENU_DATABASE.filter(item => item.cat === filterCategory);

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'food-card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
          <span class="food-badge ${item.type}">${item.type === 'veg' ? 'Veg' : 'Non-Veg'}</span>
        </div>
        <div class="card-content">
          <div class="card-header-row">
            <h3 class="food-title">${item.name}</h3>
            <span class="food-price">₹${item.price}</span>
          </div>
          <p class="food-desc">${item.desc}</p>
          <div class="card-footer-row">
            <div class="food-rating">★★★★★ <span>(${item.rating})</span></div>
            <button class="btn btn-sm btn-outline add-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${item.img}">Add to Cart</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderItems(btn.getAttribute('data-category'));
    });
  });

  renderItems('all');
}

/* ==========================================================================
   3. CART & ORDERING SYSTEM
   ========================================================================== */
let cart = [];

function initCartSystem() {
  const openBtn = document.getElementById('openCartBtn');
  const closeBtn = document.getElementById('closeCartBtn');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartContainer = document.getElementById('cartItemsContainer');
  const badge = document.getElementById('cartCountBadge');
  const subtotalEl = document.getElementById('cartSubtotal');
  const taxEl = document.getElementById('cartTax');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('proceedCheckoutBtn');

  // Open/Close
  function toggleCart(open) {
    if (open) {
      cartBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      cartBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openBtn) openBtn.addEventListener('click', () => toggleCart(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleCart(false));
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) toggleCart(false);
    });
  }

  // Add to cart delegation
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-cart-btn');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const price = parseFloat(btn.getAttribute('data-price'));
    const img = btn.getAttribute('data-img');

    addToCart({ id, name, price, img });
  });

  function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    toggleCart(true);
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalCount;

    if (cart.length === 0) {
      cartContainer.innerHTML = '<p class="empty-cart-msg">Your dining cart is currently empty. Explore our delicious menu to add dishes.</p>';
      checkoutBtn.disabled = true;
      subtotalEl.textContent = '₹0';
      taxEl.textContent = '₹0';
      totalEl.textContent = '₹0';
      return;
    }

    checkoutBtn.disabled = false;
    cartContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      subtotal += item.price * item.qty;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">₹${item.price * item.qty}</span>
          <div class="cart-item-ctrls">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove item">✕</button>
      `;
      cartContainer.appendChild(itemEl);
    });

    const tax = Math.round(subtotal * 0.05);
    const finalTotal = subtotal + tax;

    subtotalEl.textContent = `₹${subtotal}`;
    taxEl.textContent = `₹${tax}`;
    totalEl.textContent = `₹${finalTotal}`;
  }

  // Quantity and Remove listener
  cartContainer.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('.qty-btn');
    const removeBtn = e.target.closest('.remove-item-btn');

    if (qtyBtn) {
      const id = qtyBtn.getAttribute('data-id');
      const action = qtyBtn.getAttribute('data-action');
      const item = cart.find(i => i.id === id);
      if (!item) return;

      if (action === 'inc') {
        item.qty += 1;
      } else if (action === 'dec') {
        item.qty -= 1;
        if (item.qty <= 0) {
          cart = cart.filter(i => i.id !== id);
        }
      }
      updateCartUI();
    }

    if (removeBtn) {
      const id = removeBtn.getAttribute('data-id');
      cart = cart.filter(i => i.id !== id);
      updateCartUI();
    }
  });

  // Checkout modal wiring
  const checkoutBackdrop = document.getElementById('checkoutBackdrop');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const checkoutForm = document.getElementById('checkoutForm');
  const successBanner = document.getElementById('checkoutSuccessMsg');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      toggleCart(false);
      checkoutBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('chkName').value.trim();
      const phone = document.getElementById('chkPhone').value.trim();

      if (!name || phone.length < 10) {
        alert('Please fill out all required contact fields correctly.');
        return;
      }

      successBanner.style.display = 'block';
      setTimeout(() => {
        cart = [];
        updateCartUI();
        checkoutForm.reset();
        successBanner.style.display = 'none';
        checkoutBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }, 2500);
    });
  }
}

/* ==========================================================================
   4. RESERVATION FORM & VALIDATION
   ========================================================================== */
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  const dateInput = document.getElementById('resDate');
  const timeBtns = document.querySelectorAll('.time-slot-btn');
  const timeHidden = document.getElementById('selectedTimeValue');
  const successMsg = document.getElementById('resSuccessMsg');

  // Prevent past dates
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Time slot select
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (timeHidden) timeHidden.value = btn.getAttribute('data-time');
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const name = document.getElementById('resName');
      const phone = document.getElementById('resPhone');
      const email = document.getElementById('resEmail');
      const date = document.getElementById('resDate');

      // Validation
      if (!name.value.trim()) {
        name.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        name.parentElement.classList.remove('has-error');
      }

      if (!phone.value.trim() || phone.value.trim().length < 10) {
        phone.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        phone.parentElement.classList.remove('has-error');
      }

      if (!email.value.trim() || !email.value.includes('@')) {
        email.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        email.parentElement.classList.remove('has-error');
      }

      if (!date.value) {
        date.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        date.parentElement.classList.remove('has-error');
      }

      if (isValid) {
        successMsg.style.display = 'block';
        setTimeout(() => {
          form.reset();
          successMsg.style.display = 'none';
        }, 4000);
      }
    });
  }
}

/* ==========================================================================
   5. TESTIMONIAL SLIDER
   ========================================================================== */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const slides = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const dotsContainer = document.getElementById('sliderDotsGroup');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;

  // Render dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.slider-dot');

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => goToSlide(currentIndex + 1), 5000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); startAutoSlide(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); startAutoSlide(); });

  track.addEventListener('mouseenter', stopAutoSlide);
  track.addEventListener('mouseleave', startAutoSlide);

  startAutoSlide();
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        q.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        q.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   7. SPECIAL OFFER COUNTDOWN
   ========================================================================== */
function initOfferCountdown() {
  const hoursEl = document.getElementById('timerHours');
  const minsEl = document.getElementById('timerMinutes');
  const secsEl = document.getElementById('timerSeconds');
  if (!hoursEl) return;

  // 2 hours 45 mins 32 secs in seconds
  let remainingSeconds = (2 * 3600) + (45 * 60) + 32;

  setInterval(() => {
    if (remainingSeconds <= 0) {
      remainingSeconds = 3 * 3600; // Reset for demo continuity
    } else {
      remainingSeconds -= 1;
    }

    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;

    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent = String(m).padStart(2, '0');
    secsEl.textContent = String(s).padStart(2, '0');
  }, 1000);
}

/* ==========================================================================
   8. GALLERY LIGHTBOX
   ========================================================================== */
function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImage');
  const captionEl = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  if (!lightbox || items.length === 0) return;

  let currentIdx = 0;
  const galleryData = Array.from(items).map(item => ({
    src: item.getAttribute('data-src'),
    caption: item.getAttribute('data-caption')
  }));

  function openLightbox(index) {
    currentIdx = index;
    imgEl.src = galleryData[currentIdx].src;
    captionEl.textContent = galleryData[currentIdx].caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIdx = (currentIdx + 1) % galleryData.length;
    openLightbox(currentIdx);
  }

  function showPrev() {
    currentIdx = (currentIdx - 1 + galleryData.length) % galleryData.length;
    openLightbox(currentIdx);
  }

  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* ==========================================================================
   9. SCROLL ANIMATIONS & STATS COUNTER
   ========================================================================== */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        let start = 0;
        const duration = 2000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            el.textContent = (decimals > 0 ? target.toFixed(decimals) : Math.floor(target)) + suffix;
            clearInterval(timer);
          } else {
            el.textContent = (decimals > 0 ? start.toFixed(decimals) : Math.floor(start)) + suffix;
          }
        }, stepTime);

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

/* ==========================================================================
   10. CONTACT FORM
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('contactSuccessMsg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const msg = document.getElementById('contactMsg');

    if (!name.value.trim()) {
      name.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      name.parentElement.classList.remove('has-error');
    }

    if (!email.value.trim() || !email.value.includes('@')) {
      email.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      email.parentElement.classList.remove('has-error');
    }

    if (!msg.value.trim()) {
      msg.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      msg.parentElement.classList.remove('has-error');
    }

    if (isValid) {
      successMsg.style.display = 'block';
      setTimeout(() => {
        form.reset();
        successMsg.style.display = 'none';
      }, 4000);
    }
  });
}

/* ==========================================================================
   11. BACK TO TOP & MOBILE MORE SHEET
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initMobileMoreSheet() {
  const openBtn = document.getElementById('openMoreBtn');
  const closeBtn = document.getElementById('closeMoreBtn');
  const backdrop = document.getElementById('moreSheetBackdrop');
  const sheetLinks = document.querySelectorAll('.sheet-link');

  function toggleSheet(open) {
    if (open) {
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openBtn) openBtn.addEventListener('click', () => toggleSheet(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleSheet(false));
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) toggleSheet(false);
    });
  }

  sheetLinks.forEach(link => {
    link.addEventListener('click', () => toggleSheet(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      toggleSheet(false);
    }
  });
}