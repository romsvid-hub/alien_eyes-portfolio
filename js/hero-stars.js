/*
  Decorative starfield for the hero card: small dots race outward from
  a central point, like flying forward through space toward it — not a
  scattered/chaotic drift. Each star shares one @keyframes
  (hero-star-warp, in home.css) that moves it along rotate(angle) +
  translateX(distance); the angle is randomized per star via a CSS
  custom property, so one keyframe produces radial motion in every
  direction instead of needing a separate keyframe per star.

  Pure CSS transform/opacity per star (GPU-composited, no layout
  cost); this script only runs once on load to create the elements
  and stagger their timing — no per-frame JS, no canvas.
*/
(function () {
  var container = document.querySelector('.hero-card__stars');
  if (!container) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var STAR_COUNT = 42;
  // 8s baseline -> sped up 25% (/1.25) -> slowed back down 10% (*1.1),
  // both per explicit request, in that order: 8 / 1.25 * 1.1 = 7.04.
  var BASE_DURATION = 7.04;

  var frag = document.createDocumentFragment();
  for (var i = 0; i < STAR_COUNT; i++) {
    var star = document.createElement('span');
    star.className = 'hero-card__star';

    var angle = Math.random() * 360;
    var duration = BASE_DURATION * (0.75 + Math.random() * 0.5);
    // Negative delay starts each star mid-flight so they don't all
    // launch from the center in sync on load.
    var delay = -Math.random() * duration;

    star.style.setProperty('--angle', angle.toFixed(1) + 'deg');
    star.style.animationDuration = duration.toFixed(2) + 's';
    star.style.animationDelay = delay.toFixed(2) + 's';

    frag.appendChild(star);
  }
  container.appendChild(frag);
})();
