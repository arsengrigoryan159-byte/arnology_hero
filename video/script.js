(() => {
  const html = document.documentElement;
  const video = document.getElementById('heroVideo');
  const hero = document.getElementById('hero');
  const content = document.getElementById('heroContent');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let scrollProgress = 0;
  let isResetting = false;
  let revealed = false;

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    html.classList.remove('is-loading');
    html.classList.add('is-ready');
  };

  const safeReveal = window.setTimeout(reveal, 2400);
  const videoReady = () => {
    clearTimeout(safeReveal);
    reveal();
    video.play().catch(() => {});
  };

  if (video.readyState >= 3) videoReady();
  else video.addEventListener('canplay', videoReady, { once: true });

  video.addEventListener('timeupdate', () => {
    if (!video.duration || isResetting) return;
    if (video.duration - video.currentTime < 0.28) {
      isResetting = true;
      video.style.opacity = '0.08';
    }
  });

  video.addEventListener('ended', () => {
    video.currentTime = 0.04;
    video.play().catch(() => {});
    window.setTimeout(() => {
      video.style.opacity = '1';
      isResetting = false;
    }, 120);
  });

  window.addEventListener('pointermove', (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    hero.style.setProperty('--pointer-x', `${event.clientX}px`);
    hero.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollProgress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.82));
  }, { passive: true });

  const animate = () => {
    currentX += (pointerX - currentX) * 0.038;
    currentY += (pointerY - currentY) * 0.038;

    if (!reduced) {
      const x = currentX * 8 - scrollProgress * 10;
      const y = currentY * 5 + scrollProgress * 3;
      const scale = 1.035 + scrollProgress * 0.06;
      video.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      content.style.setProperty('--copy-x', `${currentX * -3}px`);
      content.style.setProperty('--copy-y', `${currentY * -2}px`);
    }
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();
