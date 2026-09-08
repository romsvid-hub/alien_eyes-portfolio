/*
  Scroll-linked animation for the SMB Result phone previews (ATJ Case 2,
  "Small Medium Business Result"). Same technique as
  js/questionnaire-scroll.js (IntersectionObserver + rAF-throttled scroll,
  `transform: translateY()` only, no layout properties touched), but
  generalized to drive N independent [data-smb-body] elements — here the
  two phones (left/right), each scrubbing its own screenshot based on its
  own position in the viewport, completely independently of the other.
*/
(function () {
  var bodies = document.querySelectorAll('[data-smb-body]');
  if (!bodies.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Hold the image still for the first 40% of each frame's own scroll
  // journey (time to read what's at the top of it), then ease into the
  // scroll rather than starting at full speed. Applied independently per
  // side, since each closure below has its own rawProgress/viewport.
  var SCROLL_START_THRESHOLD = 0.4;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // Smoothstep: 0 through the deadzone, then eases in with zero slope
  // right at the threshold (no abrupt jump into motion) up to 1.
  function easeProgress(raw) {
    if (raw <= SCROLL_START_THRESHOLD) return 0;
    var t = clamp((raw - SCROLL_START_THRESHOLD) / (1 - SCROLL_START_THRESHOLD), 0, 1);
    return t * t * (3 - 2 * t);
  }

  bodies.forEach(function (body) {
    var viewport = body.closest('.atj2-smb-mockup__viewport');
    if (!viewport) return;

    var ticking = false;
    var active = false;
    var maxTranslatePercent = 0;

    // maxTranslate = bodyHeight - viewportHeight, as a % of the body's
    // own height (so translateY(-N%) stays correct at any responsive
    // scale) — measured from the actual rendered image, not Figma's
    // source numbers.
    function recomputeRange() {
      var bodyHeight = body.getBoundingClientRect().height;
      var viewportHeight = viewport.getBoundingClientRect().height;
      var maxTranslatePx = Math.max(0, bodyHeight - viewportHeight);
      maxTranslatePercent = bodyHeight ? (maxTranslatePx / bodyHeight) * 100 : 0;
    }

    function applyProgress() {
      ticking = false;
      if (reduceMotion.matches) return;

      var rect = viewport.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var span = vh + rect.height;
      var rawProgress = clamp((vh - rect.top) / span, 0, 1);
      var progress = easeProgress(rawProgress);

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

    observer.observe(viewport);
    window.addEventListener('resize', function () {
      recomputeRange();
      if (active) applyProgress();
    });

    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', handleReduceMotionChange);
    } else if (typeof reduceMotion.addListener === 'function') {
      reduceMotion.addListener(handleReduceMotionChange);
    }

    recomputeRange();
    applyProgress();
  });
})();
