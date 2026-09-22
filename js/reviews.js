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
  var autoScrollEnabled =
    !!carousel && carousel.hasAttribute("data-auto-scroll") && reviews.length > 1;

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

  // Transition-aware slide change: on auto-scroll pages this fades/slides
  // the old review out (CSS transition on .review-slide, see home.css),
  // swaps the text once it's invisible, then fades the new one in. Other
  // pages keep the original instant swap — same render(), no animation.
  var TRANSITION_MS = 400;
  var transitioning = false;
  function goTo(index) {
    if (!autoScrollEnabled) {
      current = index;
      render(current);
      return;
    }
    if (transitioning) return;
    transitioning = true;
    slide.classList.add("is-transitioning");
    setTimeout(function () {
      current = index;
      render(current);
      // Force reflow so the browser registers the "hidden" state before
      // removing it, otherwise the fade-in transition wouldn't run.
      void slide.offsetWidth;
      slide.classList.remove("is-transitioning");
      transitioning = false;
    }, TRANSITION_MS);
  }

  prevBtn.addEventListener("click", function () {
    goTo((current - 1 + reviews.length) % reviews.length);
    resetAutoScroll();
  });

  nextBtn.addEventListener("click", function () {
    goTo((current + 1) % reviews.length);
    resetAutoScroll();
  });

  // Auto-scroll every 7s, paused on hover — per Roman, only where the
  // page opts in via data-auto-scroll (see autoScrollEnabled above).
  var autoScrollTimer = null;
  function startAutoScroll() {
    if (!autoScrollEnabled || autoScrollTimer) return;
    autoScrollTimer = setInterval(function () {
      goTo((current + 1) % reviews.length);
    }, 7000);
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
    carousel.addEventListener("mouseenter", stopAutoScroll);
    carousel.addEventListener("mouseleave", startAutoScroll);
  }
});
