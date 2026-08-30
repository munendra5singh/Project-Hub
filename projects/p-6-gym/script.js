/**
 * ==========================================================================
 * APEX FORGE FITNESS - CORE JAVASCRIPT
 * Features: Dark/Light Mode Engine, Interactive Schedule, Workout Split Modals,
 *           BMI Calculator Gauge, Testimonial Swipe Slider, Lightbox & Validation
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Dark Mode + Light Mode Theme Engine
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const drawerThemeToggle = document.getElementById('drawerThemeToggle');
  const themeStatusText = document.getElementById('themeStatusText');

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('apex_theme');
    if (savedTheme) {
      return savedTheme;
    }
    const initialAttr = document.documentElement.getAttribute('data-theme');
    if (initialAttr) {
      return initialAttr;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('apex_theme', theme);

    if (themeStatusText) {
      themeStatusText.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    // Update Meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0b10' : '#f4f6f9');
    }
  }

  // Initialize theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  if (drawerThemeToggle) {
    drawerThemeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for OS theme changes if user hasn't explicitly set preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('apex_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // --------------------------------------------------------------------------
  // 2. Navigation, Sticky Header & Active Link Tracking
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTop');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Sticky navbar shadow
    if (navbar) {
      if (scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 450) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Active Section Tracking
    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Navigation Drawer
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-action-btn');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('active');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('active');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileDrawer && mobileDrawer.classList.contains('active')) closeDrawer();
      closeModal();
      closeLightbox();
    }
  });

  // --------------------------------------------------------------------------
  // 4. Scroll Reveal Animations (IntersectionObserver)
  // --------------------------------------------------------------------------
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('revealed'));
  }

  // --------------------------------------------------------------------------
  // 5. Interactive Class Schedule (Day Filtering)
  // --------------------------------------------------------------------------
  const scheduleTabs = document.querySelectorAll('.schedule-day-tab');
  const scheduleCards = document.querySelectorAll('.schedule-card');

  scheduleTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      scheduleTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const selectedDay = tab.getAttribute('data-day');

      scheduleCards.forEach((card) => {
        if (selectedDay === 'all') {
          card.style.display = 'flex';
        } else {
          const cardDays = card.getAttribute('data-day') || '';
          if (cardDays.includes(selectedDay)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 6. Free Pass & Membership Signup Modal
  // --------------------------------------------------------------------------
  const passModal = document.getElementById('passModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const passForm = document.getElementById('passForm');
  const passSuccess = document.getElementById('passSuccess');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');
  const passTierSelect = document.getElementById('passTier');
  const modalTitle = document.getElementById('modalTitle');

  // Trigger buttons
  const topBannerBtn = document.getElementById('topBannerBtn');
  const heroTrialBtn = document.getElementById('heroTrialBtn');
  const finalCtaBtn = document.getElementById('finalCtaBtn');
  const selectPlanBtns = document.querySelectorAll('.select-plan-btn');
  const scheduleBookBtns = document.querySelectorAll('.schedule-book-btn');
  const trainerBookBtns = document.querySelectorAll('.trainer-book-btn');

  function openPassModal(tierValue, titleText) {
    if (!passModal) return;
    if (passForm) passForm.reset();
    if (passSuccess) passSuccess.classList.add('hidden');
    if (passForm) passForm.classList.remove('hidden');

    // Clear error messages
    const nameError = document.getElementById('passNameError');
    const phoneError = document.getElementById('passPhoneError');
    if (nameError) nameError.textContent = '';
    if (phoneError) phoneError.textContent = '';

    if (passTierSelect && tierValue) {
      passTierSelect.value = tierValue;
    }
    if (modalTitle && titleText) {
      modalTitle.textContent = titleText;
    } else if (modalTitle) {
      modalTitle.textContent = 'Claim Your 1-Day Pass';
    }

    passModal.classList.add('active');
    passModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!passModal) return;
    passModal.classList.remove('active');
    passModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  if (topBannerBtn) {
    topBannerBtn.addEventListener('click', () => openPassModal('Free 1-Day Trial Pass', 'Claim 1-Day All-Access Pass'));
  }
  if (heroTrialBtn) {
    heroTrialBtn.addEventListener('click', () => openPassModal('Free 1-Day Trial Pass', 'Claim 1-Day Free Trial'));
  }
  if (finalCtaBtn) {
    finalCtaBtn.addEventListener('click', () => openPassModal('Free 1-Day Trial Pass', 'Claim 1-Day Free Trial'));
  }

  selectPlanBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan') || 'Pro Performance ($79/mo)';
      openPassModal(plan, `Join on ${plan.split('(')[0].trim()}`);
    });
  });

  scheduleBookBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const className = btn.getAttribute('data-class') || 'Group Class';
      openPassModal('Free 1-Day Trial Pass', `Reserve: ${className}`);
    });
  });

  trainerBookBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const trainerName = btn.getAttribute('data-trainer') || 'Coach';
      openPassModal('Elite All-Access ($129/mo)', `Book Consult with ${trainerName}`);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (closeSuccessModalBtn) closeSuccessModalBtn.addEventListener('click', closeModal);

  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('passName');
      const phoneInput = document.getElementById('passPhone');
      const nameError = document.getElementById('passNameError');
      const phoneError = document.getElementById('passPhoneError');

      let isValid = true;

      if (!nameInput || !nameInput.value.trim()) {
        if (nameError) nameError.textContent = 'Please provide your full name.';
        isValid = false;
      } else {
        if (nameError) nameError.textContent = '';
      }

      if (!phoneInput || !phoneInput.value.trim() || phoneInput.value.trim().length < 7) {
        if (phoneError) phoneError.textContent = 'Please provide a valid phone number.';
        isValid = false;
      } else {
        if (phoneError) phoneError.textContent = '';
      }

      if (isValid) {
        passForm.classList.add('hidden');
        if (passSuccess) passSuccess.classList.remove('hidden');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Workout Routine Modal & Data
  // --------------------------------------------------------------------------
  const routineModal = document.getElementById('routineModal');
  const routineModalClose = document.getElementById('routineModalClose');
  const routineModalBackdrop = document.getElementById('routineModalBackdrop');
  const routineBadge = document.getElementById('routineBadge');
  const routineModalTitle = document.getElementById('routineModalTitle');
  const routineModalDesc = document.getElementById('routineModalDesc');
  const routineTableBody = document.getElementById('routineTableBody');
  const viewRoutineBtns = document.querySelectorAll('.view-routine-btn');
  const routineCtaBtn = document.getElementById('routineCtaBtn');

  const routinesData = {
    hypertrophy: {
      badge: 'HYPERTROPHY & STRENGTH',
      title: 'Upper / Lower Power Split',
      desc: '4-Day periodized progression focusing on heavy compound barbell lifts and hypertrophy accessory volume.',
      exercises: [
        { name: 'Barbell Back Squat', sets: '4', reps: '6-8', rest: '2-3 Min' },
        { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '8-10', rest: '2 Min' },
        { name: 'Flat Barbell Bench Press', sets: '4', reps: '6-8', rest: '2 Min' },
        { name: 'Chest-Supported T-Bar Row', sets: '4', reps: '10-12', rest: '90 Sec' },
        { name: 'Standing Overhead Barbell Press', sets: '3', reps: '8-10', rest: '2 Min' },
        { name: 'Incline Dumbbell Bicep Curls', sets: '3', reps: '12-15', rest: '60 Sec' },
        { name: 'Overhead Rope Tricep Extension', sets: '3', reps: '12-15', rest: '60 Sec' }
      ]
    },
    pushpull: {
      badge: 'VOLUME & MUSCLE MASS',
      title: 'Classic Push-Pull-Legs (PPL)',
      desc: '5-6 Day high frequency split grouping antagonistic muscle groups for optimal recovery and continuous overload.',
      exercises: [
        { name: 'Incline Barbell Bench Press', sets: '4', reps: '8-10', rest: '2 Min' },
        { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '10-12', rest: '90 Sec' },
        { name: 'Weighted Dips / Chest Flys', sets: '3', reps: '12-15', rest: '90 Sec' },
        { name: 'Conventional Barbell Deadlift', sets: '4', reps: '5', rest: '3 Min' },
        { name: 'Weighted Pull-Ups / Lat Pulldown', sets: '4', reps: '8-10', rest: '2 Min' },
        { name: 'Barbell Barbell Hip Thrust', sets: '4', reps: '10-12', rest: '2 Min' },
        { name: 'Leg Press + Standing Calf Raise', sets: '4', reps: '12-15', rest: '90 Sec' }
      ]
    },
    fatloss: {
      badge: 'METABOLIC CONDITIONING',
      title: 'Full Body Athletic Forge',
      desc: '3-Day density conditioning combining barbell complexes, assault bike sprints, and kettlebell circuits.',
      exercises: [
        { name: 'Trap Bar Deadlift', sets: '4', reps: '8', rest: '90 Sec' },
        { name: 'Dumbbell Walking Lunges', sets: '3', reps: '12 / leg', rest: '60 Sec' },
        { name: 'Dual Kettlebell Push Press', sets: '4', reps: '10', rest: '60 Sec' },
        { name: 'Prowler Sled Push (40m)', sets: '5', reps: '40m Sprint', rest: '90 Sec' },
        { name: 'Assault Bike Calorie Sprints', sets: '5', reps: '15 Kcal max', rest: '60 Sec' },
        { name: 'Hanging Leg Raises', sets: '3', reps: '15', rest: '45 Sec' }
      ]
    },
    mobility: {
      badge: 'JOINT HEALTH & REHAB',
      title: 'Full Body Mobility & Core',
      desc: 'Daily 20-minute movement routine targeting hip capsules, thoracic spine, and shoulder stability.',
      exercises: [
        { name: 'Cat-Cow to Thoracic Reach', sets: '3', reps: '10 / side', rest: '30 Sec' },
        { name: '90/90 Hip Flow & Shin Box', sets: '3', reps: '8 / side', rest: '30 Sec' },
        { name: 'World\'s Greatest Stretch', sets: '3', reps: '6 / side', rest: '30 Sec' },
        { name: 'Banded Shoulder Dislocates', sets: '3', reps: '15', rest: '30 Sec' },
        { name: 'Deadbugs & Bird Dogs', sets: '3', reps: '12 / side', rest: '30 Sec' },
        { name: 'Passive Bar Hang', sets: '3', reps: '45-60 Sec', rest: '45 Sec' }
      ]
    }
  };

  function openRoutineModal(routineKey) {
    const data = routinesData[routineKey] || routinesData.hypertrophy;
    if (routineBadge) routineBadge.textContent = data.badge;
    if (routineModalTitle) routineModalTitle.textContent = data.title;
    if (routineModalDesc) routineModalDesc.textContent = data.desc;

    if (routineTableBody) {
      routineTableBody.innerHTML = '';
      data.exercises.forEach((ex) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${ex.name}</strong></td>
          <td>${ex.sets}</td>
          <td>${ex.reps}</td>
          <td>${ex.rest}</td>
        `;
        routineTableBody.appendChild(tr);
      });
    }

    if (routineModal) {
      routineModal.classList.add('active');
      routineModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }
  }

  function closeRoutineModal() {
    if (!routineModal) return;
    routineModal.classList.remove('active');
    routineModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  viewRoutineBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const routine = btn.getAttribute('data-routine') || 'hypertrophy';
      openRoutineModal(routine);
    });
  });

  if (routineModalClose) routineModalClose.addEventListener('click', closeRoutineModal);
  if (routineModalBackdrop) routineModalBackdrop.addEventListener('click', closeRoutineModal);

  if (routineCtaBtn) {
    routineCtaBtn.addEventListener('click', () => {
      closeRoutineModal();
      openPassModal('Free 1-Day Trial Pass', 'Claim 1-Day Pass to Try This Routine');
    });
  }

  // --------------------------------------------------------------------------
  // 8. Fullscreen Lightbox Gallery
  // --------------------------------------------------------------------------
  const galleryLightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryItems = document.querySelectorAll('.gallery-item');

  let currentGalleryIndex = 0;

  function showLightboxImage(index) {
    if (!galleryItems.length) return;
    if (index < 0) index = galleryItems.length - 1;
    if (index >= galleryItems.length) index = 0;
    currentGalleryIndex = index;

    const item = galleryItems[currentGalleryIndex];
    const src = item.getAttribute('data-src') || item.querySelector('img').src;
    const caption = item.getAttribute('data-caption') || 'Apex Forge Fitness Facility';

    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
    }
  }

  function openLightbox(index) {
    if (!galleryLightbox) return;
    showLightboxImage(index);
    galleryLightbox.classList.add('active');
    galleryLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeLightbox() {
    if (!galleryLightbox) return;
    galleryLightbox.classList.remove('active');
    galleryLightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxImage(currentGalleryIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxImage(currentGalleryIndex + 1);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (galleryLightbox && galleryLightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') showLightboxImage(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentGalleryIndex + 1);
    }
  });

  // --------------------------------------------------------------------------
  // 9. Interactive BMI Calculator Gauge
  // --------------------------------------------------------------------------
  const bmiForm = document.getElementById('bmiForm');
  const bmiEmptyState = document.getElementById('bmiEmptyState');
  const bmiOutputData = document.getElementById('bmiOutputData');
  const bmiScore = document.getElementById('bmiScore');
  const bmiCategory = document.getElementById('bmiCategory');
  const gaugeBar = document.getElementById('gaugeBar');
  const bmiAdvice = document.getElementById('bmiAdvice');

  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const heightInput = document.getElementById('bmiHeight');
      const weightInput = document.getElementById('bmiWeight');
      const heightError = document.getElementById('heightError');
      const weightError = document.getElementById('weightError');

      const h = parseFloat(heightInput.value);
      const w = parseFloat(weightInput.value);

      let isValid = true;

      if (!h || h < 80 || h > 250) {
        if (heightError) heightError.textContent = 'Please enter a height between 80 and 250 cm.';
        isValid = false;
      } else {
        if (heightError) heightError.textContent = '';
      }

      if (!w || w < 30 || w > 300) {
        if (weightError) weightError.textContent = 'Please enter a weight between 30 and 300 kg.';
        isValid = false;
      } else {
        if (weightError) weightError.textContent = '';
      }

      if (!isValid) return;

      // BMI Formula: weight(kg) / (height(m))^2
      const heightMeters = h / 100;
      const score = w / (heightMeters * heightMeters);
      const scoreRounded = score.toFixed(1);

      let catText = '';
      let gaugePercent = 0;
      let adviceText = '';

      if (score < 18.5) {
        catText = 'Underweight Range';
        gaugePercent = Math.min(25, (score / 18.5) * 25);
        adviceText = 'Your BMI indicates underweight. Focus on caloric surplus nutrition and progressive overload hypertrophy in our <strong>Hypertrophy & Strength</strong> program to build dense lean mass.';
      } else if (score >= 18.5 && score < 24.9) {
        catText = 'Normal / Healthy Range';
        gaugePercent = 25 + ((score - 18.5) / (24.9 - 18.5)) * 25;
        adviceText = 'You are in a healthy body weight range. Our <strong>Pro Performance Hypertrophy</strong> program is an ideal fit to optimize your power-to-weight ratio.';
      } else if (score >= 25 && score < 29.9) {
        catText = 'Overweight / Muscular Density';
        gaugePercent = 50 + ((score - 25) / (29.9 - 25)) * 25;
        adviceText = 'Note: Highly muscular lifters often register here. If fat reduction is your goal, our <strong>Metabolic Forge 45 HIIT</strong> and nutrition protocols will accelerate your recomposition.';
      } else {
        catText = 'Obese Range';
        gaugePercent = Math.min(100, 75 + ((score - 30) / 10) * 25);
        adviceText = 'We recommend combining our coach-guided <strong>Full Body Athletic Conditioning</strong> with a sustainable macro strategy to protect joint health while burning fat.';
      }

      if (bmiScore) bmiScore.textContent = scoreRounded;
      if (bmiCategory) bmiCategory.textContent = catText;
      if (gaugeBar) gaugeBar.style.width = `${gaugePercent}%`;
      if (bmiAdvice) bmiAdvice.innerHTML = adviceText;

      if (bmiEmptyState) bmiEmptyState.classList.add('hidden');
      if (bmiOutputData) bmiOutputData.classList.remove('hidden');
    });
  }

  // --------------------------------------------------------------------------
  // 10. Testimonial Carousel with Touch / Swipe
  // --------------------------------------------------------------------------
  const testimonialTrack = document.getElementById('testimonialTrack');
  const prevTestimonialBtn = document.getElementById('prevTestimonial');
  const nextTestimonialBtn = document.getElementById('nextTestimonial');
  const dotsContainer = document.getElementById('carouselDots');
  const slides = document.querySelectorAll('.testimonial-slide');

  let currentSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    if (testimonialTrack) {
      testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }
  }

  if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  }

  if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  }

  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        goToSlide(idx);
      });
    });
  }

  // Touch / Swipe Gestures for Mobile Testimonial Slider
  let touchStartX = 0;
  let touchEndX = 0;

  if (testimonialTrack) {
    testimonialTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    testimonialTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const threshold = 40;
    if (touchEndX < touchStartX - threshold) {
      goToSlide(currentSlide + 1);
    }
    if (touchEndX > touchStartX + threshold) {
      goToSlide(currentSlide - 1);
    }
  }

  // --------------------------------------------------------------------------
  // 11. Accessible FAQ Accordion
  // --------------------------------------------------------------------------
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other accordion items
      document.querySelectorAll('.accordion-item').forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.accordion-trigger');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isExpanded) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        if (content) content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // --------------------------------------------------------------------------
  // 12. Contact Form Validation
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  const resetContactFormBtn = document.getElementById('resetContactFormBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('emailError');

      let isValid = true;

      if (!nameInput || !nameInput.value.trim()) {
        if (nameError) nameError.textContent = 'Please provide your name.';
        isValid = false;
      } else {
        if (nameError) nameError.textContent = '';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        if (emailError) emailError.textContent = 'Please provide a valid email address.';
        isValid = false;
      } else {
        if (emailError) emailError.textContent = '';
      }

      if (isValid) {
        contactForm.classList.add('hidden');
        if (contactSuccess) contactSuccess.classList.remove('hidden');
      }
    });
  }

  if (resetContactFormBtn) {
    resetContactFormBtn.addEventListener('click', () => {
      if (contactForm) {
        contactForm.reset();
        contactForm.classList.remove('hidden');
      }
      if (contactSuccess) contactSuccess.classList.add('hidden');
    });
  }

  // --------------------------------------------------------------------------
  // 13. Dynamic Copyright Year
  // --------------------------------------------------------------------------
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }
});
