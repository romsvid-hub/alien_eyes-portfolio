/*
  Endless text shimmer for links marked [data-shimmer] (ATJ job-card
  link, Figma 982:22842). The glint loops (css: .is-shimmering) only
  while the link's section is on screen, and stops when it leaves.
  Does nothing under prefers-reduced-motion.
*/
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  document.querySelectorAll('[data-shimmer]').forEach(function (link) {
    var section = link.closest('section') || link;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          link.classList.toggle('is-shimmering', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-15% 0px -15% 0px' }
    );
    observer.observe(section);
  });
})();
