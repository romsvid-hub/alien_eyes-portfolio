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
  var slide = document.querySelector(".review-slide");
  var prevBtn = document.querySelector(".reviews-arrow--prev");
  var nextBtn = document.querySelector(".reviews-arrow--next");
  var segments = document.querySelectorAll(".reviews-progress__segment");

  if (!slide || !prevBtn || !nextBtn) {
    return;
  }

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
  }

  if (defaultIndex >= 0) {
    render(current);
  }

  prevBtn.addEventListener("click", function () {
    current = (current - 1 + reviews.length) % reviews.length;
    render(current);
  });

  nextBtn.addEventListener("click", function () {
    current = (current + 1) % reviews.length;
    render(current);
  });
});
