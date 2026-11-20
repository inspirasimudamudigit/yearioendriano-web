'use strict';
(() => {
  const items = Array.from(document.querySelectorAll('#faq .faq-list > details'), details => ({
    details,
    summary: details.querySelector('summary'),
    answer: details.querySelector('.faq-answer'),
    expanded: details.open,
    animation: null
  }));
  if (!items.length || items.some(item => !item.answer || typeof item.answer.animate !== 'function')) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function settle(item) {
    const animation = item.animation;
    item.animation = null;
    if (animation) animation.cancel();
    item.details.open = item.expanded;
    item.answer.style.removeProperty('height');
    item.answer.style.removeProperty('opacity');
  }

  function expand(item, expanded) {
    const height = item.details.open ? item.answer.getBoundingClientRect().height : 0;
    const opacity = item.details.open ? Number(getComputedStyle(item.answer).opacity) : 0;
    if (item.animation) item.animation.cancel();
    item.animation = null;
    item.expanded = expanded;
    item.details.dataset.expanded = String(expanded);
    item.summary.setAttribute('aria-expanded', String(expanded));
    if (motion.matches || (!expanded && !item.details.open)) { settle(item); return; }

    // Keep the answer visible until its closing animation has finished.
    item.details.open = true;
    item.answer.style.height = 'auto';
    const targetHeight = expanded ? item.answer.scrollHeight : 0;
    item.answer.style.height = height + 'px';
    item.answer.style.opacity = String(opacity);
    const animation = item.answer.animate([
      { height: height + 'px', opacity },
      { height: targetHeight + 'px', opacity: expanded ? 1 : 0 }
    ], { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' });
    item.animation = animation;
    animation.onfinish = () => {
      if (item.animation === animation) settle(item);
    };
  }

  items.forEach((item, index) => {
    // Native grouping remains in the markup as the fallback without animation support.
    item.details.removeAttribute('name');
    item.details.dataset.expanded = String(item.expanded);
    item.answer.id = item.answer.id || 'faq-answer-' + (index + 1);
    item.summary.setAttribute('aria-controls', item.answer.id);
    item.summary.setAttribute('aria-expanded', String(item.expanded));
    item.summary.addEventListener('click', event => {
      event.preventDefault();
      const expanded = !item.expanded;
      if (expanded) items.forEach(other => {
        if (other !== item && other.expanded) expand(other, false);
      });
      expand(item, expanded);
    });
  });

  const reduceMotion = () => { if (motion.matches) items.forEach(settle); };
  if (motion.addEventListener) motion.addEventListener('change', reduceMotion);
  else if (motion.addListener) motion.addListener(reduceMotion);
  window.addEventListener('resize', () => items.forEach(item => {
    if (item.animation) settle(item);
  }));
})();
