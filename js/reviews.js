/*
  Content verified 2026-08-25 from the Figma file "Copy portfolio"
  (fileKey DU3fuTo8QXIJ0uMcI3jh91), System part board (2:15045) —
  the Reviews component's variant documentation lists all 6 states in
  order, matching the 6-segment progress bar. Transcribed as written
  in Figma, including its own inconsistent quote-mark placement in a
  couple of quotes — not corrected, not invented.
*/
var reviews = [
  {
    name: "Sanne Øst",
    role: "Chief Product Officer",
    quote:
      "Roman is a very creative person. We worked together on the design of a password management application and came up with a great solution that was successfully launched. Roman loves to research the market and is always full of creative ideas. If you need fresh and unique eye on your product - Roman is the right person.",
  },
  {
    name: "Natalia Zaverukha",
    role: "Consultant in process optimization",
    quote:
      'Roman always clarifies business tasks and offers options, often more than one." When working with Roman, I feel that I get even more than I ordered. He listens carefully at the start and is a designer with great style and creativity.',
  },
  {
    name: "Igor Oleksienko",
    role: "Product Owner",
    quote:
      "Roman has a good expertise in user experience for mobile applications, browser and desktop extensions and web sites. Always brings ideas on how to improve the use of the product. Understands the tasks well. Takes an interest in every project and task.",
  },
  {
    name: "Svitlana Leshko",
    role: "Product Owner",
    quote:
      '"We worked together on a password management app and came up with a great solution that was successfully launched." Roman loves to research the market and is always full of creative ideas. If you need a fresh and unique eye on your product – Roman is the right person.',
  },
  {
    name: "Olga Novykova",
    role: "CEO & Founder",
    quote:
      "We worked with Roman on the Alltogether.jobs project, where he led the UI and UX design for our platform. Roman conducted in-depth user research, helped structure complex information, and translated it into a clear product vision. He designed the system architecture and a thoughtful design system, which we are now actively implementing. We highly recommend Roman as a professional who deeply understands business needs and delivers effective solutions.",
  },
  {
    name: "Taras Chudnyi",
    role: "CTO at AllTogether.jobs",
    quote:
      "Thank you so much for the collaboration – this was one of the best experiences I've had. I can say that the result exceeded my expectations )",
  },
];

// Auto-advance interval for the case-study carousels (ms). Was a fixed 7000
// (7s) before, and only on case-yoy / case-ridi.
var REVIEWS_INTERVAL_MS = 8000;

// Reviews that are not tied to one case (shown right after a case's own ones).
var NEUTRAL_REVIEWS = ["Natalia Zaverukha"];

