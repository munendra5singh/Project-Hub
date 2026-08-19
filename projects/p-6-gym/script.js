/**
 * FITLIFE GYM - Core Production Engine
 * Vanilla JavaScript (ES6+)
 * Performance-optimized with IntersectionObserver
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. Sticky Navbar & Active Section Highlighting
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const sections = document.querySelectorAll('section[id], footer[id]');
  const backToTopBtn = document.getElementById('backToTop');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Desktop navbar shrink effect
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Active Section Tracker (Syncs both Desktop nav & Mobile Bottom nav)
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });

      bottomNavItems.forEach((item) => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === currentSectionId) {
          item.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Back to top action
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     2. Scroll Reveal Animations (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ==========================================================================
     3. Animated Statistics Counter
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800; // ms
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quad formula
      const currentVal = Math.round(target * (1 - (1 - progress) * (1 - progress)));

      el.textContent = currentVal + suffix;

      if (frame >= totalFrames) {
        el.textContent = target + suffix;
        clearInterval(counter);
      }
    }, frameRate);
  };

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsCounted) {
          statsCounted = true;
          statNumbers.forEach((stat) => countUp(stat));
        }
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(statsSection);
  }

  /* ==========================================================================
     4. Interactive BMI Calculator
     ========================================================================== */
  const bmiForm = document.getElementById('bmiForm');
  const bmiHeightInput = document.getElementById('bmiHeight');
  const bmiWeightInput = document.getElementById('bmiWeight');
  const bmiHeightError = document.getElementById('bmiHeightError');
  const bmiWeightError = document.getElementById('bmiWeightError');
  const bmiEmpty = document.getElementById('bmiEmpty');
  const bmiOutput = document.getElementById('bmiOutput');
  const bmiNumber = document.getElementById('bmiNumber');
  const bmiCategory = document.getElementById('bmiCategory');
  const bmiGaugeBar = document.getElementById('bmiGaugeBar');

  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const height = parseFloat(bmiHeightInput.value);
      const weight = parseFloat(bmiWeightInput.value);

      // Height validation
      if (!height || isNaN(height) || height < 50 || height > 250) {
        bmiHeightError.textContent = 'Enter height between 50 and 250 cm.';
        isValid = false;
      } else {
        bmiHeightError.textContent = '';
      }

      // Weight validation
      if (!weight || isNaN(weight) || weight < 20 || weight > 300) {
        bmiWeightError.textContent = 'Enter weight between 20 and 300 kg.';
        isValid = false;
      } else {
        bmiWeightError.textContent = '';
      }

      if (!isValid) return;

      // BMI Formula = weight(kg) / (height(m))^2
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

      let category = '';
      let barPercent = 0;

      if (bmi < 18.5) {
        category = 'Underweight';
        barPercent = 25;
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Normal Weight';
        barPercent = 50;
      } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
        barPercent = 75;
      } else {
        category = 'Obesity';
        barPercent = 100;
      }

      bmiNumber.textContent = bmi;
      bmiCategory.textContent = category;
      bmiGaugeBar.style.width = `${barPercent}%`;

      bmiEmpty.classList.add('hidden');
      bmiOutput.classList.remove('hidden');
    });
  }

  /* ==========================================================================
     5. Workout Routines & Modal Database
     ========================================================================== */
  const workoutData = {
    chest: {
      title: 'Chest Hypertrophy Routine',
      level: 'INTERMEDIATE',
      duration: '⏱ 55 Minutes',
      exercises: [
        { name: 'Barbell Incline Bench Press', sets: '4', reps: '8 - 10', rest: '90s' },
        { name: 'Flat Dumbbell Press', sets: '4', reps: '10 - 12', rest: '75s' },
        { name: 'Weighted Chest Dips', sets: '3', reps: '10 - 12', rest: '60s' },
        { name: 'High-to-Low Cable Flyes', sets: '3', reps: '15', rest: '45s' },
        { name: 'Push-Up Burnout Finisher', sets: '2', reps: 'To Failure', rest: '60s' }
      ]
    },
    back: {
      title: 'Back & Lat Power Routine',
      level: 'ADVANCED',
      duration: '⏱ 60 Minutes',
      exercises: [
        { name: 'Conventional Barbell Deadlifts', sets: '4', reps: '5 - 6', rest: '120s' },
        { name: 'Neutral-Grip Weighted Pull-Ups', sets: '4', reps: '8', rest: '90s' },
        { name: 'Single-Arm Dumbbell Rows', sets: '3', reps: '10 / side', rest: '60s' },
        { name: 'Seated Cable Lat Pulldowns', sets: '3', reps: '12', rest: '60s' },
        { name: 'Hyperextensions with Plate', sets: '3', reps: '15', rest: '45s' }
      ]
    },
    legs: {
      title: 'Quad & Hamstring Blast',
      level: 'HARDCORE',
      duration: '⏱ 70 Minutes',
      exercises: [
        { name: 'Barbell Back Squats', sets: '5', reps: '6 - 8', rest: '120s' },
        { name: 'Romanian Dumbbell Deadlifts', sets: '4', reps: '10 - 12', rest: '90s' },
        { name: 'Leg Press (Heavy)', sets: '4', reps: '12', rest: '75s' },
        { name: 'Walking Dumbbell Lunges', sets: '3', reps: '20 steps', rest: '60s' },
        { name: 'Seated Calf Raises', sets: '4', reps: '15 - 20', rest: '45s' }
      ]
    },
    shoulders: {
      title: '3D Boulder Shoulders',
      level: 'INTERMEDIATE',
      duration: '⏱ 45 Minutes',
      exercises: [
        { name: 'Standing Overhead Barbell Press', sets: '4', reps: '8', rest: '90s' },
        { name: 'Dumbbell Lateral Raises (Strict)', sets: '4', reps: '12 - 15', rest: '60s' },
        { name: 'Rear Delt Face Pulls (Rope)', sets: '4', reps: '15', rest: '45s' },
        { name: 'Seated Arnold Press', sets: '3', reps: '10', rest: '60s' }
      ]
    },
    arms: {
      title: 'Arms & Grip Specialization',
      level: 'ALL LEVELS',
      duration: '⏱ 45 Minutes',
      exercises: [
        { name: 'Barbell Preacher Curls', sets: '4', reps: '10', rest: '60s' },
        { name: 'Close-Grip Triceps Bench Press', sets: '4', reps: '8 - 10', rest: '75s' },
        { name: 'Incline Dumbbell Hammer Curls', sets: '3', reps: '12', rest: '45s' },
        { name: 'Triceps Overhead Cable Extensions', sets: '3', reps: '12 - 15', rest: '45s' }
      ]
    },
    fullbody: {
      title: 'Full Body Athletic Burn',
      level: 'CONDITIONING',
      duration: '⏱ 50 Minutes',
      exercises: [
        { name: 'Kettlebell Clean & Press', sets: '4', reps: '10 / arm', rest: '60s' },
        { name: 'Barbell Thrusters', sets: '4', reps: '12', rest: '75s' },
        { name: 'Box Jumps (24/30 in)', sets: '3', reps: '12', rest: '45s' },
        { name: 'Battle Rope Waves', sets: '4', reps: '30s on / 30s off', rest: '30s' }
      ]
    }
  };

  const workoutModal = document.getElementById('workoutModal');
  const workoutModalTitle = document.getElementById('workoutModalTitle');
  const workoutModalLevel = document.getElementById('workoutModalLevel');
  const workoutModalDuration = document.getElementById('workoutModalDuration');
  const workoutTableBody = document.getElementById('workoutTableBody');
  const workoutModalClose = document.getElementById('workoutModalClose');
  const workoutModalDone = document.getElementById('workoutModalDone');
  const viewWorkoutBtns = document.querySelectorAll('.view-workout-btn');

  const openWorkoutModal = (workoutKey) => {
    const routine = workoutData[workoutKey];
    if (!routine) return;

    workoutModalTitle.textContent = routine.title;
    workoutModalLevel.textContent = routine.level;
    workoutModalDuration.textContent = routine.duration;

    workoutTableBody.innerHTML = '';
    routine.exercises.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.name}</strong></td>
        <td>${item.sets}</td>
        <td>${item.reps}</td>
        <td>${item.rest}</td>
      `;
      workoutTableBody.appendChild(tr);
    });

    workoutModal.classList.add('active');
    document.body.classList.add('modal-open');
  };

  const closeWorkoutModal = () => {
    workoutModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  viewWorkoutBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-workout');
      openWorkoutModal(key);
    });
  });

  if (workoutModalClose) workoutModalClose.addEventListener('click', closeWorkoutModal);
  if (workoutModalDone) workoutModalDone.addEventListener('click', closeWorkoutModal);
  if (workoutModal) {
    workoutModal.querySelector('.modal-backdrop').addEventListener('click', closeWorkoutModal);
  }

  /* ==========================================================================
     6. Membership & Free Trial Modal
     ========================================================================== */
  const membershipModal = document.getElementById('membershipModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalPlanBadge = document.getElementById('modalPlanBadge');
  const selectedPlanInput = document.getElementById('selectedPlanInput');
  const membershipForm = document.getElementById('membershipForm');
  const modalSuccess = document.getElementById('modalSuccess');
  const modalSuccessClose = document.getElementById('modalSuccessClose');
  const planButtons = document.querySelectorAll('.plan-btn');
  const heroTrialBtn = document.getElementById('heroTrialBtn');

  const openMembershipModal = (planName, price) => {
    modalTitle.textContent = `${planName} Plan Sign-Up`;
    modalPlanBadge.textContent = `${planName.toUpperCase()} PASS &bull; ${price}`;
    selectedPlanInput.value = planName;

    membershipForm.reset();
    document.getElementById('modalNameError').textContent = '';
    document.getElementById('modalEmailError').textContent = '';
    document.getElementById('modalPhoneError').textContent = '';
    membershipForm.classList.remove('hidden');
    modalSuccess.classList.add('hidden');

    membershipModal.classList.add('active');
    document.body.classList.add('modal-open');
  };

  const closeMembershipModal = () => {
    membershipModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  planButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      const price = btn.getAttribute('data-price');
      openMembershipModal(plan, price);
    });
  });

  if (heroTrialBtn) {
    heroTrialBtn.addEventListener('click', () => {
      openMembershipModal('1-Day Free Trial', '$0 Free');
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeMembershipModal);
  if (modalSuccessClose) modalSuccessClose.addEventListener('click', closeMembershipModal);
  if (membershipModal) {
    membershipModal.querySelector('.modal-backdrop').addEventListener('click', closeMembershipModal);
  }

  if (membershipForm) {
    membershipForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('modalName').value.trim();
      const email = document.getElementById('modalEmail').value.trim();
      const phone = document.getElementById('modalPhone').value.trim();

      let valid = true;

      if (!name) {
        document.getElementById('modalNameError').textContent = 'Name is required.';
        valid = false;
      } else {
        document.getElementById('modalNameError').textContent = '';
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('modalEmailError').textContent = 'Valid email is required.';
        valid = false;
      } else {
        document.getElementById('modalEmailError').textContent = '';
      }

      if (!phone || phone.length < 7) {
        document.getElementById('modalPhoneError').textContent = 'Valid phone is required.';
        valid = false;
      } else {
        document.getElementById('modalPhoneError').textContent = '';
      }

      if (valid) {
        membershipForm.classList.add('hidden');
        modalSuccess.classList.remove('hidden');
      }
    });
  }

  /* ==========================================================================
     7. Fullscreen Gallery Lightbox
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentImageIdx = 0;
  const imageSources = Array.from(galleryItems).map((item) => item.getAttribute('data-src'));

  const showLightboxImage = (idx) => {
    currentImageIdx = (idx + imageSources.length) % imageSources.length;
    lightboxImage.src = imageSources[currentImageIdx];
  };

  const openLightbox = (idx) => {
    showLightboxImage(idx);
    lightbox.classList.add('active');
    document.body.classList.add('modal-open');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('modal-open');
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => showLightboxImage(currentImageIdx - 1));
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => showLightboxImage(currentImageIdx + 1));
  }
  if (lightbox) {
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  }

  /* ==========================================================================
     8. Global Escape Key Listener (Closes Modals & Lightbox)
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (workoutModal && workoutModal.classList.contains('active')) closeWorkoutModal();
      if (membershipModal && membershipModal.classList.contains('active')) closeMembershipModal();
      if (lightbox && lightbox.classList.contains('active')) closeLightbox();
    }
  });

  /* ==========================================================================
     9. Testimonial Carousel / Slider
     ========================================================================== */
  const track = document.getElementById('testimonialTrack');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const dotsContainer = document.getElementById('testimonialDots');

  let currentSlide = 0;
  const slideCount = slides.length;
  let autoplayTimer = null;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  const updateSlider = () => {
    if (track) {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  };

  const goToSlide = (idx) => {
    currentSlide = (idx + slideCount) % slideCount;
    updateSlider();
    resetAutoplay();
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  const startAutoplay = () => {
    autoplayTimer = setInterval(nextSlide, 5500);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  if (track) {
    startAutoplay();
    track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    track.addEventListener('mouseleave', startAutoplay);
  }

  /* ==========================================================================
     10. FAQ Accordion
     ========================================================================== */
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const content = item.querySelector('.accordion-content');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Toggle current
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });

  /* ==========================================================================
     11. Contact Form Validation
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const resetContactFormBtn = document.getElementById('resetContactFormBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      let valid = true;

      if (!name) {
        document.getElementById('nameError').textContent = 'Please enter your full name.';
        valid = false;
      } else {
        document.getElementById('nameError').textContent = '';
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        valid = false;
      } else {
        document.getElementById('emailError').textContent = '';
      }

      if (!phone || phone.length < 7) {
        document.getElementById('phoneError').textContent = 'Please enter a valid phone number.';
        valid = false;
      } else {
        document.getElementById('phoneError').textContent = '';
      }

      if (!message || message.length < 5) {
        document.getElementById('messageError').textContent = 'Message must be at least 5 characters.';
        valid = false;
      } else {
        document.getElementById('messageError').textContent = '';
      }

      if (valid) {
        contactForm.classList.add('hidden');
        formSuccess.classList.remove('hidden');
      }
    });
  }

  if (resetContactFormBtn) {
    resetContactFormBtn.addEventListener('click', () => {
      contactForm.reset();
      formSuccess.classList.add('hidden');
      contactForm.classList.remove('hidden');
    });
  }
});