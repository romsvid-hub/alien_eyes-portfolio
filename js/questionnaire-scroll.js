/*
  Scroll-linked Body animation for the live questionnaire preview
  (ATJ Case 2, "Question Selection"). The outer .atj2-questionnaire__viewport
  is a fixed-aspect, overflow:hidden crop; this script only ever sets
  `transform: translateY()` on the inner .atj2-questionnaire__body — no
  layout properties are touched, so this never triggers reflow.

  Progress is derived from the element's own bounding rect on scroll
  (rAF-throttled) rather than a timer, and only while the element is
  within IntersectionObserver range, so idle pages do no work at all.
*/
(function () {
  var body = document.querySelector('[data-q-body]');
  var section = document.querySelector('[data-questionnaire]');
  var viewport = section && section.querySelector('.atj2-questionnaire__viewport');
  if (!body || !section || !viewport) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var ticking = false;
  var active = false;
  var maxTranslatePercent = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // maxTranslate = bodyHeight - viewportHeight, expressed as a % of the
  // Body's own height so the transform: translateY(-N%) stays correct
  // at any responsive scale without re-measuring on every frame.
  // Measured from the actual rendered DOM (not Figma's source numbers) —
  // this implementation's text wraps to a shorter total height than the
  // original Figma composition, so a hardcoded Figma-derived percentage
  // would overshoot and expose empty space below the last card.
  function recomputeRange() {
    var bodyHeight = body.getBoundingClientRect().height;
    var viewportHeight = viewport.getBoundingClientRect().height;
    var maxTranslatePx = Math.max(0, bodyHeight - viewportHeight);
    maxTranslatePercent = bodyHeight ? (maxTranslatePx / bodyHeight) * 100 : 0;
  }

  function applyProgress() {
    ticking = false;
    if (reduceMotion.matches) return;

    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var span = vh + rect.height;
    var progress = clamp((vh - rect.top) / span, 0, 1);

    body.style.transform = 'translateY(-' + (progress * maxTranslatePercent) + '%)';
  }

  function onScroll() {
    if (!active || ticking) return;
    ticking = true;
    window.requestAnimationFrame(applyProgress);
  }

  function handleReduceMotionChange() {
    if (reduceMotion.matches) {
      body.style.transform = 'translateY(0)';
    } else {
      applyProgress();
    }
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        active = entry.isIntersecting;
        if (active) {
          recomputeRange();
          applyProgress();
          window.addEventListener('scroll', onScroll, { passive: true });
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      });
    },
    { rootMargin: '20% 0px 20% 0px' }
  );

  observer.observe(section);
  window.addEventListener('resize', function () {
    recomputeRange();
    if (active) applyProgress();
  });

  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', handleReduceMotionChange);
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(handleReduceMotionChange);
  }

  // Initial paint: reflect current scroll position immediately (e.g. on reload mid-page).
  recomputeRange();
  applyProgress();
})();
