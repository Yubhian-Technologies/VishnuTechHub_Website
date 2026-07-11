/**
 * ============================================================
 *  VISHNU TECH HUB - script.js
 *  Features:
 *   • Scroll progress bar
 *   • Sticky header with scroll class
 *   • Mobile nav toggle
 *   • Scroll-reveal via IntersectionObserver
 *   • Leadership carousel (swipe + click + auto-advance)
 *   • Smooth close of mobile nav on link click
 * ============================================================
 */

'use strict';

/* ─── DOM Refs ──────────────────────────────────────────── */
const scrollProgressBar = document.getElementById('scrollProgress');
const siteHeader        = document.getElementById('site-header');
const hamburgerBtn      = document.getElementById('navHamburger');
const mobileNav         = document.getElementById('mobileNav');
const mobileNavLinks    = document.querySelectorAll('.mobile-nav-link');
const carouselTrack     = document.getElementById('carouselTrack');
const carouselPrev      = document.getElementById('carouselPrev');
const carouselNext      = document.getElementById('carouselNext');
const carouselDotsWrap  = document.getElementById('carouselDots');
const revealEls         = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

/* ═══════════════════════════════════════════════════════════
   1. SCROLL PROGRESS BAR
═══════════════════════════════════════════════════════════ */
function updateScrollProgress() {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPct    = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgressBar.style.width = `${Math.min(scrollPct, 100)}%`;
}

/* ═══════════════════════════════════════════════════════════
   2. STICKY HEADER
═══════════════════════════════════════════════════════════ */
function updateHeader() {
  if (window.scrollY > 40) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
}

/* ═══════════════════════════════════════════════════════════
   3. MOBILE NAV TOGGLE
═══════════════════════════════════════════════════════════ */
let mobileNavOpen = false;

function openMobileNav() {
  mobileNavOpen = true;
  hamburgerBtn.classList.add('active');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  mobileNav.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNavOpen = false;
  hamburgerBtn.classList.remove('active');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', () => {
  if (mobileNavOpen) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

// Close on any mobile nav link click
mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNavOpen) closeMobileNav();
});

