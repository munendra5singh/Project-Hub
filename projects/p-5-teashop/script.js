/**
 * CHAI & LEAF — Vanilla JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Page Loader
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) {
        loader.classList.add('hidden');
      }
    }, 450);
  });

  // 2. Sticky Navbar & Scroll Effects
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Navbar backdrop effect
    if (scrollPos > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (scrollPos > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }

    // Active navigation spy
    updateActiveNavLink();
  });

  // Back to top trigger
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Mobile Hamburger Navigation
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  function toggleMobileMenu() {
    const isOpen = navMenu.classList.contains('open');
    navMenu.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', !isOpen);
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // Active navigation spy logic
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // 4. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
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
  } else {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 5. Dynamic Deal Countdown Timer
  function initCountdown() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!hoursEl || !minutesEl || !secondsEl) return;

    // Set countdown for 5 hours from user load
    let duration = (5 * 60 * 60) - 15;

    const timerInterval = setInterval(() => {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);

      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');

      if (duration <= 0) {
        clearInterval(timerInterval);
      }
      duration--;
    }, 1000);
  }
  initCountdown();

  // 6. Interactive Menu Category Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetFilter = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const itemCat = card.getAttribute('data-category');
        if (targetFilter === 'all' || itemCat === targetFilter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 300);
        }
      });
    });
  });

  // 7. Gallery Lightbox Modal
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const fullSrc = item.getAttribute('data-full');
      const caption = item.getAttribute('data-caption');
      if (lightboxImg && fullSrc) {
        lightboxImg.src = fullSrc;
        lightboxCaption.textContent = caption || '';
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // 8. Reviews / Testimonial Slider
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === currentSlide);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentSlide);
    });
  }

  function startAutoplay() {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5500);
  }

  function resetAutoplay() {
    clearInterval(slideInterval);
    startAutoplay();
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      resetAutoplay();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
        showSlide(targetIndex);
        resetAutoplay();
      });
    });

    startAutoplay();
  }

  // 9. Interactive Cart Drawer & Toast System
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const toastEl = document.getElementById('toastNotification');
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

  let cart = [];

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartCountEl) cartCountEl.textContent = totalCount;
    if (cartTotalEl) cartTotalEl.textContent = `₹${totalPrice}`;

    if (cartItemsList) {
      if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-msg">Your tray is empty. Add some warm tea!</p>';
      } else {
        cartItemsList.innerHTML = cart.map(item => `
          <div class="cart-item-row">
            <div class="cart-item-info">
              <h5>${item.name}</h5>
              <span>₹${item.price} × ${item.qty}</span>
            </div>
            <span class="m-price">₹${item.price * item.qty}</span>
          </div>
        `).join('');
      }
    }
  }

  function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price: Number(price), qty: 1 });
    }
    updateCartUI();
    showToast(`${name} added to your tray ☕`);
  }

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      addToCart(id, name, price);
    });
  });

  function openCart() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your tray is empty! Please add tea first.');
      } else {
        showToast('Redirecting to secure payment... 🍵');
      }
    });
  }

  // 10. Form Validation
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('emailAddr');
      const phoneInput = document.getElementById('phoneNum');
      const msgInput = document.getElementById('messageText');

      // Name validation
      if (nameInput.value.trim().length < 3) {
        nameInput.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        nameInput.parentElement.classList.remove('has-error');
      }

      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        emailInput.parentElement.classList.remove('has-error');
      }

      // Phone validation (10 digits)
      const cleanPhone = phoneInput.value.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        phoneInput.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        phoneInput.parentElement.classList.remove('has-error');
      }

      // Message validation
      if (msgInput.value.trim().length < 10) {
        msgInput.parentElement.classList.add('has-error');
        isValid = false;
      } else {
        msgInput.parentElement.classList.remove('has-error');
      }

      if (isValid) {
        const submitBtn = document.getElementById('formSubmitBtn');
        submitBtn.textContent = 'Sending... ☕';
        submitBtn.disabled = true;

        setTimeout(() => {
          showToast('Thank you! Your message has been received.');
          contactForm.reset();
          submitBtn.textContent = 'Send Message 🍵';
          submitBtn.disabled = false;
        }, 1200);
      }
    });
  }
});