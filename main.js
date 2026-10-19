/* ============================================================
   ARENA ANIMATION — MAIN.JS
   ============================================================ */





/* ---------- Navbar Scroll ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---------- Mobile Menu Toggle ---------- */
const mobileToggle = document.getElementById('mobileToggle');
const navDrawer = document.getElementById('navDrawer');
const drawerClose = document.getElementById('drawerClose');
const navBackdrop = document.getElementById('navBackdrop');

function openNav() {
  navDrawer.classList.add('open');
  if (navBackdrop) navBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  mobileToggle.setAttribute('aria-expanded', 'true');
}

function closeNav() {
  navDrawer.classList.remove('open');
  if (navBackdrop) navBackdrop.classList.remove('active');
  document.body.style.overflow = '';
  mobileToggle.setAttribute('aria-expanded', 'false');
}

// Hamburger
mobileToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  navDrawer.classList.contains('open') ? closeNav() : openNav();
});

// X close button inside drawer
if (drawerClose) drawerClose.addEventListener('click', closeNav);

// Close on backdrop click
if (navBackdrop) navBackdrop.addEventListener('click', closeNav);

// Close when a drawer link or CTA is clicked (except the dropdown toggle header)
document.querySelectorAll('.drawer-links a:not(.drawer-dropdown-toggle a), .drawer-cta').forEach(el => {
  el.addEventListener('click', closeNav);
});

// Mobile drawer dropdown toggle for Courses
document.querySelectorAll('.drawer-toggle-btn, .drawer-dropdown-toggle > a').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const dropdown = btn.closest('.drawer-dropdown');
    if (dropdown) {
      if (btn.tagName === 'A') {
        e.preventDefault();
      }
      dropdown.classList.toggle('open');
    }
  });
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});


/* ---------- Reveal on Scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('revealed'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ---------- Counter Animation ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);   // ease-out cubic
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ---------- Form & OTP Logic ---------- */

// Helper: Validation & Submission
const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function setupFormLogic(formId, phoneId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phone = form.querySelector('input[type="tel"]');
      const email = form.querySelector('input[type="email"]');

      if (phone && !validatePhone(phone.value.trim())) {
        phone.style.borderColor = '#ff4d4d';
        phone.focus();
        showToast('❌ Please enter a valid 10-digit mobile number');
        return;
      }

      if (email && !validateEmail(email.value.trim())) {
        email.style.borderColor = '#ff4d4d';
        email.focus();
        showToast('❌ Please enter a valid email address (e.g., name@example.com)');
        return;
      }

      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      submitBtn.textContent = 'Sending...';

      try {
        const formData = new FormData(form);
        const response = await fetch('contact.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
          showToast('✅ Inquiry sent successfully!');
          window.location.href = 'thankyou.html';
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error) {
        console.error("Submission Error:", error);
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = originalBtnText;
        showToast('❌ Failed to send enquiry. Please try again or contact us directly.');
      }
    });
  }
}

// Initialize logic for both forms
setupFormLogic('heroEnquiryForm', 'userPhone');
setupFormLogic('leadForm', 'popupPhone');

/* ---------- Enquiry Popup ---------- */
const enquiryPopup = document.getElementById('enquiryPopup');
const closePopupBtn = document.getElementById('closePopup');
const stickyEnquire = document.getElementById('stickyEnquire');

function openPopup() {
  if (enquiryPopup) {
    enquiryPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    const card = document.getElementById('heroEnquiryCard');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = 'index.html#cta';
    }
  }
}

