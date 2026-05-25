/* JavaScript for mobile controls, forms, counters, lightbox, and theme */
const pageLoader = document.querySelector('.page-loader');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const backTop = document.querySelector('.back-to-top');
const chatButton = document.querySelector('.chat-widget');
const themeToggle = document.querySelector('.theme-toggle');
const counters = document.querySelectorAll('.counter');
const faqButtons = document.querySelectorAll('.accordion-header button');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox img');
const lightboxClose = document.querySelector('.lightbox-close');
const currentTheme = localStorage.getItem('site-theme');
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let countersAnimated = false;
let scrollTicking = false;
const navActions = document.querySelector('.nav-actions');
const navActionsPlaceholder = document.createComment('nav-actions-home');

loadTheme();

if (navActions) {
  navActions.before(navActionsPlaceholder);
}

function hideLoader() {
  if (pageLoader) {
    pageLoader.classList.add('hide');
    setTimeout(() => pageLoader?.remove(), 400);
  }
}

function handleStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY > 20);
  backTop?.classList.toggle('visible', scrollY > 350);
}

function toggleNav() {
  const isOpen = navLinks?.classList.toggle('active');
  navToggle?.setAttribute('aria-expanded', String(Boolean(isOpen)));
  document.body.classList.toggle('nav-open', Boolean(isOpen));
}

function closeNav() {
  navLinks?.classList.remove('active');
  navToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

function syncNavActions() {
  if (!navLinks || !navActions || !navActionsPlaceholder.parentNode) return;

  if (window.innerWidth <= 820 && navActions.parentElement !== navLinks) {
    navLinks.append(navActions);
  } else if (window.innerWidth > 820 && navActions.parentElement === navLinks) {
    navActionsPlaceholder.after(navActions);
  }
}

function smoothScroll(event) {
  if (!event.target.closest('a')) return;
  const anchor = event.target.closest('a');
  if (!anchor.hash) return;
  const target = document.querySelector(anchor.hash);
  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    closeNav();
  }
}

function animateCounters() {
  if (!counters.length || countersAnimated) return;
  countersAnimated = true;
  counters.forEach((counter) => {
    const target = Number(counter.dataset.target) || 0;

    if (prefersReducedMotion) {
      counter.innerText = target;
      return;
    }

    const update = () => {
      const current = Number(counter.innerText.replace(/\D/g, '')) || 0;
      const increment = Math.ceil(target / 80);
      if (current < target) {
        counter.innerText = Math.min(current + increment, target);
        setTimeout(update, 30);
      } else {
        counter.innerText = target;
      }
    };
    update();
  });
}

function openLightbox(event) {
  const image = event.target.closest('.gallery-item img');
  if (!image || !lightbox) return;
  lightboxImage.src = image.dataset.large || image.src;
  lightbox.classList.add('active');
}

function closeLightbox() {
  if (lightbox) lightbox.classList.remove('active');
}

function toggleFaq(event) {
  const header = event.currentTarget.parentElement;
  const panel = header.nextElementSibling;
  panel.classList.toggle('open');
  const expanded = header.querySelector('button').getAttribute('aria-expanded') === 'true';
  header.querySelector('button').setAttribute('aria-expanded', String(!expanded));
}

function setTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('site-theme', mode);
}

function loadTheme() {
  if (currentTheme) {
    setTheme(currentTheme);
  }
}

function initCounterObserver() {
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    animateCounters();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      animateCounters();
      observer.disconnect();
    }
  }, { threshold: 0.35 });

  counters.forEach((counter) => observer.observe(counter));
}

function validateForm(form) {
  const fields = form.querySelectorAll('[data-required]');
  const feedback = form.querySelector('.form-feedback');
  let valid = true;
  let message = 'Please complete the highlighted fields.';

  fields.forEach((field) => {
    const parent = field.closest('.form-group');
    field.style.borderColor = '';
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#ad2e2e';
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      valid = false;
      field.style.borderColor = '#ad2e2e';
    } else if (field.name === 'phone' && !/^\+?[0-9\s-]{7,15}$/.test(field.value)) {
      valid = false;
      field.style.borderColor = '#ad2e2e';
    }
  });

  if (!valid) {
    feedback.textContent = message;
    feedback.classList.add('error');
    return false;
  }

  feedback.textContent = 'Your submission has been received. Thank you!';
  feedback.classList.remove('error');
  return true;
}

function saveAdmissionData() {
  const form = document.querySelector('#admission-form');
  if (!form) return;
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  localStorage.setItem('admission-data', JSON.stringify(data));
}

function populateAdmissionForm() {
  const form = document.querySelector('#admission-form');
  const stored = localStorage.getItem('admission-data');
  if (!form || !stored) return;
  const data = JSON.parse(stored);
  Object.entries(data).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) input.value = value;
  });
}

function initCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.slide');
  if (slides.length < 2 || prefersReducedMotion) return;
  let index = 0;
  const next = () => {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  };
  setInterval(next, 5200);
}

window.addEventListener('load', () => {
  hideLoader();
  populateAdmissionForm();
  initCarousel();
});

handleStickyHeader();
initCounterObserver();
syncNavActions();

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    handleStickyHeader();
    scrollTicking = false;
  });
}, { passive: true });

navToggle?.addEventListener('click', toggleNav);
navToggle?.setAttribute('aria-expanded', 'false');
navLinks?.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') closeNav();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-links') && !event.target.closest('.nav-toggle')) {
    closeNav();
  }

  if (event.target.closest('.gallery-item img')) openLightbox(event);
  if (event.target.closest('.lightbox-close')) closeLightbox();
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener('resize', () => {
  syncNavActions();
  if (window.innerWidth > 820) {
    closeNav();
  }
}, { passive: true });

document.addEventListener('click', smoothScroll);

faqButtons.forEach((button) => {
  button.addEventListener('click', toggleFaq);
});

themeToggle?.addEventListener('click', () => {
  const mode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(mode);
});

if (backTop) {
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

const admissionForm = document.querySelector('#admission-form');
const contactForm = document.querySelector('#contact-form');

if (admissionForm) {
  admissionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm(admissionForm)) {
      saveAdmissionData();
      admissionForm.reset();
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (validateForm(contactForm)) {
      contactForm.reset();
    }
  });
}
