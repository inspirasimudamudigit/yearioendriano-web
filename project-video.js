'use strict';
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(window.navigator.connection?.saveData);
  document.querySelectorAll('.project-demo[id]').forEach(video => {
    const button = document.querySelector('.demo-toggle[aria-controls="' + video.id + '"]');
    if (!button) return;
    const label = button.querySelector('.demo-toggle-label');
    const icon = button.querySelector('.demo-toggle-icon');
    const project = video.dataset.label || 'proyek';
    let visible = false;
    let loaded = false;
    let userPaused = false;
    let userStarted = false;
    let pending = false;

    function updateControl() {
      const playing = !video.paused;
      label.textContent = playing ? 'Jeda demo' : 'Putar demo';
      icon.textContent = playing ? 'Ⅱ' : '▶';
      button.setAttribute('aria-label', (playing ? 'Jeda' : 'Putar') + ' video demo ' + project);
    }
    function loadVideo() {
      if (loaded) return;
      video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
      video.muted = true;
      video.load();
      loaded = true;
    }
    async function syncPlayback() {
      const shouldPlay = visible && !document.hidden && !document.querySelector('dialog[open]') &&
        !userPaused && ((!motion.matches && !saveData) || userStarted);
      if (!shouldPlay) { video.pause(); return; }
      if (!video.paused || pending) return;
      loadVideo();
      pending = true;
      try { await video.play(); }
      catch (error) { if (error.name !== 'AbortError') userPaused = true; }
      finally { pending = false; updateControl(); }
    }
    button.addEventListener('click', () => {
      if (!video.paused || pending) {
        userPaused = true;
        video.pause();
        updateControl();
      } else {
        userStarted = true;
        userPaused = false;
        visible = true;
        syncPlayback();
      }
    });
    video.addEventListener('play', updateControl);
    video.addEventListener('pause', updateControl);
    video.addEventListener('error', () => { userPaused = true; updateControl(); });
    document.addEventListener('visibilitychange', syncPlayback);
    document.addEventListener('portfolio:dialogchange', syncPlayback);
    if (motion.addEventListener) motion.addEventListener('change', syncPlayback);
    else if (motion.addListener) motion.addListener(syncPlayback);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
        syncPlayback();
      }, { threshold: [0, 0.15] });
      observer.observe(video);
    } else { visible = true; syncPlayback(); }
    button.hidden = false;
    updateControl();
  });
})();