/* ═══════════════════════════════════════════════════════════
   4. SCROLL-REVEAL (IntersectionObserver)
═══════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to keep observing
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════════
   5. LEADERSHIP CAROUSEL
═══════════════════════════════════════════════════════════ */
(function initCarousel() {
  const cards      = carouselTrack.querySelectorAll('.leader-card');
  const totalCards = cards.length;

  // Determine visible cards per viewport
  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  let visibleCount = getVisibleCount();
  let currentIndex = 0;
  let autoTimer    = null;

  /* ── Build dot indicators ─────────────────────────────── */
  function buildDots() {
    carouselDotsWrap.innerHTML = '';
    const stepCount = totalCards - visibleCount + 1;
    for (let i = 0; i < stepCount; i++) {
      const dot = document.createElement('button');
      dot.className  = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToIndex(i));
      carouselDotsWrap.appendChild(dot);
    }
  }

  /* ── Update dot active state ──────────────────────────── */
  function updateDots() {
    const dots = carouselDotsWrap.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      const active = i === currentIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  /* ── Apply transform ──────────────────────────────────── */
  function applyPosition() {
    const cardWidth = 100 / visibleCount; // percent per card
    carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}%)`;
    updateDots();
    // Update card widths
    cards.forEach(card => {
      card.style.flex = `0 0 ${cardWidth}%`;
    });
  }

  /* ── Navigate to index ────────────────────────────────── */
  function goToIndex(index) {
    const maxIndex = totalCards - visibleCount;
    currentIndex   = Math.max(0, Math.min(index, maxIndex));
    applyPosition();
    resetAutoAdvance();
  }

  /* ── Previous / Next ──────────────────────────────────── */
  carouselPrev.addEventListener('click', () => goToIndex(currentIndex - 1));
  carouselNext.addEventListener('click', () => goToIndex(currentIndex + 1));

  /* ── Auto-advance ─────────────────────────────────────── */
  function startAutoAdvance() {
    autoTimer = setInterval(() => {
      const maxIndex = totalCards - visibleCount;
      goToIndex(currentIndex < maxIndex ? currentIndex + 1 : 0);
    }, 3000);
  }

  function resetAutoAdvance() {
    clearInterval(autoTimer);
    startAutoAdvance();
  }

  /* ── Touch / swipe support ────────────────────────────── */
  let touchStartX = 0;
  let touchEndX   = 0;

  carouselTrack.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselTrack.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > 40) {
      goToIndex(delta > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  /* ── Keyboard navigation ──────────────────────────────── */
  carouselTrack.setAttribute('tabindex', '0');
  carouselTrack.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goToIndex(currentIndex - 1);
    if (e.key === 'ArrowRight') goToIndex(currentIndex + 1);
  });

  /* ── Pause on hover ───────────────────────────────────── */
  // carouselTrack.parentElement.addEventListener('mouseenter', () => clearInterval(autoTimer));
  // carouselTrack.parentElement.addEventListener('mouseleave', startAutoAdvance);

  /* ── Resize handler ───────────────────────────────────── */
  let resizeDebounce;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      const newVisible = getVisibleCount();
      if (newVisible !== visibleCount) {
        visibleCount = newVisible;
        currentIndex = Math.min(currentIndex, totalCards - visibleCount);
        buildDots();
        applyPosition();
      }
    }, 150);
  });

  /* ── Init ─────────────────────────────────────────────── */
  buildDots();
  applyPosition();
  startAutoAdvance();

})(); // IIFE

/* ═══════════════════════════════════════════════════════════
   6. SCROLL EVENT HANDLER (throttled)
═══════════════════════════════════════════════════════════ */
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      updateScrollProgress();
      updateHeader();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// Also run once on load
updateScrollProgress();
updateHeader();

/* ═══════════════════════════════════════════════════════════
   7. SMOOTH SCROLL POLYFILL (for older browsers)
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   8. HERO TAGLINE TYPEWRITER (subtle animation on load)
═══════════════════════════════════════════════════════════ */
(function heroEntrance() {
  const headline   = document.querySelector('.hero-headline');
  const tagChip    = document.querySelector('.hero-tagline-chip');
  const heroDesc   = document.querySelector('.hero-description');
  const heroCTA    = document.querySelector('.hero-cta-group');

  // Stagger reveal on DOMContentLoaded
  [tagChip, headline, heroDesc, heroCTA].forEach((el, i) => {
    if (!el) return;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = `opacity 0.8s ease ${0.2 + i * 0.15}s, transform 0.8s ease ${0.2 + i * 0.15}s`;

    // Trigger on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   9. YEAR IN FOOTER (keep current)
═══════════════════════════════════════════════════════════ */
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
  footerYear.textContent = footerYear.textContent.replace(
    /© \d{4}/,
    `© ${new Date().getFullYear()}`
  );
}

/* ═══════════════════════════════════════════════════════════
   10. SERVICE CARD MICRO-INTERACTION
       (stagger cards as they enter viewport)
═══════════════════════════════════════════════════════════ */
const serviceCards = document.querySelectorAll('.service-card');
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, _) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
);

serviceCards.forEach((card, i) => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(28px)';
  card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
  cardObserver.observe(card);
});

/* ═══════════════════════════════════════════════════════════
   11. FLUID CUSTOM CURSOR
═══════════════════════════════════════════════════════════ */
const cursorFluid = document.getElementById('cursor-fluid');

if (cursorFluid && window.matchMedia("(any-hover: hover)").matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Easing for smooth following
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.2;
    cursorY += dy * 0.2;
    
    // Calculate velocity for stretching effect
    const velocity = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate angle for rotation
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Squash and stretch based on velocity
    const scaleX = 1 + Math.min(velocity * 0.005, 0.8);
    const scaleY = 1 - Math.min(velocity * 0.003, 0.4);

    cursorFluid.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();

  document.addEventListener('mouseleave', () => {
    cursorFluid.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursorFluid.style.opacity = '1';
  });
}

