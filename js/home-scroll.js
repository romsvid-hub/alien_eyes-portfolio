/*
  Home scroll scenario (index.html only, with css/home-scroll.css), from 1024px and without
  prefers-reduced-motion. It never touches the scroll position while the visitor scrolls:
  stops are CSS scroll snapping. This file only
  - fades a block out as it leaves the screen, so one block is in focus at a time
    (a block is visible only while it covers more than half of the screen under the header);
  - lets Case Studies, Experience and the finale shoot in from below;
  - picks the active Expertise block (01-04) and fills the progress line;
  - dims the case cards that are not the current one;
  - brings a keyboard-focused element into view if its block is still faded.
  Per frame it reads all positions first, then writes only inline opacity and the progress
  scale (--hm-progress).
*/
(function () {
  var root = document.documentElement;
  var query = window.matchMedia("(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)");
  var nav = document.querySelector(".site-nav");
  var main = document.querySelector("main");
  var footer = document.querySelector(".site-footer");

  function $(selector) {
    return document.querySelector(selector);
  }
  function all(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }
  function clamp(value) {
    return Math.min(1, Math.max(0, value));
  }

  var expertise = $("#expertise");
  var cases = $("#case-studies");
  var experience = $("#experience");
  var finale = $("#feedbacks");
  if (!nav || !main || !footer || !expertise || !cases || !experience || !finale) return;

  var grid = expertise.querySelector(".expertise-grid");
  var items = all("#expertise .expertise-item");
  var steps = all("#expertise .hm-step");
  var cards = all("#case-studies .case-card");

  /* sharp = the block shoots in from below instead of fading in */
  var blocks = [
    { el: $(".hero-section"), targets: function () { return all(".hero-section > .hero-card"); } },
    { el: $(".logos-section"), targets: function () { return all(".logos-section > *"); } },
    { el: expertise, targets: function () { return all("#expertise > .hm-stage"); } },
    {
      el: cases,
      sharp: true,
      targets: function () { return all("#case-studies > .case-studies-heading").concat(cards); },
      // the heading has its own entrance (js/home-enter.js)
      enter: function () { return cards.slice(0, 1); }
    },
    {
      el: experience,
      sharp: true,
      targets: function () { return all("#experience > .experience-heading, #experience > .experience-list"); },
      enter: function () { return all("#experience > .experience-list"); }
    },
    // the reviews can be lent to a header popup, so the finale's children are looked up each time
    { el: finale, end: footer, sharp: true, targets: function () { return all("#feedbacks > *, .site-footer > .site-footer__row"); } }
  ];

  // opening or closing an Experience row must not move the page (css/home-scroll.css);
  // the end stop comes back once the section is off the screen
  experience.addEventListener(
    "click",
    function (event) {
      if (event.target.closest && event.target.closest(".exp__toggle")) experience.classList.add("is-exploring");
    },
    true
  );
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[entries.length - 1].isIntersecting) experience.classList.remove("is-exploring");
    }).observe(experience);
  }

  var active = false;
  var frame = 0;
  var first = true;
  var observer = null;

  function measure() {
    root.style.setProperty("--hm-nav", nav.offsetHeight + "px");
    root.style.setProperty("--hm-footer", footer.offsetHeight + "px");
    if (cards[0]) cases.style.setProperty("--hm-lead", cards[0].offsetTop + "px");
  }

  function setOpacity(element, value) {
    var text = value.toFixed(3);
    if (element.hmOpacity !== text) {
      element.hmOpacity = text;
      element.style.opacity = text;
    }
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

  /* how far (in px) the page is from the stop of a case card; 0 inside a tall card */
  function distanceToCard(index, scroll, sectionTop, navHeight, view) {
    var card = cards[index];
    var top = sectionTop + card.offsetTop;
    var height = card.offsetHeight;
    var from;
    var to;
    if (index === 0) {
      from = sectionTop - navHeight;
      to = Math.max(from, top + height - window.innerHeight);
    } else if (height <= view) {
      from = to = top + height / 2 - (navHeight + view / 2);
    } else {
      from = top - navHeight;
      to = top + height - window.innerHeight;
    }
    return scroll < from ? from - scroll : scroll > to ? scroll - to : 0;
  }

  function update() {
    frame = 0;
    if (!active) return;
    var height = window.innerHeight;
    var navHeight = nav.offsetHeight;
    var view = height - navHeight;
    var scroll = window.scrollY;
    var popup = root.classList.contains("nav-popup-open");
    var writes = []; // applied after every position has been read
    var entering = [];

    blocks.forEach(function (block) {
      var top = block.el.getBoundingClientRect().top;
      var bottom = (block.end || block.el).getBoundingClientRect().bottom;
      var covered = Math.max(0, Math.min(bottom, height) - Math.max(top, navHeight));
      var cover = covered / Math.max(1, Math.min(view, bottom - top));
      // share of the screen, not of the block: only one block can be above one half
      var share = covered / view;
      if (bottom - top < view && bottom <= height + 1 && top >= navHeight - 1) share = cover;
      var incoming = top > navHeight + 1;
      var inFocus = share > 0.5;
      var opacity = block.sharp && incoming ? (inFocus ? 1 : 0) : clamp((share - 0.5) / 0.35);
      if (popup) opacity = 1;

      var shown = inFocus || !incoming;
      if (block.sharp) {
        if (!first && shown && block.shown === false && incoming) entering = entering.concat((block.enter || block.targets)());
        block.shown = shown;
      }

      block.targets().forEach(function (element) {
        var value = opacity;
        var index = cards.indexOf(element);
        if (index !== -1 && !popup) {
          // measured against one card step (card + gap), so tall windows dim the neighbours too
          var reach = Math.min(view, element.offsetHeight + 120);
          var away = distanceToCard(index, scroll, top + scroll, navHeight, view) / reach;
          value = opacity * (1 - clamp((away - 0.15) / 0.4) * 0.85);
        }
        writes.push([element, value]);
      });
    });

    var step = steps.length > 1 ? steps[1].offsetTop - steps[0].offsetTop : 0;
    var inside = step ? navHeight - expertise.getBoundingClientRect().top : 0;

    writes.forEach(function (write) {
      setOpacity(write[0], write[1]);
    });
    if (entering.length) shootIn(entering);

    if (step) {
      var current = Math.min(items.length - 1, Math.max(0, Math.round(inside / step)));
      items.forEach(function (item, i) {
        item.classList.toggle("is-active", i === current);
      });
      grid.style.setProperty("--hm-progress", (0.225 + 0.775 * clamp(inside / (step * (items.length - 1)))).toFixed(3));
    }

    first = false;
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  function relayout() {
    measure();
    schedule();
  }

  /*
    Tab can put focus into a block that is still faded (or a card half on screen, which the
    snapping then pulls away). Bring the focused element's stop into view.
  */
  function onFocus(event) {
    var target = event.target;
    if (!active || !target.matches || !target.matches(":focus-visible")) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var card = target.closest(".case-card");
        var box = target.getBoundingClientRect();
        var hidden = box.top < nav.offsetHeight || box.bottom > window.innerHeight + 1;
        var faded = false;
        for (var node = target; node && node !== document.body; node = node.parentElement) {
          if (parseFloat(getComputedStyle(node).opacity) < 0.9) faded = true;
        }
        if (card && cases.contains(card) && (faded || hidden)) {
          card.scrollIntoView({ block: card === cards[0] ? "start" : "center" });
        } else if (faded || hidden) {
          var slide = target.closest(".hero-section, .logos-section");
          if (slide) slide.scrollIntoView({ block: "start" });
          else if (footer.contains(target)) window.scrollTo(0, document.documentElement.scrollHeight);
          else target.scrollIntoView({ block: "center" });
        }
        schedule();
      });
    });
  }

  function enable() {
    if (active) return;
    active = true;
    first = true;
    root.classList.add("hm-slides");
    grid.classList.add("has-active");
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout, { passive: true });
    window.addEventListener("load", relayout);
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(relayout);
      observer.observe(main);
      observer.observe(footer);
    }
    update();
  }

  function disable() {
    if (!active && !root.classList.contains("hm-slides")) return;
    active = false;
    window.cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove("hm-slides");
    grid.classList.remove("has-active");
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", relayout);
    window.removeEventListener("load", relayout);
    if (observer) observer.disconnect();
    blocks.forEach(function (block) {
      block.targets().forEach(function (element) {
        element.hmOpacity = null;
        element.style.removeProperty("opacity");
      });
    });
    items.forEach(function (item) {
      item.classList.remove("is-active");
    });
    ["--hm-nav", "--hm-footer"].forEach(function (name) {
      root.style.removeProperty(name);
    });
  }

  function sync() {
    if (query.matches) enable();
    else disable();
  }

  document.addEventListener("focusin", onFocus);
  if (query.addEventListener) query.addEventListener("change", sync);
  sync();
})();
