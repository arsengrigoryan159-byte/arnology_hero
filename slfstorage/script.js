import { externalLinks } from './config.js';
import { heroCycleDuration, heroResetAt, heroTimeline, workflowCopy } from './content.js';

document.documentElement.classList.add('motion-ready');

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navPanel = document.querySelector('[data-nav-panel]');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const preview = document.querySelector('[data-preview]');
const hero = document.querySelector('[data-hero]');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function configureExternalLinks() {
  const labels = {
    app: 'Sign in'
  };

  document.querySelectorAll('[data-external]').forEach((link) => {
    const type = link.dataset.external;
    const url = externalLinks[type];

    if (!url) {
      link.addEventListener('click', (event) => event.preventDefault());
      return;
    }

    link.href = url;
    link.classList.remove('is-disabled');
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
    link.removeAttribute('title');
    link.setAttribute('aria-label', labels[type]);
  });

  document.querySelectorAll('[data-config-note]').forEach((note) => {
    note.hidden = Boolean(externalLinks.app);
  });
}

function closeMenu() {
  if (!menuToggle || !navPanel) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navPanel.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

function setupNavigation() {
  if (!menuToggle || !navPanel) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navPanel.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navPanel.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      closeMenu();
      if (wasOpen) menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

function setupHeader() {
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.2, 0.6] }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupReveals() {
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  reveals.forEach((element) => observer.observe(element));
}

function getTimelineStage(elapsed) {
  let frame = heroTimeline[0];
  for (const candidate of heroTimeline) {
    if (elapsed >= candidate.at) frame = candidate;
    else break;
  }
  return frame.stage;
}

function setupHeroParallax() {
  if (!hero) return;

  let pointerFrame = 0;
  let scrollFrame = 0;

  function resetPointer() {
    hero.style.setProperty('--copy-x', '0px');
    hero.style.setProperty('--copy-y', '0px');
    hero.style.setProperty('--preview-x', '0px');
    hero.style.setProperty('--preview-y', '0px');
    hero.style.setProperty('--grid-x', '0px');
    hero.style.setProperty('--grid-y', '0px');
    hero.style.setProperty('--glow-x', '0px');
    hero.style.setProperty('--glow-y', '0px');
  }

  function updateScrollDepth() {
    scrollFrame = 0;
    if (reducedMotionQuery.matches || window.innerWidth <= 700) {
      hero.style.setProperty('--scroll-copy', '0px');
      hero.style.setProperty('--scroll-preview', '0px');
      hero.style.setProperty('--scroll-grid', '0px');
      return;
    }

    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.72)));
    hero.style.setProperty('--scroll-copy', `${(-progress * 8).toFixed(2)}px`);
    hero.style.setProperty('--scroll-preview', `${(progress * 18).toFixed(2)}px`);
    hero.style.setProperty('--scroll-grid', `${(progress * 14).toFixed(2)}px`);
  }

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || reducedMotionQuery.matches) return;
    const rect = hero.getBoundingClientRect();
    const x = Math.min(1, Math.max(-1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const y = Math.min(1, Math.max(-1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));

    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      hero.style.setProperty('--copy-x', `${(-x * 5).toFixed(2)}px`);
      hero.style.setProperty('--copy-y', `${(-y * 4).toFixed(2)}px`);
      hero.style.setProperty('--preview-x', `${(x * 11).toFixed(2)}px`);
      hero.style.setProperty('--preview-y', `${(y * 8).toFixed(2)}px`);
      hero.style.setProperty('--grid-x', `${(x * 7).toFixed(2)}px`);
      hero.style.setProperty('--grid-y', `${(y * 6).toFixed(2)}px`);
      hero.style.setProperty('--glow-x', `${(x * 15).toFixed(2)}px`);
      hero.style.setProperty('--glow-y', `${(y * 12).toFixed(2)}px`);
    });
  });

  hero.addEventListener('pointerleave', resetPointer);
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollDepth);
  }, { passive: true });
  window.addEventListener('resize', updateScrollDepth);
  reducedMotionQuery.addEventListener('change', () => {
    resetPointer();
    updateScrollDepth();
  });
  updateScrollDepth();
}

