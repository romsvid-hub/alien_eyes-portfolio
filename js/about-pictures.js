/*
  About Me "Pictures" ticker: continuous right-to-left scroll, per
  Roman ("не швидко, не надто повільно"). Speed is driven by px/second
  (not a fixed CSS duration) so it stays visually consistent across
  screen sizes even though .photo-card's own width is responsive
  (clamp(160px, 18vw, 240px)) — a fixed duration would look faster on
  a wide desktop track and slower on a narrow one.

  50px/s: at .photo-card's typical size a single photo takes roughly
  4-5s to cross its own width, so several photos are always visible
  mid-flight and the strip reads as a steady, unhurried drift rather
  than either a slideshow-slow crawl or an attention-grabbing whoosh.

  The track holds the image set twice (see about.html); this only
  needs to measure one set's width (half the full scrollWidth) and
  run the CSS animation defined in css/about.css from translateX(0)
  to translateX(-50%) for a seamless loop.
*/
(function () {
  var track = document.querySelector('.pictures-track__inner');
  if (!track) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SPEED_PX_PER_SEC = 50;
  var setWidth = track.scrollWidth / 2;
  var duration = setWidth / SPEED_PX_PER_SEC;

  track.style.setProperty('--pictures-duration', duration.toFixed(2) + 's');
  track.classList.add('is-animating');
})();
