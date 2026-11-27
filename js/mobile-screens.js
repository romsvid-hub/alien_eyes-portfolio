/*
  Case pages below 1024px (styles: css/mobile.css). Mobile audit, 2026-11-27.
  - Case nav: hidden over the hero and Impact; slides in under the header once the first
    section of the case nav has reached it.
  - Entrances: parts come in once, as the reader gets to them, and are never hidden again,
    so long sections read as usual. No scroll snapping.
      data-m-screen   a section that fills the display (css) and brings its parts in
      data-m-rise     brings its parts in, no height of its own
      data-m-piece    this element is one part
      data-m-unit     this section or element arrives as one whole
      data-m-static   a filling section whose entrance is someone else's (js/title-enter.js)
      data-m-from     "right", "left", "pop" (default: from below); inherited by parts
    Problem / Solution / Why cards (and the matching triples on the ATJ case) arrive from
    the right, one after another, on every case.
  - ATJ "Research": while its heading stays put, the card in the middle of the screen is
    the one in focus.
  Runs before js/title-enter.js, js/reveal.js, js/notif-reveal.js and js/case-nav.js. From
  1024px it does nothing: there js/case-slides.js is in charge.
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

  var MARK = "[data-m-screen], [data-m-rise], [data-m-static], [data-m-piece]";
  // triples that tell one story: Problem, Solution, Why (and their ATJ counterparts)
  var STORY = ".uq2-decision__grid, .atj2-decision__grid, .yoy-decision__cards, .ridi-decision__cards, .atj-smartfilters__blocks, .atj-jobcard__text";
  // wrappers whose children arrive one by one (a coloured card stays, its content rises)
  var OPEN = ".uq2-panel, .uq2-panel__inner, .uq2-features, .uq2-grid, .uq2-decision, .uq2-results, .case-feedback__row, .case-dash1__cards, .atj2-challenge, .atj2-challenge__content, .atj2-notif, .atj2-solutions, .atj2-solution, .atj2-decision, .yoy-two-col, .yoy-decision, .yoy-decision__body, .ridi-two-col, .ridi-decisions-panel, .ridi-decision, .ridi-decision__body, .atj-painpoints, .atj-research, .atj-research__grid, .atj-insight__row, .atj-insight__text, .atj-smartfilters__composition, .atj-jobcard__row";
  // how each kind of part starts
  var MOVES = {
    up: { opacity: 0, translate: "0 56px", offset: 0 },
    right: { opacity: 0, translate: "72px 0", offset: 0 },
    left: { opacity: 0, translate: "-72px 0", offset: 0 },
    pop: { opacity: 0, translate: "0 40px", scale: "0.9", offset: 0 }
  };
  var SEQUENCE_MS = 140; // between two cards of a story

  var pieces = [];
  var info = new Map(); // piece -> { move, queue }

  function add(element, move, queue) {
    if (info.has(element)) return;
    info.set(element, { move: move, queue: queue || null });
    pieces.push(element);
  }

  // stories first: their cards keep their own direction wherever they sit
  var stories = [].slice.call(document.querySelectorAll(STORY));
  stories.forEach(function (story) {
    var queue = { next: 0 };
    story.removeAttribute("data-reveal-group");
    [].forEach.call(story.children, function (card) {
      card.removeAttribute("data-reveal");
      add(card, "right", queue);
    });
  });

  var sections = [].slice.call(document.querySelectorAll(MARK));

  function collect(element, move) {
    [].forEach.call(element.children, function (child) {
      if (child.matches(MARK)) return; // handled on its own
      if (child.matches("br, script, style") || info.has(child)) return;
      if (getComputedStyle(child).display === "none") return;
      if (child.matches(STORY)) return;
      var from = child.getAttribute("data-m-from") || move;
      if (child.hasAttribute("data-m-unit")) {
        add(child, from);
      } else if (child.querySelector(MARK) || child.querySelector(STORY) || child.querySelector(".atj2-notif[data-m-from]") || child.hasAttribute("data-reveal-group") || (child.matches(OPEN) && child.children.length)) {
        collect(child, from);
      } else {
        add(child, from);
      }
    });
  }

  sections.forEach(function (section) {
    var move = section.getAttribute("data-m-from") || "up";
    if (section.hasAttribute("data-m-static")) return;
    if (section.hasAttribute("data-m-unit") || section.hasAttribute("data-m-piece")) {
      add(section, move);
    } else {
      collect(section, move);
    }
  });

  // one entrance per element: take these over from the other entrance scripts
  sections.concat(stories).forEach(function (section) {
    if (section.hasAttribute("data-m-static")) {
      section.removeAttribute("data-reveal");
      return;
    }
    [section].concat([].slice.call(section.querySelectorAll("[data-reveal], [data-reveal-group], [data-notif-stagger]"))).forEach(function (el) {
      el.removeAttribute("data-reveal");
      el.removeAttribute("data-reveal-group");
      el.removeAttribute("data-notif-stagger");
    });
  });

  function show(piece, delay) {
    if (!piece.classList.contains("m-wait")) return;
    var how = info.get(piece);
    piece.classList.add("m-enter");
    piece.classList.remove("m-wait");
    observer.unobserve(piece);
    if (how.queue) {
      // never two cards of a story at once: each starts a beat after the one before
      var now = Date.now();
      var begin = Math.max(now + delay, how.queue.next);
      how.queue.next = begin + SEQUENCE_MS;
      delay = begin - now;
    }
    var animation = piece.animate([MOVES[how.move] || MOVES.up], {
      duration: how.move === "pop" ? 520 : 480,
      delay: delay,
      easing: how.move === "pop" ? "cubic-bezier(0.34, 1.45, 0.64, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)",
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
        if (!entry.isIntersecting) return;
        show(entry.target, info.get(entry.target).queue ? 0 : Math.min(order++, 4) * 90);
      });
    },
    // parts waiting off to the side still count (they have not been moved yet)
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

  /* ---------- ATJ "Research": the card in the middle of the screen is in focus ---------- */

  var cards = [].slice.call(document.querySelectorAll(".atj-research__card"));
  if (!cards.length || !header) return;
  var heading = document.querySelector(".atj-eyebrow--research");
  var focusFrame = 0;

  function focus() {
    focusFrame = 0;
    if (!narrow.matches) {
      cards.forEach(function (card) {
        card.style.opacity = card.style.scale = "";
      });
      return;
    }
    var top = header.getBoundingClientRect().bottom + 48 + (heading ? heading.offsetHeight : 0);
    var middle = top + (window.innerHeight - top) * 0.45;
    var reach = (window.innerHeight - top) * 0.5;
    cards.forEach(function (card) {
      var box = card.getBoundingClientRect();
      var away = Math.min(1, Math.max(0, (Math.abs(box.top + box.height / 2 - middle) - reach * 0.2) / (reach * 0.8)));
      // never below 0.5: every card stays readable
      card.style.opacity = away ? (1 - 0.5 * away).toFixed(3) : "";
      card.style.scale = away ? (1 - 0.08 * away).toFixed(3) : "";
    });
  }

  function focusSoon() {
    if (!focusFrame) focusFrame = window.requestAnimationFrame(focus);
  }
  window.addEventListener("scroll", focusSoon, { passive: true });
  window.addEventListener("resize", focusSoon);
  window.addEventListener("load", focusSoon);
  focus();
})();
