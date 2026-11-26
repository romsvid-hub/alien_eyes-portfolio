/*
  B3: on case pages with an Impact block (the section right before the case nav), that block
  takes the whole screen, like "I worked with:" on Home (css/case-motion.css). From 1024px
  (and 600px of height) without prefers-reduced-motion. Ridi has no Impact block: nothing
  happens there. Runs before js/case-nav.js, which measures the final layout.

  Stops are native CSS scroll snapping: top of the page, Impact, and the case nav; from the
  nav down the page scrolls freely. This script only
  - sizes the snap area that makes the rest of the page free (.cs-rest);
  - fades the hero and Impact as they leave, so one of them is in focus at a time;
  - lets the case nav and the first section shoot in after Impact;
  - brings a keyboard-focused element into view if its block is still faded.
*/
(function () {
  var caseNav = document.querySelector("[data-case-nav]");
  var hero = document.querySelector("main > section");
  var impact = caseNav && caseNav.previousElementSibling;
  if (!hero || !impact || impact === hero || impact.tagName !== "SECTION") return;

  var next = caseNav.nextElementSibling;
  var header = document.querySelector(".site-nav");
  var footer = document.querySelector(".site-footer");
  if (!next || !header || !footer) return;

  var root = document.documentElement;
  var query = window.matchMedia("(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)");
  var rest = document.createElement("div");
  rest.className = "cs-rest";
  rest.setAttribute("aria-hidden", "true");

  var active = false;
  var frame = 0;
  var shown = true;
  var first = true;
  var observer = null;

  function docTop(element) {
    var y = 0;
    while (element) {
      y += element.offsetTop;
      element = element.offsetParent;
    }
    return y;
  }

  function measure() {
    root.style.setProperty("--cs-nav", header.offsetHeight + "px");
    // the nav is sticky, so its natural top is read from the block above it
    var top = docTop(impact) + impact.offsetHeight;
    var end = docTop(footer) + footer.offsetHeight;
    rest.style.top = top + "px";
    rest.style.height = Math.max(0, end - top) + "px";
  }

  function opacityFor(top, bottom, view, navHeight) {
    var covered = Math.max(0, Math.min(bottom, window.innerHeight) - Math.max(top, navHeight));
    var share = covered / Math.max(1, Math.min(view, bottom - top));
    return Math.min(1, Math.max(0, (share - 0.5) / 0.35));
  }

  function shootIn(elements) {
    elements.forEach(function (element) {
      if (!element.animate) return;
      element.animate(
        [
          { opacity: 0, translate: "0 140px" },
          { opacity: 1, translate: "0 0" }
        ],
        { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
    });
  }

  function update() {
    frame = 0;
    if (!active) return;
    var navHeight = header.offsetHeight;
    var view = window.innerHeight - navHeight;
    var popup = root.classList.contains("nav-popup-open");
    var h = hero.getBoundingClientRect();
    var i = impact.getBoundingClientRect();
    var n = next.getBoundingClientRect();

    var heroOpacity = popup ? 1 : opacityFor(h.top, h.bottom, view, navHeight);
    var impactOpacity = popup ? 1 : opacityFor(i.top, i.bottom, view, navHeight);
    // the block after Impact: hidden until Impact is less than half of the screen
    var impactShare = Math.max(0, i.bottom - navHeight) / view;
    var nextShown = popup || i.top <= navHeight + 1 ? impactShare < 0.5 : false;

    hero.style.opacity = heroOpacity.toFixed(3);
    impact.style.opacity = impactOpacity.toFixed(3);
    var nextOpacity = nextShown || n.top <= navHeight ? "" : "0";
    caseNav.style.opacity = nextOpacity;
    next.style.opacity = nextOpacity;
    if (!first && nextShown && !shown && n.top > navHeight) shootIn([caseNav, next]);
    shown = nextShown;
    first = false;
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  function relayout() {
    measure();
    schedule();
  }

  function onFocus(event) {
    var target = event.target;
    if (!active || !target.matches || !target.matches(":focus-visible")) return;
    var block = hero.contains(target) ? hero : impact.contains(target) ? impact : null;
    if (!block) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (parseFloat(getComputedStyle(block).opacity) < 0.9) {
          if (block === hero) window.scrollTo(0, 0);
          else impact.scrollIntoView({ block: "start" });
        }
      });
    });
  }

  function enable() {
    if (active) return;
    active = true;
    first = true;
    root.classList.add("cs-slides");
    hero.classList.add("cs-hero");
    impact.classList.add("cs-impact");
    document.body.appendChild(rest);
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout, { passive: true });
    window.addEventListener("load", relayout);
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(relayout);
      observer.observe(document.querySelector("main"));
      observer.observe(footer);
    }
    update();
  }

  function disable() {
    if (!active) return;
    active = false;
    window.cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove("cs-slides");
    root.style.removeProperty("--cs-nav");
    hero.classList.remove("cs-hero");
    impact.classList.remove("cs-impact");
    [hero, impact, caseNav, next].forEach(function (element) {
      element.style.removeProperty("opacity");
    });
    if (rest.parentNode) rest.parentNode.removeChild(rest);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", relayout);
    window.removeEventListener("load", relayout);
    if (observer) observer.disconnect();
  }

  function sync() {
    if (query.matches) enable();
    else disable();
  }

  document.addEventListener("focusin", onFocus);
  if (query.addEventListener) query.addEventListener("change", sync);
  sync();
})();
