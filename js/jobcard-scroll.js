/*
  Pinned scroll for the Job Card stage stack (desktop only, >=1024px).
  The heading+row sticks in place (position:sticky on
  .atj-jobcard__pin-inner, which wraps the title too) while
  .atj-jobcard-stages__track scrolls smoothly past the fixed-height,
  overflow:hidden .atj-jobcard-stages window — one continuous
  translate proportional to scroll position, no per-card snapping.
  Because the pin-inner includes the title, it only fully engages once
  the preceding "Matching by Smart Filters" section has scrolled out
  of the way — the title reads cleanly, not mid-transition.

  The window height is set to match .atj-jobcard__text's own rendered
  height, so the cards column runs for roughly the same scroll
  distance as the text column instead of an arbitrary fixed amount.

  The pin is deliberately not a dead stop: on top of the sticky
  position, the block also drifts slowly upward as you scroll through
  it (DRIFT_PX total, spread across the same progress as the cards),
  so the section still visibly, if slowly, keeps scrolling rather than
  freezing outright — the cards get the scroll focus, the page still
  moves underneath.

  Same approach as js/questionnaire-scroll.js: rAF-throttled scroll
  handler, gated by IntersectionObserver so idle pages do no work,
  respects prefers-reduced-motion (skips pinning entirely).
*/
(function () {
  var spacer = document.querySelector('[data-jobcard-pin]');
  var pinInner = document.querySelector('.atj-jobcard__pin-inner');
  var viewport = document.querySelector('[data-jobcard-stages-viewport]');
  var track = document.querySelector('[data-jobcard-stages-track]');
  var text = document.querySelector('.atj-jobcard__text');
  var nav = document.querySelector('.site-nav');
  if (!spacer || !pinInner || !viewport || !track || !text) return;

  var desktop = window.matchMedia('(min-width: 1024px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var DRIFT_PX = 40; // total slow upward drift of the pinned block across the whole pin, kept small so the title never gets close to the header

  var ticking = false;
  var active = false;
  var maxTranslate = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pinEnabled() {
    return desktop.matches && !reduceMotion.matches;
  }

  function recompute() {
    if (nav) {
      document.documentElement.style.setProperty('--jobcard-pin-top', nav.getBoundingClientRect().height + 'px');
    }
    // Match the cards window's height to the text column's own
    // rendered height ("parallel" scroll distance on both sides),
    // rather than a guessed constant.
    var textHeight = text.getBoundingClientRect().height;
    if (textHeight) {
      document.documentElement.style.setProperty('--jobcard-stage-height', Math.round(textHeight) + 'px');
    }

    if (!pinEnabled()) {
      spacer.style.height = 'auto';
      track.style.transform = 'none';
      pinInner.style.transform = 'none';
      maxTranslate = 0;
      return;
    }

    var viewportHeight = viewport.getBoundingClientRect().height;
    var trackHeight = track.scrollHeight;
    maxTranslate = Math.max(0, trackHeight - viewportHeight);

    var pinnedHeight = pinInner.getBoundingClientRect().height;
    spacer.style.height = pinnedHeight + maxTranslate + 'px';
  }

  function applyProgress() {
    ticking = false;
    if (!pinEnabled() || !maxTranslate) return;

    var rect = spacer.getBoundingClientRect();
    var progress = clamp(-rect.top / maxTranslate, 0, 1);
    track.style.transform = 'translateY(-' + progress * maxTranslate + 'px)';
    pinInner.style.transform = 'translateY(-' + progress * DRIFT_PX + 'px)';
  }

  function onScroll() {
    if (!active || ticking) return;
    ticking = true;
    window.requestAnimationFrame(applyProgress);
  }

  function handleChange() {
    recompute();
    applyProgress();
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        active = entry.isIntersecting;
        if (active) {
          recompute();
          applyProgress();
          window.addEventListener('scroll', onScroll, { passive: true });
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      });
    },
    { rootMargin: '0px' }
  );

  observer.observe(spacer);
  window.addEventListener('resize', handleChange);
  // Stage images have no width/height attributes (sized by CSS,
  // responsively), so accurate heights aren't known until they've all
  // decoded — recompute once everything has loaded.
  window.addEventListener('load', handleChange);

  [desktop, reduceMotion].forEach(function (mq) {
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(handleChange);
    }
  });

  // Initial paint: reflect current scroll position immediately (e.g. on reload mid-page).
  recompute();
  applyProgress();
})();