function closePopupFn() {
  if (enquiryPopup) {
    enquiryPopup.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Expose globally so inline onclick="openEnquiryPopup()" works everywhere
window.openEnquiryPopup = openPopup;


if (closePopupBtn) closePopupBtn.addEventListener('click', closePopupFn);
if (enquiryPopup) enquiryPopup.addEventListener('click', e => { if (e.target === enquiryPopup) closePopupFn(); });

// Auto-trigger popup after 8 seconds (once per session)
if (!sessionStorage.getItem('popupShown')) {
  setTimeout(() => {
    openPopup();
    sessionStorage.setItem('popupShown', '1');
  }, 8000);
}

// Enquire Now buttons from course cards
document.querySelectorAll('.enquire-button').forEach(btn => {
  btn.addEventListener('click', scrollToEnquiry);
});

/* ---------- Testimonials Data ---------- */
const testimonials = [
  {
    name: 'Rohit Saini',
    role: 'Student',
    rating: 5,
    text: 'Arena animation is one of the best institutes for learning graphic, motion graphics and vfx. The trainers are very supportive and explain all concepts clearly.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjXdbZdO7kbzEWqszh8h20Z_wMj0HxmyWzaeSjoDFIR4kh89iajh=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Vivek Kumar',
    role: 'Student',
    rating: 5,
    text: 'Learning blender from here I head a great learning at this institute. The training is practical industry focused and the mentors provide detailed guidance. It really helped me improve my skills and portfolio. Highly recommend for anyone serious about animation.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJXguUb-j5ryFgcFHO7VMV0E41PO9dk7RKzefptnXiF7KxEmA=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Aditya Mehra',
    role: 'Student',
    rating: 5,
    text: 'A Great Experience with 100% Placements! Choosing a course that aligns with your interests and career goals is crucial for success, and 100% Placements does an excellent job in helping students find the right fit. I found the course to be extremely rewarding, both in terms of the content and the expertise of the instructors.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjVJf6wPP7r1UaPFD3z51_Utpa-0aRthrY4sDUn1yg5uWYxA5mM=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Tanuja Sati',
    role: 'Student',
    rating: 5,
    text: 'The location in CP is very convenient. Arena Animation is the best animation training center in Central Delhi. It\'s very affordable and well stable. Teachers are nice and knowledgeable.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocL4kG7R8nNCEFai4bq_d6s34sAJBUfOsgev2hab3cAAuy2PNxw=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Sumit Sharma Vlog',
    role: 'Verified Reviewer',
    rating: 5,
    text: 'Great environment for creative learning! Arena CP stands out as the best design institute in Delhi. The projects and assignments are very practical.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocK4o9DQgXAAZw5Wefff3qZpsIgJsIMgqZN_X7UnPmcsEkxdCu8-=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Ishan Sharma',
    role: 'Student',
    rating: 5,
    text: 'I was researching \'animation courses near me\' and found Arena CP. It was the best decision. The faculty is supportive and the labs are equipped with the latest software.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIXyvpuiDmjpts351_L1U_riNggvsVbJcPEJkkYhFzg242_yQ=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Priyanshu Jog',
    role: 'Student',
    rating: 5,
    text: 'The best institute for VFX, UI, UX design, graphics, 3D, motion graphics, and sketching. My experience with Arena Animation is excellent; all the teachers are very helpful and cooperative. This institute conducts various competitions every month so the students learn new things.',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJxHkzOwjeRtO5sWkBO9J8vj8IW4lmnBMIE5eStCYq_SCxBQg=w100-h100-p-rp-mo-br100'
  },
  {
    name: 'Dipanshu Gill',
    role: 'Student',
    rating: 5,
    text: 'Arena Animation CP offers an excellent learning environment for anyone who wants to pursue a career in animation and design. The faculty is highly experienced and always ready to help. The placement support is also very good.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjV-t-0_X5oVKL3FAG_2c1cz7e64lR-PZsPuquNYfjvxk_bQMIoI=w100-h100-p-rp-mo-ba3-br100'
  },
  {
    name: 'Manish Tiwari',
    role: 'Student',
    rating: 5,
    text: 'From basics to advanced, the courses are structured perfectly. Arena Animation CP is the best place for animation training in Delhi.',
    avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjWAOLjlIG5CKMppC5n1_HOlC2lLO31gyj4K_lC6MTH6p4NDN9oO=w100-h100-p-rp-mo-br100'
  }
];

/* ---------- Build Swiper Slides ---------- */
const wrapper = document.getElementById('testimonialsWrapper');
if (wrapper) {
  testimonials.forEach((t, i) => {
    const stars = Array(5).fill(0).map((_, si) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="${si < t.rating ? 'fill' : 'stroke'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    ).join('');

    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    // Use avatar if provided, else fallback to user icon
    const avatarHtml = t.avatar
      ? `<img src="${t.avatar}" alt="${t.name}" class="avatar-img">`
      : `<i data-lucide="user"></i>`;

    slide.innerHTML = `
      <div class="testimonial-slide">
        <div class="slide-header">
          <div class="slide-avatar">
            ${avatarHtml}
          </div>
          <div class="slide-author">
            <h5>${t.name}</h5>
            <span>${t.role}</span>
          </div>
          <div class="slide-stars">${stars}</div>
        </div>
        <p class="slide-text" data-index="${i}">${t.text}</p>
        <span class="read-more-link" data-index="${i}">Read more</span>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  // Re-init Lucide for dynamically added icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ---------- Init Swiper ---------- */
let testimonialsSwiper;
if (document.querySelector('.testimonials-swiper')) {
  testimonialsSwiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.slider-btn.next',
      prevEl: '.slider-btn.prev',
    },
    breakpoints: {
      600: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

/* ---------- Testimonial Modal ---------- */
const testimonialModal = document.getElementById('testimonialModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const modalName = document.getElementById('modalName');
const modalRole = document.getElementById('modalRole');
const modalText = document.getElementById('modalText');

function openTestimonialModal(index) {
  const t = testimonials[index];
  if (!t) return;
  modalName.textContent = t.name;
  modalRole.textContent = t.role;
  modalText.textContent = t.text;
  testimonialModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTestimonialModal() {
  testimonialModal.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('read-more-link') || e.target.classList.contains('slide-text')) {
    const idx = e.target.dataset.index;
    if (idx !== undefined) openTestimonialModal(+idx);
  }
});

if (closeModal) closeModal.addEventListener('click', closeTestimonialModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeTestimonialModal);

/* ---------- Toast Notification ---------- */
function showToast(message) {
  let toast = document.getElementById('arenaToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'arenaToast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(80px)',
      background: 'hsl(145, 60%, 28%)',
      color: '#fff',
      padding: '1rem 2rem',
      borderRadius: '12px',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '600',
      fontSize: '0.9rem',
      zIndex: '9999',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s',
      opacity: '0',
      maxWidth: '90vw',
      textAlign: 'center',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity = '0';
  }, 4000);
}

/* ---------- Scroll to Quick Enquiry Form ---------- */
function scrollToEnquiry(e) {
  if (e && e.preventDefault) e.preventDefault();

  // Close mobile nav if open
  closeNav();

  const card = document.getElementById('heroEnquiryCard');
  if (!card) return;

  const isMobile = window.innerWidth <= 860;

  // Scroll card into view (smooth)
  card.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'start' : 'center' });

  // Trigger highlight animation after scroll settles
  setTimeout(() => {
    card.classList.remove('cta-highlight');   // reset if already active
    void card.offsetWidth;                     // force reflow
    card.classList.add('cta-highlight');

    // Focus first input for accessibility
    const firstInput = card.querySelector('input, select');
    if (firstInput) firstInput.focus({ preventScroll: true });

    // Remove class after animation ends so it can retrigger
    setTimeout(() => card.classList.remove('cta-highlight'), 900);
  }, isMobile ? 500 : 200);
}

// Expose globally for inline onclick usage
window.scrollToEnquiry = scrollToEnquiry;

/* ---------- Init Lucide ---------- */
if (typeof lucide !== 'undefined') lucide.createIcons();

