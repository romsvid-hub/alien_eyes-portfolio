/*
  Pinned scroll for the recalibrated top+nav+dashboard trio (Uniqkey
  case, "Redesigned 2/2" section). Same technique as
  js/uniqkey-dash1-scroll.js / js/jobcard-scroll.js: the top+menu stick
  in place (.case-dash2__sticky, which wraps the Top.png header as well
  as the menu/dashboard row) while the dashboard screenshot translates
  upward past a fixed-height, overflow:hidden window — one continuous
  translate proportional to scroll position, no drift, no snapping.

  Not gated to desktop — the row stays horizontal (menu + dashboard
  side by side) at every breakpoint, so the pin/reveal effect runs at
  every breakpoint too. Only prefers-reduced-motion disables it,
  falling back to a plain static row — still side by side, just with
  no pin and no translate.

  The window height is set to match the menu image's own rendered
  height, so "how much of the dashboard shot is visible before you
  start scrolling" is exactly the menu's height, per spec.
*/
(function () {
  var spacer = document.querySelector('[data-dash2-pin]');
  var pinInner = document.querySelector('.case-dash2__sticky');
  var menu = document.querySelector('[data-dash2-menu]');
  var viewport = document.querySelector('[data-dash2-db-viewport]');
  var track = document.querySelector('[data-dash2-db-track]');
  var nav = document.querySelector('.site-nav');
  if (!spacer || !pinInner || !menu || !viewport || !track) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var ticking = false;
  var active = false;
  var maxTranslate = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pinEnabled() {
    return !reduceMotion.matches;
  }

  function recompute() {
    if (nav) {
      document.documentElement.style.setProperty('--dash2-pin-top', nav.getBoundingClientRect().height + 'px');
    }

    if (!pinEnabled()) {
      spacer.style.height = 'auto';
      viewport.style.height = 'auto';
      track.style.transform = 'none';
      maxTranslate = 0;
      return;
    }

    var menuHeight = menu.getBoundingClientRect().height;
    if (!menuHeight) return;
    viewport.style.height = Math.round(menuHeight) + 'px';

    var trackHeight = track.getBoundingClientRect().height;
    maxTranslate = Math.max(0, trackHeight - menuHeight);

    var pinnedHeight = pinInner.getBoundingClientRect().height;
    spacer.style.height = pinnedHeight + maxTranslate + 'px';
  }

  function applyProgress() {
    ticking = false;
    if (!pinEnabled() || !maxTranslate) return;

    var rect = spacer.getBoundingClientRect();
    var progress = clamp(-rect.top / maxTranslate, 0, 1);
    track.style.transform = 'translateY(-' + progress * maxTranslate + 'px)';
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
  // Both images have no width/height attributes (sized by CSS,
  // responsively), so accurate heights aren't known until they've
  // decoded — recompute once everything has loaded. Also listen on
  // each image directly (not just window 'load'): on a slow connection
  // the menu image can decode after the IntersectionObserver's first
  // recompute() already ran and read a 0 height, which would otherwise
  // leave the DB window at its unset/auto height indefinitely.
  window.addEventListener('load', handleChange);
  if (!menu.complete) menu.addEventListener('load', handleChange, { once: true });
  if (!track.complete) track.addEventListener('load', handleChange, { once: true });

  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', handleChange);
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(handleChange);
  }

  // Initial paint: reflect current scroll position immediately (e.g. on reload mid-page).
  recompute();
  applyProgress();
})();
