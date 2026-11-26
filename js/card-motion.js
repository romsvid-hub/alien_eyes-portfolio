/*
  Pointer motion shared by every page (styles: css/card-motion.css, css/home-v2.css, nav.css):
  - tilt: the surface leans towards the cursor (max 4deg, CSS transition on its transform);
  - glow: a sphere (.hm-sphere--follow) follows the cursor with a little lag and drifts back
    to its layout place when the cursor leaves; the surface clips it.

  Surfaces:
    Home hero and case cards, the related-case card      tilt + glow
    case study heroes                                    tilt + glow (in the case's own dark tone)
    the "Case Studies" popup of the header               glow only
  A sphere that is not in the markup is created on first hover.

  Mouse only, from 1024px, never with prefers-reduced-motion. Elements are picked up on first
  hover, so cards cloned later (js/related-case.js) and popups work too. Per frame only
  transform changes.
*/
(function () {
  var TILT = ".hero-card, .case-card, .case-hero, .atj-hero, .atj2-hero, .uq2-hero, .yoy-hero, .ridi-hero";
  var FLAT = ".nav-popup--cases";
  var SURFACE = TILT + ", " + FLAT;

  var pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var MAX_TILT = 4; // degrees
  var EASE = 0.08; // share of the remaining distance covered per 60fps frame

  var attached = new WeakSet();
  var live = [];

  function enabled() {
    return pointer.matches && !reduce.matches;
  }

  function sphereOf(surface) {
    for (var i = 0; i < surface.children.length; i++) {
      if (surface.children[i].classList.contains("hm-sphere--follow")) return surface.children[i];
    }
    var sphere = document.createElement("span");
    sphere.className = "hm-sphere hm-sphere--follow hm-sphere--made";
    sphere.setAttribute("aria-hidden", "true");
    surface.insertBefore(sphere, surface.firstChild);
    return sphere;
  }

  function attach(surface) {
    attached.add(surface);
    var tilt = surface.matches(TILT);
    var sphere = sphereOf(surface);
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
      if (tilt) {
        surface.style.setProperty("--hm-tilt-x", ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + "deg");
        surface.style.setProperty("--hm-tilt-y", ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
      }
      x += (tx - x) * k;
      y += (ty - y) * k;
      var arrived = Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5;
      if (arrived) {
        x = tx;
        y = ty;
      }
      sphere.style.transform = x || y ? "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0)" : "";
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

    function move(ev) {
      if (ev.pointerType !== "mouse" || !enabled()) return;
      var r = surface.getBoundingClientRect();
      var cx = ev.clientX - r.left;
      var cy = ev.clientY - r.top;
      px = Math.min(1, Math.max(0, cx / r.width));
      py = Math.min(1, Math.max(0, cy / r.height));
      // offsetLeft / offsetTop ignore transforms: this is the sphere's layout place
      tx = cx - (sphere.offsetLeft + sphere.offsetWidth / 2);
      ty = cy - (sphere.offsetTop + sphere.offsetHeight / 2);
      surface.classList.add("is-hovered");
      run();
    }

    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener(
      "pointerleave",
      function () {
        if (!surface.classList.contains("is-hovered")) return;
        surface.classList.remove("is-hovered");
        px = 0.5;
        py = 0.5;
        tx = 0;
        ty = 0;
        run();
      },
      { passive: true }
    );

    live.push(function () {
      window.cancelAnimationFrame(frame);
      frame = last = x = y = tx = ty = 0;
      surface.classList.remove("is-hovered");
      sphere.style.transform = "";
    });
    return move;
  }

  document.addEventListener(
    "pointerover",
    function (ev) {
      if (ev.pointerType !== "mouse" || !enabled() || !ev.target.closest) return;
      var surface = ev.target.closest(SURFACE);
      if (surface && !attached.has(surface)) attach(surface)(ev);
    },
    { passive: true }
  );

  function resetIfDisabled() {
    if (!enabled()) {
      live.forEach(function (reset) {
        reset();
      });
    }
  }
  [pointer, reduce].forEach(function (query) {
    if (query.addEventListener) query.addEventListener("change", resetIfDisabled);
  });
})();
