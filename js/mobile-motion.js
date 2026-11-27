/*
  Scroll-linked motion below 1024px (styles: css/mobile.css). Mobile review round 2, 2026-11-28.
  Native scrolling only: nothing is hijacked or snapped, and everything runs backwards too.
    data-m-hold        the block stays on screen for a short stretch of scrolling (a block
                       taller than the screen holds once its end has arrived)
    data-m-exit        as the block leaves, it fades, shrinks and drifts away
                       ("left" / "right" give it a side to leave by)
    data-m-scrollx     a row of screens that moves sideways as the page is scrolled down;
                       a sideways swipe on it scrolls the page by the matching amount
    .atj2-logos        the grey analog logos light up in colour, one after another
  With prefers-reduced-motion none of this runs: rows are swiped by hand, nothing fades.
  From 1024px nothing is done (and the wrappers dissolve, css).
*/
(function () {
  var narrow = window.matchMedia("(max-width: 1023px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!narrow.matches || reduce.matches) return;

  var header = document.querySelector(".site-nav");
  var hasCaseNav = !!document.querySelector("[data-case-nav]");

  // the first pixel a reader can see under the bars
  function base() {
    return (header ? header.getBoundingClientRect().height : 56) + (hasCaseNav ? 48 : 0);
  }

  function wrap(element, className) {
    var box = document.createElement("div");
    box.className = className;
    element.parentNode.insertBefore(box, element);
    box.appendChild(element);
    return box;
  }

  var holds = [].slice.call(document.querySelectorAll("[data-m-hold]")).map(function (element) {
    wrap(element, "m-hold");
    element.classList.add("m-held");
    return { element: element, top: 0 };
  });

  var rows = [].slice.call(document.querySelectorAll("[data-m-scrollx]")).map(function (element) {
    var pin = wrap(element, "m-sx__pin");
    var outer = wrap(pin, "m-sx");
    element.classList.add("m-sx__row");
    return { element: element, pin: pin, outer: outer, top: 0, travel: 0, room: 0 };
  });

  var exits = [].slice.call(document.querySelectorAll("[data-m-exit]")).map(function (element) {
    return { element: element, side: element.getAttribute("data-m-exit"), p: 0 };
  });

  function measure() {
    var top = base();
    var height = window.innerHeight;
    holds.forEach(function (h) {
      // shorter than the room: held under the bars; taller: held once its end is on screen
      h.top = Math.min(top, height - h.element.offsetHeight - 8);
      h.element.style.top = h.top + "px";
    });
    rows.forEach(function (row) {
      row.element.classList.remove("is-still");
      row.travel = row.element.scrollWidth - row.element.clientWidth;
      // everything fits side by side (tablet, phone on its side): a still, centred row
      row.element.classList.toggle("is-still", row.travel < 8);
      if (row.travel < 8) {
        row.outer.style.height = "";
        row.pin.style.position = "static";
        return;
      }
      row.pin.style.position = "";
      var own = row.pin.offsetHeight;
      row.top = top + Math.max(4, (height - top - own) / 2);
      row.room = Math.round(row.travel * 1.15);
      row.pin.style.top = row.top + "px";
      row.outer.style.height = own + row.room + "px";
    });
  }

  function paint() {
    frame = 0;
    if (!narrow.matches) return;
    var top = base();
    var height = window.innerHeight;
    var area = height - top;

    rows.forEach(function (row) {
      if (row.travel < 8) return;
      var passed = row.top - row.outer.getBoundingClientRect().top;
      row.element.scrollLeft = Math.min(1, Math.max(0, passed / row.room)) * row.travel;
    });

    exits.forEach(function (item) {
      var element = item.element;
      var box = element.getBoundingClientRect();
      var shift = item.p * 56 * (item.side === "left" ? -1 : item.side === "right" ? 1 : 0);
      // the box without the drift this script added itself
      // one rule for every block, held or not: it starts only when little of it is left,
      // at most a third of the screen and never more than 60% of the block itself, so it
      // can be read to its end first (a held block cannot meet this while it is held)
      var start = top + Math.min(area * 0.34, box.height * 0.6);
      var p = (start - box.bottom) / Math.max(60, (start - top) * 0.8);
      p = Math.min(1, Math.max(0, p));
      if (Math.abs(p - item.p) < 0.005) return;
      item.p = p;
      shift = p * 56 * (item.side === "left" ? -1 : item.side === "right" ? 1 : 0);
      element.style.opacity = p ? (1 - 0.88 * p).toFixed(3) : "";
      element.style.scale = p ? (1 - 0.1 * p).toFixed(3) : "";
      element.style.translate = p ? shift.toFixed(1) + "px " + (-18 * p).toFixed(1) + "px" : "";
    });
  }

  var frame = 0;
  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(paint);
  }
  function remeasure() {
    if (!narrow.matches) {
      exits.forEach(function (item) {
        item.element.style.opacity = item.element.style.scale = item.element.style.translate = "";
        item.p = 0;
      });
      return;
    }
    measure();
    schedule();
  }

  // a sideways swipe on a moving row is the same journey, so it scrolls the page
  rows.forEach(function (row) {
    var from = null;
    var swiped = 0;
    row.element.addEventListener("pointerdown", function (ev) {
      from = ev.isPrimary && row.travel >= 8 ? { x: ev.clientX, y: ev.clientY, last: ev.clientX, on: false } : null;
    });
    row.element.addEventListener("pointermove", function (ev) {
      if (!from) return;
      if (!from.on) {
        var dx = Math.abs(ev.clientX - from.x);
        if (dx < 10 || dx < Math.abs(ev.clientY - from.y) * 1.3) return;
        from.on = true;
      }
      window.scrollBy({ top: (from.last - ev.clientX) * (row.room / row.travel), behavior: "instant" });
      from.last = ev.clientX;
      swiped = Date.now();
    });
    ["pointerup", "pointercancel"].forEach(function (type) {
      window.addEventListener(type, function () {
        from = null;
      });
    });
    // a swipe is not a tap: it must not open the viewer
    row.element.addEventListener(
      "click",
      function (ev) {
        if (Date.now() - swiped < 400) ev.stopPropagation();
      },
      true
    );
  });

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure);
  if ("ResizeObserver" in window) {
    var watch = new ResizeObserver(function () {
      remeasure();
    });
    holds.forEach(function (h) {
      watch.observe(h.element);
    });
    rows.forEach(function (row) {
      watch.observe(row.pin);
    });
  }
  remeasure();

  /* ---------- analog logos: grey on a phone looked switched off ---------- */

  var logos = document.querySelector(".atj2-logos");
  if (logos && "IntersectionObserver" in window) {
    [].forEach.call(logos.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
    logos.classList.add("m-logos");
    var lit = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        logos.classList.add("is-lit");
        lit.disconnect();
      },
      { threshold: 0.4, rootMargin: "0px 0px -12% 0px" }
    );
    lit.observe(logos);
  }
})();
