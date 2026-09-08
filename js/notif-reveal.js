/*
  Notification-card animation — a deliberate, scoped exception to
  js/reveal.js's "once only" rule. The cards inside [data-notif-stagger]
  (the ATJ2 "Notifications" illustration) pop in one after another on
  the way down AND fade back out one after another on the way past, each
  time they cross the viewport, so the little status-message stack reads
  like real notifications arriving/clearing rather than a one-shot
  page-load reveal. Kept separate from reveal.js on purpose: it re-fires
  on every crossing (no unobserve), which the rest of the site never
  does. Same performant-only-properties rule as reveal.js: opacity +
  transform, nothing that touches layout.
*/
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = document.querySelectorAll('[data-notif-stagger]');
  if (!groups.length || reduceMotion) return;
  if (!('IntersectionObserver' in window)) return;

  var STAGGER_MS = 90;

  groups.forEach(function (group) {
    var cards = Array.prototype.slice.call(group.children);
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.classList.add('notif-anim');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var i = cards.indexOf(entry.target);
          // Same top-to-bottom order both ways: first to appear is
          // first to clear, like a real notification queue.
          entry.target.style.transitionDelay = i * STAGGER_MS + 'ms';
          entry.target.classList.toggle('is-shown', entry.isIntersecting);
        });
      },
      { threshold: 0.4 }
    );

    cards.forEach(function (card) {
      observer.observe(card);
    });
  });
})();
