/*
  Home headings and rows: the section title slides in from the left; then, under
  "I worked with" and "Expertise", the logos / blocks pop up from below one after another,
  left to right. Short, opacity and translate only. "Reviews" is left as it is.

  Works on desktop and phones, never with prefers-reduced-motion (and without JavaScript
  nothing is ever hidden). Plays again when the section is entered again. Runs before
  js/reveal.js and takes these elements over from it.
*/
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;

  var TITLE_MS = 380;
  var ITEM_MS = 380;
  var ITEMS_AFTER = 170; // ms after the title starts
  var STEP = 70; // ms between neighbours

  var GROUPS = [
    { title: ".logos-section .logos-heading", items: ".logos-grid > *" },
    { title: "#expertise .expertise-heading", items: "#expertise .expertise-item" },
    { title: "#case-studies .case-studies-heading" },
    { title: "#experience .experience-heading" }
  ];

  GROUPS.forEach(function (group) {
    var title = document.querySelector(group.title);
    if (!title) return;
    var items = group.items ? [].slice.call(document.querySelectorAll(group.items)) : [];
    var parts = [title].concat(items);
    var waiting = false;

    title.removeAttribute("data-reveal");
    if (items.length) items[0].parentNode.removeAttribute("data-reveal-group");

    function wait() {
      waiting = true;
      parts.forEach(function (part) {
        part.classList.add("he-wait");
      });
    }

    function play() {
      if (!waiting) return;
      waiting = false;
      parts.forEach(function (part) {
        // he-enter: no CSS transition meanwhile (a transition would override the animation)
        part.classList.add("he-enter");
        part.classList.remove("he-wait");
      });
      window.setTimeout(function () {
        parts.forEach(function (part) {
          part.classList.remove("he-enter");
        });
      }, ITEMS_AFTER + items.length * STEP + ITEM_MS + 60);
      // one keyframe at offset 0 = where it starts; it ends wherever the styles put it
      // (without the offset a lone keyframe means where it ends)
      title.animate([{ opacity: 0, translate: "-72px 0", offset: 0 }], {
        duration: TITLE_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards"
      });
      items.forEach(function (item, i) {
        item.animate([{ opacity: 0, translate: "0 44px", offset: 0 }], {
          duration: ITEM_MS,
          delay: ITEMS_AFTER + i * STEP,
          easing: "cubic-bezier(0.34, 1.45, 0.64, 1)", // a small hop past the place and back
          fill: "backwards"
        });
      });
    }

    wait();
    new IntersectionObserver(
      function (entries) {
        var entry = entries[entries.length - 1];
        if (!entry.isIntersecting) wait();
        else if (entry.intersectionRatio >= 0.9) play();
      },
      { threshold: [0, 0.9] }
    ).observe(title);

    // keyboard focus must never land on something still hidden
    parts.forEach(function (part) {
      part.addEventListener("focusin", play);
    });
  });
})();
