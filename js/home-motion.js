/*
  Home motion (index.html only, with css/home-v2.css). Hero card and the six case cards:
  - light 3D tilt towards the cursor (max 4deg), CSS transition on the card's transform;
  - the card's Glow sphere (.hm-sphere--follow, Figma 1134:790 / 1134:792) follows the
    cursor with a little lag and drifts back to its Figma place when the cursor leaves.
    The card clips it (overflow: hidden + radius). Only transform changes per frame.
  Mouse only, and only from 1024px: on touch, narrow screens and with
  prefers-reduced-motion the sphere stays where the layout puts it.
*/
(function () {
  var cards = [].slice.call(document.querySelectorAll(".hero-card, .case-card"));
  if (!cards.length) return;

  var pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var MAX_TILT = 4; // degrees
  var EASE = 0.08; // share of the remaining distance covered per 60fps frame

  function enabled() {
    return pointer.matches && !reduce.matches;
  }

  var resets = cards.map(function (card) {
    var sphere = card.querySelector(".hm-sphere--follow");
    var frame = 0;
    var last = 0;
    var px = 0.5;
    var py = 0.5;
    var x = 0; // current offset of the sphere from its layout place
    var y = 0;
    var tx = 0; // where it is heading
    var ty = 0;

    function step(now) {
      var k = 1 - Math.pow(1 - EASE, Math.min(64, last ? now - last : 16.7) / 16.7);
      last = now;
      card.style.setProperty("--hm-tilt-x", ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + "deg");
      card.style.setProperty("--hm-tilt-y", ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");

      x += (tx - x) * k;
      y += (ty - y) * k;
      var arrived = Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5;
      if (arrived) {
        x = tx;
        y = ty;
      }
      if (sphere) {
        sphere.style.transform = x || y ? "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0)" : "";
      }
      if (arrived) {
        frame = 0;
        last = 0;
      } else {
        frame = window.requestAnimationFrame(step);
      }
    }

    function run() {
      if (!frame) frame = window.requestAnimationFrame(step);
    }

    card.addEventListener(
      "pointermove",
      function (ev) {
        if (ev.pointerType !== "mouse" || !enabled()) return;
        var r = card.getBoundingClientRect();
        var cx = ev.clientX - r.left;
        var cy = ev.clientY - r.top;
        px = Math.min(1, Math.max(0, cx / r.width));
        py = Math.min(1, Math.max(0, cy / r.height));
        if (sphere) {
          // offsetLeft / offsetTop ignore transforms: this is the layout (Figma) place
          tx = cx - (sphere.offsetLeft + sphere.offsetWidth / 2);
          ty = cy - (sphere.offsetTop + sphere.offsetHeight / 2);
        }
        card.classList.add("is-hovered");
        run();
      },
      { passive: true }
    );

    card.addEventListener(
      "pointerleave",
      function () {
        if (!card.classList.contains("is-hovered")) return;
        card.classList.remove("is-hovered");
        px = 0.5;
        py = 0.5;
        tx = 0;
        ty = 0;
        run();
      },
      { passive: true }
    );

    return function () {
      window.cancelAnimationFrame(frame);
      frame = last = x = y = tx = ty = 0;
      card.classList.remove("is-hovered");
      if (sphere) sphere.style.transform = "";
    };
  });

  function resetIfDisabled() {
    if (!enabled()) {
      resets.forEach(function (reset) {
        reset();
      });
    }
  }
  [pointer, reduce].forEach(function (query) {
    if (query.addEventListener) query.addEventListener("change", resetIfDisabled);
  });
})();
