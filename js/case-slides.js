/*
  Full-screen blocks on case pages (css/case-motion.css), from 1024px (and 600px of height)
  without prefers-reduced-motion:
  - the Impact block under the hero (the section right before the case nav), like
    "I worked with:" on Home. Ridi has none;
  - every block marked data-focus further down (Challenge, Results and a few more):
    centred on the screen with enough air around it that nothing else shows at its stop.
  Runs before js/case-nav.js, which measures the final layout.

  Stops are native CSS scroll snapping: the top of the page, Impact and every focus block.
  The reading in between stays free: each stretch between two stops is one big snap area
  (.cs-rest), which scrolls freely when it is taller than the screen, plus an end mark
  (.cs-end) so that scrolling back up lands on its last screenful, not at its start. Each
  case-nav item that is not a focus block has a stop of its own (.cs-pin).
  Snapping is switched on only after the page has loaded: while it is loading, the browser
  puts the reader back where they were (reload, Back), and snapping at that moment would
  pull them somewhere else. This script only
  - gives each focus block its air and tells case-nav.js where its stop is;
  - places the snap areas;
  - fades the hero and Impact as they leave, lets the case nav and the first section shoot
    in after Impact, and does the same for a focus block that arrives;
  - brings a keyboard-focused element into view if its block is still faded.
*/
(function () {
  var caseNav = document.querySelector("[data-case-nav]");
  var hero = document.querySelector("main > section");
  if (!caseNav || !hero) return;
  var impact = caseNav.previousElementSibling;
  if (impact === hero || !impact || impact.tagName !== "SECTION") impact = null;
  var blocks = [].slice.call(document.querySelectorAll("main [data-focus]"));
  var anchors = [].slice
    .call(caseNav.querySelectorAll("a[data-case-target]"))
    .map(function (link) {
      return document.getElementById(link.getAttribute("data-case-target"));
    })
    .filter(Boolean);
  if (!impact && !blocks.length) return;

  var next = caseNav.nextElementSibling;
  var header = document.querySelector(".site-nav");
  var footer = document.querySelector(".site-footer");
  if (!next || !header || !footer) return;

  var root = document.documentElement;
  var query = window.matchMedia("(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)");
  var marks = []; // the snap areas and end marks, reused between measurements
  var arrivals = null;

  var BAR = 48; // height of the case nav under the header
  var active = false;
  var frame = 0;
  var shown = true;
  var first = true;
  var observer = null;

  function snapOn() {
    if (active) root.classList.add("cs-snap");
  }

  // two frames later: after the browser has restored the position and the page is laid out;
  // and not before the hero has stopped moving (its stop is measured where it is drawn)
  function snapSoon() {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        // only the movement counts: some heroes also have a background that loops for ever
        var moving = (hero.getAnimations ? hero.getAnimations() : []).filter(function (animation) {
          return animation.transitionProperty === "transform";
        });
        Promise.all(
          moving.map(function (animation) {
            return animation.finished.catch(function () {});
          })
        ).then(snapOn);
      });
    });
  }

  function docTop(element) {
    var y = 0;
    while (element) {
      y += element.offsetTop;
      element = element.offsetParent;
    }
    return y;
  }

  function mark(index, kind, top, height) {
    var el = marks[index];
    if (!el) {
      el = marks[index] = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
    }
    el.className = kind;
    el.style.top = Math.round(top) + "px";
    el.style.height = Math.max(1, Math.round(height)) + "px";
    if (el.parentNode !== document.body) document.body.appendChild(el);
  }

  function px(value) {
    return parseFloat(value) || 0;
  }

  /*
    Air around a focus block, so that at its stop it is alone on the screen, in the middle.
    A plain section gets it as padding (its own background stretches with it); a rounded
    card gets it as margin (the card keeps its shape). A block taller than the screen only
    gets a little air and scrolls inside.
  */
  function giveAir(block, room) {
    var style = getComputedStyle(block);
    var card = block.hmCard;
    if (card === undefined) card = block.hmCard = px(style.borderTopLeftRadius) > 0;
    var content = card ? block.offsetHeight : block.offsetHeight - px(style.paddingTop) - px(style.paddingBottom);
    var air = Math.max(24, Math.floor((room - content) / 2));
    var value = air + "px";
    var first = card ? "marginTop" : "paddingTop";
    var second = card ? "marginBottom" : "paddingBottom";
    if (block.style[first] !== value) {
      block.style[first] = value;
      block.style[second] = value;
    }
    var outside = card ? air : 0;
    block.style.scrollMarginTop = BAR + outside + "px";
    // js/case-nav.js: an anchor on this block has to land on the same spot as its stop
    block.style.setProperty("--case-anchor-gap", outside + "px");
    return outside;
  }

  function measure() {
    // a header popup borrows the reviews, so the page is shorter for a while: keep the free
    // areas as they are, or closing the popup would leave the reader higher up
    if (root.classList.contains("nav-popup-open")) return;
    var head = header.offsetHeight;
    var room = window.innerHeight - head - BAR;
    root.style.setProperty("--cs-nav", head + "px");

    var outsides = blocks.map(function (block) {
      return giveAir(block, room);
    });

    // the nav is sticky, so its natural top is read from the block above it
    var start = impact ? docTop(impact) + impact.offsetHeight : 0;
    var count = 0;
    blocks.forEach(function (block, i) {
      var top = docTop(block) - outsides[i];
      var bottom = docTop(block) + block.offsetHeight + outsides[i];
      if (top - start > 2) {
        mark(count++, "cs-rest", start, top - start);
        if (top - start > room + 1) mark(count++, "cs-end", top - 1, 1);
      }
      if (bottom - top > room + 2) mark(count++, "cs-end", bottom - 1, 1);
      start = bottom - BAR;
    });
    var end = docTop(footer) + footer.offsetHeight;
    mark(count++, "cs-rest", start, end - start);
    // every case-nav item gets a stop of its own, so a jump to it is never pulled elsewhere
    anchors.forEach(function (anchor) {
      if (anchor.hasAttribute("data-focus")) return;
      var gap = px(getComputedStyle(anchor).getPropertyValue("--case-anchor-gap"));
      mark(count++, "cs-pin", docTop(anchor) - gap - BAR, 1);
    });
    while (marks.length > count) {
      var extra = marks.pop();
      if (extra.parentNode) extra.parentNode.removeChild(extra);
    }
  }

  function opacityFor(top, bottom, view, navHeight) {
    var covered = Math.max(0, Math.min(bottom, window.innerHeight) - Math.max(top, navHeight));
    var share = covered / Math.max(1, Math.min(view, bottom - top));
    return Math.min(1, Math.max(0, (share - 0.5) / 0.35));
  }

  function shootIn(elements) {
    elements.forEach(function (element) {
      if (!element.animate) return;
      var entry = element.animate(
        [
          { opacity: 0, translate: "0 140px" },
          { opacity: 1, translate: "0 0" }
        ],
        { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
      // js/case-nav.js reads where the bar is on scroll; while it is flying in, that is
      // not where it ends up, so ask for one more reading once it has landed
      if (element === caseNav) {
        entry.onfinish = function () {
          window.dispatchEvent(new Event("scroll"));
        };
      }
    });
  }

  function update() {
    frame = 0;
    if (!active || !impact) return;
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
    var block = hero.contains(target) ? hero : impact && impact.contains(target) ? impact : null;
    if (!block) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (parseFloat(getComputedStyle(block).opacity) < 0.9 || offScreen(target)) {
          if (block === hero) window.scrollTo(0, 0);
          else impact.scrollIntoView({ block: "start" });
          // a hero taller than the window: go on down to the focused element
          if (offScreen(target)) {
            var below = target.getBoundingClientRect().bottom - window.innerHeight + 24;
            window.scrollBy({ top: below, behavior: "instant" });
          }
        }
      });
    });
  }

  function offScreen(element) {
    var box = element.getBoundingClientRect();
    return box.bottom > window.innerHeight || box.top < header.offsetHeight;
  }

  // a focus block that comes onto an empty screen shoots in, like Impact and the nav
  function watchArrivals() {
    if (!("IntersectionObserver" in window)) return;
    var armed = new WeakMap();
    var started = false;
    arrivals = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var share = entry.intersectionRect.height / Math.max(1, Math.min(entry.boundingClientRect.height, window.innerHeight));
          if (!entry.isIntersecting) armed.set(entry.target, true);
          else if (share >= 0.25 && armed.get(entry.target)) {
            armed.set(entry.target, false);
            // blocks with their own entrance (js/title-enter.js) stay where they are
            if (started && !entry.target.hasAttribute("data-enter")) shootIn([entry.target]);
          }
        });
        started = true;
      },
      { threshold: [0, 0.25, 0.5] }
    );
    blocks.forEach(function (block) {
      arrivals.observe(block);
    });
  }

  function enable() {
    if (active) return;
    active = true;
    first = true;
    root.classList.add("cs-slides");
    if (impact) {
      hero.classList.add("cs-hero");
      impact.classList.add("cs-impact");
    }
    measure();
    watchArrivals();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout, { passive: true });
    window.addEventListener("load", relayout);
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(relayout);
      observer.observe(document.querySelector("main"));
      observer.observe(footer);
    }
    if (document.readyState === "complete") snapSoon();
    else window.addEventListener("load", snapSoon);
    update();
  }

  function disable() {
    if (!active) return;
    active = false;
    window.cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove("cs-slides", "cs-snap");
    window.removeEventListener("load", snapSoon);
    root.style.removeProperty("--cs-nav");
    hero.classList.remove("cs-hero");
    if (impact) {
      impact.classList.remove("cs-impact");
      [hero, impact, caseNav, next].forEach(function (element) {
        element.style.removeProperty("opacity");
      });
    }
    blocks.forEach(function (block) {
      ["padding-top", "padding-bottom", "margin-top", "margin-bottom", "scroll-margin-top", "--case-anchor-gap"].forEach(function (name) {
        block.style.removeProperty(name);
      });
    });
    marks.forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    marks = [];
    if (arrivals) arrivals.disconnect();
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
