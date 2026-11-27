/*
  Pointer motion shared by every page (styles: css/home-v2.css, css/case-motion.css, nav.css):
  - tilt: the surface leans towards the cursor (max 4deg, CSS transition on its transform);
  - glow: a sphere (.hm-sphere--follow) follows the cursor with a little lag and drifts back
    to its layout place when the cursor leaves; the surface clips it.

  Surfaces:
    Home hero and case cards, the related-case card      tilt + glow
    case study heroes                                    tilt + glow (in the case's own dark tone)
    the "Case Studies" and "Feedbacks" header popups     glow only
  A sphere that is not in the markup is created on first hover.

  Hover is mouse only and from 1024px; below that, press-and-move (see further down).
  Never with prefers-reduced-motion. Elements are picked up on first use, so cards cloned
  later (js/related-case.js) and popups work too. Per frame only transform changes.
*/
(function () {
  var TILT = ".hero-card, .case-card, .case-hero, .atj-hero, .atj2-hero, .uq2-hero, .yoy-hero, .ridi-hero";
  var FLAT = ".nav-popup--cases, .nav-popup--feedbacks";
  var SURFACE = TILT + ", " + FLAT;

  var pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var MAX_TILT = 4; // degrees
  var EASE = 0.08; // share of the remaining distance covered per 60fps frame

  var attached = new WeakSet();
  var handles = new WeakMap();
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
      point(ev.clientX, ev.clientY);
    }

    function point(clientX, clientY) {
      var r = surface.getBoundingClientRect();
      var cx = clientX - r.left;
      var cy = clientY - r.top;
      px = Math.min(1, Math.max(0, cx / r.width));
      py = Math.min(1, Math.max(0, cy / r.height));
      // offsetLeft / offsetTop ignore transforms: this is the sphere's layout place
      tx = cx - (sphere.offsetLeft + sphere.offsetWidth / 2);
      ty = cy - (sphere.offsetTop + sphere.offsetHeight / 2);
      surface.classList.add("is-hovered");
      run();
    }

    surface.addEventListener("pointermove", move, { passive: true });
    function leave() {
      if (!surface.classList.contains("is-hovered")) return;
      surface.classList.remove("is-hovered", "is-touched");
      px = 0.5;
      py = 0.5;
      tx = 0;
      ty = 0;
      run();
    }

    surface.addEventListener(
      "pointerleave",
      function (ev) {
        if (ev.pointerType === "mouse" && enabled()) leave();
      },
      { passive: true }
    );

    live.push(function () {
      window.cancelAnimationFrame(frame);
      frame = last = x = y = tx = ty = 0;
      surface.classList.remove("is-hovered", "is-touched");
      sphere.style.transform = "";
    });
    var handle = { move: move, point: point, leave: leave };
    handles.set(surface, handle);
    return handle;
  }

  document.addEventListener(
    "pointerover",
    function (ev) {
      if (ev.pointerType !== "mouse" || !enabled() || !ev.target.closest) return;
      var surface = ev.target.closest(SURFACE);
      if (surface && !attached.has(surface)) attach(surface).move(ev);
    },
    { passive: true }
  );

  /*
    Below 1024px: press and hold a card (not on a button or link of its own), then move the
    finger, and the card leans after it. Three gestures stay apart:
      - a finger that moves before the hold is up is a normal scroll;
      - a short tap clicks as usual (a case card opens; a case hero does nothing);
      - once the card is held, the finger tilts it, the page does not scroll, and letting
        go does not open anything.
    A mouse can do the same by dragging, so it can be checked in a narrow desktop window.
  */
  var narrow = window.matchMedia("(max-width: 1023px)");
  var HOLD_MS = 180; // how long a finger must rest before the card takes over
  var SLOP = 10; // px a resting finger may wander
  var TAP_MS = 450; // a still press shorter than this is still a tap
  var press = null;
  var swallowUntil = 0;

  function tiltSurface(target) {
    if (!narrow.matches || reduce.matches || !target || !target.closest) return null;
    var surface = target.closest(TILT);
    if (!surface) return null;
    // buttons and links keep their own behaviour; the link that covers a whole case card does not count
    if (target.closest(".case-card__cta, .btn, button, input, label")) return null;
    var own = target.closest("a");
    if (own && !own.classList.contains("case-card__link")) return null;
    return surface;
  }

  function begin(surface, x, y, isTouch) {
    cancel();
    press = { surface: surface, x: x, y: y, lastX: x, lastY: y, at: Date.now(), held: false, moved: false, touch: isTouch, timer: 0 };
    if (isTouch) press.timer = window.setTimeout(hold, HOLD_MS);
  }

  function hold() {
    if (!press || press.held) return;
    press.held = true;
    if (!attached.has(press.surface)) attach(press.surface);
    press.surface.classList.add("is-touched");
    handles.get(press.surface).point(press.lastX, press.lastY);
  }

  function drag(x, y) {
    press.lastX = x;
    press.lastY = y;
    if (Math.abs(x - press.x) > SLOP || Math.abs(y - press.y) > SLOP) press.moved = true;
    if (press.held) handles.get(press.surface).point(x, y);
  }

  // true when this press was a tilt and must not open anything
  function end() {
    if (!press) return false;
    window.clearTimeout(press.timer);
    var wasTilt = press.held && (press.moved || Date.now() - press.at > TAP_MS);
    if (press.held) handles.get(press.surface).leave();
    press = null;
    if (wasTilt) swallowUntil = Date.now() + 500;
    return wasTilt;
  }

  function cancel() {
    if (!press) return;
    window.clearTimeout(press.timer);
    if (press.held) handles.get(press.surface).leave();
    press = null;
  }

  function onTouchStart(ev) {
    if (ev.touches.length > 1) return cancel();
    var surface = tiltSurface(ev.target);
    if (surface) begin(surface, ev.touches[0].clientX, ev.touches[0].clientY, true);
  }

  function onTouchMove(ev) {
    if (!press || !press.touch) return;
    var t = ev.touches[0];
    if (!press.held) {
      if (Math.abs(t.clientX - press.x) > SLOP || Math.abs(t.clientY - press.y) > SLOP) cancel(); // a scroll
      return;
    }
    if (ev.cancelable) ev.preventDefault();
    drag(t.clientX, t.clientY);
  }

  function onTouchEnd(ev) {
    if (end() && ev.cancelable) ev.preventDefault();
  }

  // the listeners sit on the cards (and on the holder of the related-case card, which is
  // filled later): a page-wide non-passive touchmove would slow down every scroll
  [].forEach.call(document.querySelectorAll(TILT + ", [data-related-case]"), function (el) {
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", cancel, { passive: true });
  });

  document.addEventListener("pointerdown", function (ev) {
    if (ev.pointerType !== "mouse" || ev.button !== 0) return;
    var surface = tiltSurface(ev.target);
    if (surface) begin(surface, ev.clientX, ev.clientY, false);
  });
  document.addEventListener("pointermove", function (ev) {
    if (!press || press.touch || ev.pointerType !== "mouse") return;
    if (!press.held && Math.abs(ev.clientX - press.x) + Math.abs(ev.clientY - press.y) > 4) hold();
    drag(ev.clientX, ev.clientY);
  });
  document.addEventListener("pointerup", function (ev) {
    if (press && !press.touch && ev.pointerType === "mouse") end();
  });
  document.addEventListener("dragstart", function (ev) {
    if (press) ev.preventDefault();
  });
  document.addEventListener("contextmenu", function (ev) {
    if (press && press.touch) ev.preventDefault();
  });
  document.addEventListener(
    "click",
    function (ev) {
      if (Date.now() > swallowUntil) return;
      swallowUntil = 0;
      ev.preventDefault();
      ev.stopPropagation();
    },
    true
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
