/*
  Home motion (index.html only, with css/home-v2.css).
  - Hero card: light 3D tilt towards the cursor (max 4deg) and a light spot that follows it
    (CSS variables --mx / --my on .hero-card). Only transform and opacity are animated in CSS
    (transform on the card, opacity of the spot); pointer moves are batched with
    requestAnimationFrame and the listeners are passive.
  - The drifting hero spheres and the glass are pure CSS (see home-v2.css).
  Does nothing with prefers-reduced-motion or on devices without a hovering pointer.
*/
(function () {
  var card = document.querySelector(".hero-card");
  if (!card) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MAX_TILT = 4; // degrees
  var pending = false;
  var px = 0.5;
  var py = 0.5;

  function apply() {
    pending = false;
    card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    card.style.setProperty("--hm-tilt-x", ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + "deg");
    card.style.setProperty("--hm-tilt-y", ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
  }

  card.addEventListener(
    "pointermove",
    function (ev) {
      var r = card.getBoundingClientRect();
      px = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      py = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
      card.classList.add("is-hovered");
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );

  card.addEventListener(
    "pointerleave",
    function () {
      card.classList.remove("is-hovered");
      px = 0.5;
      py = 0.5;
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );
})();
