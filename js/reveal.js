/*
  Reusable scroll-reveal driver. Pairs with css/reveal.css.

  - [data-reveal] elements fade+rise in once, the first time they enter
    the viewport, then are left alone (no replay on scroll-back).
  - [data-reveal-group] elements: each direct child is treated the same
    way, staggered left-to-right by DOM order via --reveal-index (read by
    reveal.css's transition-delay). Override the stagger amount with
    data-reveal-stagger="150" (ms) on the group.
  - Respects prefers-reduced-motion: reduce by never touching opacity/
    transform at all — matched elements stay in their normal, fully
    visible, static state.
*/
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var targets = [];

  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    var stagger = group.getAttribute('data-reveal-stagger') || '120';
    group.style.setProperty('--reveal-stagger', stagger + 'ms');
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--reveal-index', i);
      targets.push(child);
    });
  });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    targets.push(el);
  });

  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    // No observer support: skip the animation, leave content visible.
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  targets.forEach(function (el) {
    el.classList.add('reveal-init');
    observer.observe(el);
  });
})();