document.addEventListener("DOMContentLoaded", function () {
  var carousel = document.querySelector(".reviews-carousel");
  var slide = document.querySelector(".review-slide");
  var prevBtn = document.querySelector(".reviews-arrow--prev");
  var nextBtn = document.querySelector(".reviews-arrow--next");
  var segments = document.querySelectorAll(".reviews-progress__segment");

  if (!slide || !prevBtn || !nextBtn) {
    return;
  }

  // Opt-in per page via data-auto-scroll on .reviews-carousel (currently
  // case-ridi.html and case-yoy.html only, per Roman — the carousel
  // itself is a shared component reused unchanged on every page, so
  // auto-advance stays off everywhere else unless a page asks for it).
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Case-study pages opt in with data-case-reviews on .reviews-carousel
  // (Home does not, so its behaviour is untouched): the review tied to the
  // case's client (data-default-review on .review-slide, if any) comes first,
  // the rest in random order on every load; the carousel auto-advances every
  // REVIEWS_INTERVAL_MS, pausing on hover, on focus inside it and while the
  // tab is hidden. With prefers-reduced-motion it never auto-advances
  // (arrows and dots still work).
  var caseMode = !!carousel && carousel.hasAttribute("data-case-reviews");

  var autoScrollEnabled =
    !!carousel &&
    (carousel.hasAttribute("data-auto-scroll") || caseMode) &&
    reviews.length > 1 &&
    !(caseMode && reduceMotion.matches);

  var nameEl = slide.querySelector(".review-slide__name");
  var roleEl = slide.querySelector(".review-slide__role");
  var quoteEl = slide.querySelector(".review-slide__quote");

  // Opt-in: a page can open the carousel on a specific review (e.g. the
  // client whose case study it is) via data-default-review="<name>" on
  // .review-slide, matching a `name` in the reviews array above. Order
  // and prev/next behavior are untouched — this only picks the starting
  // slide. No attribute = unchanged default (index 0).
  var defaultName = slide.getAttribute("data-default-review");
  var defaultIndex = defaultName
    ? reviews.findIndex(function (r) { return r.name === defaultName; })
    : -1;
  var current = defaultIndex >= 0 ? defaultIndex : 0;

  if (caseMode) {
    // Order on case pages (Roman, 2026-11-23): the case's own reviews first, in
    // the order given by data-priority-reviews="A|B|C" on .review-slide (most
    // senior first); then the neutral reviews (NEUTRAL_REVIEWS); then everything
    // else in random order. Pages without a priority list (YOY, Ridi) start with
    // the neutral ones.
    var priorityAttr = slide.getAttribute("data-priority-reviews");
    var priorityNames = priorityAttr ? priorityAttr.split("|") : defaultName ? [defaultName] : [];
    var byName = function (n) { return reviews.filter(function (r) { return r.name === n; })[0]; };
    var head = [];
    priorityNames.concat(NEUTRAL_REVIEWS).forEach(function (n) {
      var r = byName(n);
      if (r && head.indexOf(r) < 0) head.push(r);
    });
    var rest = reviews.filter(function (r) { return head.indexOf(r) < 0; });
    for (var i = rest.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = rest[i];
      rest[i] = rest[j];
      rest[j] = tmp;
    }
    reviews = head.concat(rest);
    defaultIndex = 0;
    current = 0;
  }

  function render(index) {
    var review = reviews[index];
    nameEl.textContent = review.name;
    roleEl.textContent = review.role;
    quoteEl.textContent = review.quote;
    segments.forEach(function (segment, i) {
      segment.classList.toggle("is-active", i === index);
    });
    // Text was just swapped in via textContent, which bypasses the
    // one-time pass nbsp-typography.js runs on load — re-apply it here
    // so switching reviews doesn't reintroduce hanging short words.
    if (window.applyNbspTypography) window.applyNbspTypography(slide);
  }

  /*
    Fixed height sized to the tallest review, per Roman: quote length
    varies a lot review to review (Taras's one-liner vs Olga's full
    paragraph), and without this the carousel's height jumped on every
    switch, which also shifted the prev/next arrows (centered against
    the row via .reviews-carousel's align-items:center) up and down.
    Measures each review's natural height in turn, keeps the max, then
    lets CSS (justify-content:center on .review-slide) center the
    actual content inside that fixed box — arrows then stay put too,
    since the row height they're centered against no longer changes.
    Re-measured on resize since text wrapping depends on width.
  */
  function measureMaxHeight() {
    var savedMinHeight = slide.style.minHeight;
    slide.style.minHeight = "0";
    var savedName = nameEl.textContent;
    var savedRole = roleEl.textContent;
    var savedQuote = quoteEl.textContent;
    var max = 0;
    reviews.forEach(function (review) {
      nameEl.textContent = review.name;
      roleEl.textContent = review.role;
      quoteEl.textContent = review.quote;
      max = Math.max(max, slide.scrollHeight);
    });
    nameEl.textContent = savedName;
    roleEl.textContent = savedRole;
    quoteEl.textContent = savedQuote;
    slide.style.minHeight = max + "px";
  }

  var resizeTimer;
  function scheduleRemeasure() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureMaxHeight, 150);
  }

  if (defaultIndex >= 0) {
    render(current);
  }

  measureMaxHeight();
  window.addEventListener("resize", scheduleRemeasure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureMaxHeight);
  }

  // Slide change: the old review leaves one way, the new one arrives from the other.
  // direction 1 = forward (next arrow, autoplay): out to the left, in from the right;
  // -1 = back. Short (about 0.3s), transform and opacity only; instant with reduced motion.
  var OUT_MS = 100;
  var IN_MS = 190;
  var SHIFT = 28; // px
  var slideAnimation = null;

  function goTo(index, direction) {
    current = index; // at once, so quick clicks add up
    if (slideAnimation) slideAnimation.cancel();
    if (reduceMotion.matches || !slide.animate) {
      render(current);
      return;
    }
    slideAnimation = slide.animate(
      [{ opacity: 0, transform: "translateX(" + -direction * SHIFT + "px)" }],
      { duration: OUT_MS, easing: "ease-in", fill: "forwards" }
    );
    slideAnimation.onfinish = function () {
      render(current);
      slideAnimation.cancel();
      slideAnimation = slide.animate(
        [
          { opacity: 0, transform: "translateX(" + direction * SHIFT + "px)" },
          { opacity: 1, transform: "translateX(0)" }
        ],
        { duration: IN_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
    };
  }

  prevBtn.addEventListener("click", function () {
    goTo((current - 1 + reviews.length) % reviews.length, -1);
    resetAutoScroll();
  });

  nextBtn.addEventListener("click", function () {
    goTo((current + 1) % reviews.length, 1);
    resetAutoScroll();
  });

  // Auto-advance every REVIEWS_INTERVAL_MS, only where the page opts in
  // (data-auto-scroll or data-case-reviews, see autoScrollEnabled above).
  // Paused while the pointer is over the carousel, while focus is inside
  // it, and while the tab is hidden.
  var autoScrollTimer = null;
  var hovering = false;
  var focused = false;

  function canRun() {
    return autoScrollEnabled && !hovering && !focused && !document.hidden;
  }
  function startAutoScroll() {
    if (!canRun() || autoScrollTimer) return;
    autoScrollTimer = setInterval(function () {
      goTo((current + 1) % reviews.length, 1);
    }, REVIEWS_INTERVAL_MS);
  }
  function stopAutoScroll() {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
  function resetAutoScroll() {
    if (!autoScrollEnabled) return;
    stopAutoScroll();
    startAutoScroll();
  }

  if (autoScrollEnabled) {
    startAutoScroll();
    carousel.addEventListener("mouseenter", function () {
      hovering = true;
      stopAutoScroll();
    });
    carousel.addEventListener("mouseleave", function () {
      hovering = false;
      startAutoScroll();
    });
    carousel.addEventListener("focusin", function (ev) {
      // pause on focus only for keyboard focus (:focus-visible): after a mouse
      // click the button keeps focus, and that must not freeze the autoplay
      // for good (QA #1, D23). Browsers without :focus-visible count as keyboard.
      var keyboardFocus = true;
      try {
        keyboardFocus = ev.target.matches(":focus-visible");
      } catch (e) {}
      if (!keyboardFocus) return;
      focused = true;
      stopAutoScroll();
    });
    carousel.addEventListener("focusout", function (ev) {
      if (ev.relatedTarget && carousel.contains(ev.relatedTarget)) return;
      focused = false;
      startAutoScroll();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAutoScroll();
      else startAutoScroll();
    });
  }
});
