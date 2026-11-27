/*
  Case pages below 1024px (styles: css/mobile.css). Mobile audit, 2026-11-27.
  - Case nav: hidden over the hero and Impact; slides in under the header once the first
    section of the case nav has reached it.
  - Entrances: the sections marked data-m-screen (fills the display) or data-m-rise bring
    their parts up one after another, once, as the reader gets to them. Nothing is ever
    hidden again, so long sections read as usual. No scroll snapping.
  Runs before js/title-enter.js, js/reveal.js and js/case-nav.js. From 1024px it does
  nothing: there js/case-slides.js is in charge.
*/
(function () {
  var narrow = window.matchMedia("(max-width: 1023px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;

  var nav = document.querySelector("[data-case-nav]");
  var header = document.querySelector(".site-nav");
  var link = nav && nav.querySelector("a[data-case-target]");
  var start = link && document.getElementById(link.getAttribute("data-case-target"));

  if (nav && header && start) {
    var frame = 0;
    var sync = function () {
      frame = 0;
      if (!narrow.matches) {
        root.classList.remove("m-nav");
        nav.classList.remove("is-shown");
        return;
      }
      root.classList.add("m-nav");
      var line = header.getBoundingClientRect().bottom + 48 + 8;
      var wasShown = nav.classList.contains("is-shown");
      var shown = start.getBoundingClientRect().top <= line;
      nav.classList.toggle("is-shown", shown);
      // coming back in on the first section: from the start of the row, whatever was
      // swiped before (further down, js/case-nav.js keeps the active item in view)
      var current = nav.querySelector("a[aria-current]");
      if (shown && !wasShown && (!current || current === link)) nav.scrollLeft = 0;
    };
    var schedule = function () {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    window.addEventListener("pageshow", schedule);
    sync();
  }

  if (!narrow.matches || reduce.matches) return;
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;

  var MARK = "[data-m-screen], [data-m-rise]";
  // wrappers whose children arrive one by one (a coloured card stays, its content rises)
  var OPEN = ".uq2-panel, .uq2-panel__inner, .uq2-features, .uq2-grid, .uq2-decision, .uq2-decision__grid, .uq2-results, .case-feedback__row, .case-dash1__cards";

  var sections = [].slice.call(document.querySelectorAll(MARK));
  if (!sections.length) return;

  var pieces = [];

  function collect(element) {
    [].forEach.call(element.children, function (child) {
      if (child.matches(MARK)) return; // brings its own parts
      if (child.matches("br, script, style")) return;
      if (child.querySelector(MARK) || child.hasAttribute("data-reveal-group") || (child.matches(OPEN) && child.children.length)) {
        collect(child);
      } else {
        pieces.push(child);
      }
    });
  }

  sections.forEach(collect);

  // one entrance per element: take these over from js/reveal.js
  sections.forEach(function (section) {
    [section].concat([].slice.call(section.querySelectorAll("[data-reveal], [data-reveal-group]"))).forEach(function (el) {
      el.removeAttribute("data-reveal");
      el.removeAttribute("data-reveal-group");
    });
  });

  function show(piece, delay) {
    if (!piece.classList.contains("m-wait")) return;
    piece.classList.add("m-enter");
    piece.classList.remove("m-wait");
    observer.unobserve(piece);
    var animation = piece.animate([{ opacity: 0, translate: "0 56px", offset: 0 }], {
      duration: 480,
      delay: delay,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "backwards"
    });
    var done = function () {
      piece.classList.remove("m-enter");
    };
    animation.onfinish = done;
    animation.oncancel = done;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var order = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target, Math.min(order++, 4) * 90);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  pieces.forEach(function (piece) {
    piece.classList.add("m-wait");
    observer.observe(piece);
  });

  function showAll() {
    pieces.forEach(function (piece) {
      show(piece, 0);
    });
  }

  // keyboard focus must never land on something still hidden
  document.addEventListener("focusin", function (event) {
    pieces.forEach(function (piece) {
      if (piece.contains(event.target)) show(piece, 0);
    });
  });

  var widened = function () {
    if (!narrow.matches) showAll();
  };
  if (narrow.addEventListener) narrow.addEventListener("change", widened);
})();