function setupHeroPreview() {
  if (!preview || !hero) return;

  const facilityA = preview.querySelector('[data-facility="a"]');
  const facilityB = preview.querySelector('[data-facility="b"]');
  const trackFill = preview.querySelector('[data-track-fill]');
  const steps = [...preview.querySelectorAll('[data-preview-step]')];
  const reservationStatus = preview.querySelector('[data-reservation-status]');
  const reservationFacility = preview.querySelector('[data-reservation-facility]');
  const reservationUnit = preview.querySelector('[data-reservation-unit]');
  const unitCode = preview.querySelector('[data-unit-code]');
  const unitFacility = preview.querySelector('[data-unit-facility]');
  const unitCard = preview.querySelector('[data-unit-card]');
  const workflowStatus = preview.querySelector('[data-workflow-copy]');
  const progressStatus = preview.querySelector('[data-progress-copy]');
  const progressFill = preview.querySelector('.card-progress span');
  const verificationCard = preview.querySelector('[data-state-card="verified"]');
  const paymentCard = preview.querySelector('[data-state-card="paid"]');
  const agreementCard = preview.querySelector('[data-state-card="signed"]');
  const verificationState = preview.querySelector('[data-verification-state]');
  const paymentState = preview.querySelector('[data-payment-state]');
  const invoiceState = preview.querySelector('[data-invoice-state]');
  const agreementState = preview.querySelector('[data-agreement-state]');
  const motionLabel = preview.querySelector('[data-motion-label]');

  let renderedStage = -1;
  let running = false;
  let inView = true;
  let inspectionPaused = false;
  let animationFrame = 0;
  let cycleStart = performance.now();
  let pausedElapsed = 0;

  function setCardState(card, active, textElement, activeText, pendingText) {
    card?.classList.toggle('is-pending', !active);
    if (textElement) textElement.textContent = active ? activeText : pendingText;
  }

  function renderStage(stage, immediate = false) {
    if (stage === renderedStage && !immediate) return;
    renderedStage = stage;
    preview.dataset.stage = String(stage);
    if (motionLabel) motionLabel.textContent = heroTimeline[stage]?.label ?? workflowCopy[stage];

    const usesFacilityB = stage >= 1;
    facilityA?.classList.toggle('is-selected', !usesFacilityB);
    facilityB?.classList.toggle('is-selected', usesFacilityB);
    if (!immediate) unitCard?.classList.add('is-switching');

    const applyFacility = () => {
      const facility = usesFacilityB ? 'Facility B' : 'Facility A';
      const unit = usesFacilityB ? 'B-214' : 'A-108';
      if (reservationFacility) reservationFacility.textContent = facility;
      if (reservationUnit) reservationUnit.textContent = `${unit} · ${usesFacilityB ? '10 × 10' : '5 × 10'}`;
      if (unitCode) unitCode.textContent = unit;
      if (unitFacility) unitFacility.textContent = facility;
      unitCard?.classList.remove('is-switching');
    };

    if (immediate) applyFacility();
    else window.setTimeout(applyFacility, 180);

    const currentStep = stage < 2 ? 1 : stage;
    steps.forEach((step, index) => {
      const number = index + 1;
      step.classList.toggle('is-complete', number < currentStep);
      step.classList.toggle('is-current', number === currentStep);
    });

    if (trackFill) trackFill.style.width = `${Math.max(0, ((currentStep - 1) / 4) * 100)}%`;
    if (progressFill) progressFill.style.width = `${(currentStep / 5) * 100}%`;
    if (progressStatus) progressStatus.textContent = `${currentStep} of 5`;
    if (workflowStatus) workflowStatus.textContent = workflowCopy[stage];
    if (reservationStatus) reservationStatus.textContent = stage >= 2 ? 'Reserved' : 'Lead';

    setCardState(verificationCard, stage >= 3, verificationState, 'Verified', 'Pending');
    setCardState(paymentCard, stage >= 4, paymentState, 'Paid', 'Payment due');
    setCardState(agreementCard, stage >= 5, agreementState, 'Signed', 'Awaiting signature');
    if (invoiceState) invoiceState.textContent = stage >= 4 ? 'Invoice record linked' : 'Invoice prepared';
  }

  function canRun() {
    return !reducedMotionQuery.matches && inView && !document.hidden && !inspectionPaused;
  }

  function tick(now) {
    if (!running) return;

    let elapsed = now - cycleStart;
    if (elapsed >= heroCycleDuration) {
      cycleStart = now;
      elapsed = 0;
      preview.classList.remove('is-resetting');
      renderStage(0);
    }

    if (elapsed >= heroResetAt) preview.classList.add('is-resetting');
    else preview.classList.remove('is-resetting');

    renderStage(getTimelineStage(elapsed));
    pausedElapsed = elapsed;
    animationFrame = requestAnimationFrame(tick);
  }

  function resume() {
    if (!canRun() || running) return;
    running = true;
    cycleStart = performance.now() - pausedElapsed;
    preview.classList.remove('is-paused');
    animationFrame = requestAnimationFrame(tick);
  }

  function pause() {
    if (running) {
      cancelAnimationFrame(animationFrame);
      running = false;
    }
    preview.classList.add('is-paused');
  }

  function syncMotion() {
    if (reducedMotionQuery.matches) {
      pause();
      preview.classList.remove('is-resetting', 'is-entering');
      renderStage(5, true);
      return;
    }
    if (canRun()) resume();
    else pause();
  }

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      syncMotion();
    },
    { threshold: [0, 0.15, 0.5] }
  );
  visibilityObserver.observe(hero);

  preview.addEventListener('pointerenter', () => {
    inspectionPaused = true;
    syncMotion();
  });
  preview.addEventListener('pointerleave', () => {
    inspectionPaused = false;
    preview.style.setProperty('--tilt-x', '0deg');
    preview.style.setProperty('--tilt-y', '0deg');
    syncMotion();
  });
  preview.addEventListener('focusin', () => {
    inspectionPaused = true;
    syncMotion();
  });
  preview.addEventListener('focusout', (event) => {
    if (preview.contains(event.relatedTarget)) return;
    inspectionPaused = false;
    syncMotion();
  });

  preview.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || reducedMotionQuery.matches) return;
    const rect = preview.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    preview.style.setProperty('--tilt-x', `${(-y * 3.8).toFixed(2)}deg`);
    preview.style.setProperty('--tilt-y', `${(x * 3.8).toFixed(2)}deg`);
  });

  document.addEventListener('visibilitychange', syncMotion);
  reducedMotionQuery.addEventListener('change', syncMotion);

  if (reducedMotionQuery.matches) {
    renderStage(5, true);
  } else {
    renderStage(0, true);
    preview.classList.add('is-entering');
    window.setTimeout(() => preview.classList.remove('is-entering'), 520);
    syncMotion();
  }
}

configureExternalLinks();
setupNavigation();
setupHeader();
setupReveals();
setupHeroParallax();
setupHeroPreview();
