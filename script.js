(() => {
  const html = document.documentElement;
  const video = document.getElementById('heroVideo');
  const hero = document.getElementById('hero');
  const content = document.getElementById('heroContent');
  const progressBar = document.getElementById('scrollProgress');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let scrollProgress = 0;
  let isResetting = false;

  const reveal = () => {
    html.classList.remove('is-loading');
    html.classList.add('is-ready');
  };

  const safeReveal = window.setTimeout(reveal, 2200);
  const videoReady = () => {
    clearTimeout(safeReveal);
    reveal();
    video.play().catch(() => {});
  };

  if (video.readyState >= 3) videoReady();
  else video.addEventListener('canplay', videoReady, { once: true });

  // Hide the visible jump between the generated final and initial frames.
  video.addEventListener('timeupdate', () => {
    if (!video.duration || isResetting) return;
    if (video.duration - video.currentTime < 0.32) {
      isResetting = true;
      video.style.opacity = '0.14';
    }
  });

  video.addEventListener('ended', () => {
    video.currentTime = 0.04;
    video.play().catch(() => {});
    requestAnimationFrame(() => {
      setTimeout(() => {
        video.style.opacity = '1';
        isResetting = false;
      }, 90);
    });
  });

  window.addEventListener('pointermove', (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    scrollProgress = Math.min(1, y / Math.max(1, window.innerHeight * 0.72));
    progressBar?.style.setProperty('--progress', `${scrollProgress * 100}%`);
    hero.style.setProperty('--hero-progress', scrollProgress.toFixed(3));
  }, { passive: true });

  const animate = () => {
    currentX += (pointerX - currentX) * 0.045;
    currentY += (pointerY - currentY) * 0.045;

    if (!reduced) {
      const x = currentX * 10 - scrollProgress * 14;
      const y = currentY * 6 + scrollProgress * 4;
      const scale = 1.045 + scrollProgress * 0.065;
      video.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      content.style.setProperty('--copy-x', `${currentX * -4}px`);
      content.style.setProperty('--copy-y', `${currentY * -3}px`);
      content.style.opacity = `${1 - scrollProgress * 0.68}`;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
})();
