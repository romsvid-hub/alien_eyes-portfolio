/*
  One entrance for Home and the case studies: the block's title slides in from the left;
  then its logos, number blocks or people pop up from below one after another, left to
  right. Short, opacity and translate only.
    Home    "I worked with" (logos), Expertise (blocks), Case Studies and Experience
            (title only). "Reviews" is left as it is.
    Cases   the Impact numbers on every case that has them (YOY: "Three facts"), and the
            rider types on Ridi ("Audience segmentation").

  Works on desktop and phones, never with prefers-reduced-motion (and without JavaScript
  nothing is ever hidden). From 1024px it plays again when the block is entered again;
  below that it plays once and the content stays. Runs before
  js/reveal.js and the case scripts, and takes these elements over from them.
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
    { title: "#experience .experience-heading" },
    // case studies
    { title: ".atj-impact .atj-eyebrow", items: ".atj-impact__item" },
    { title: ".atj2-impact .atj2-eyebrow", items: ".atj2-facts__item" },
    { title: ".uq2-impact-heading", items: ".uq2-impact__item" },
    { title: ".case-impact .case-eyebrow", items: ".case-impact__item" },
    { title: "section:has(> .yoy-facts) > .yoy-heading", items: ".yoy-facts__card" },
    { title: ".ridi-block--audience .ridi-subheading", items: ".ridi-audience__item", block: ".ridi-block--audience" }
  ];

  GROUPS.forEach(function (group) {
    var title;
    try {
      title = document.querySelector(group.title);
    } catch (error) {
      title = null; // a browser without :has()
    }
    if (!title) return;
    var items = group.items ? [].slice.call(document.querySelectorAll(group.items)) : [];
    var parts = [title].concat(items);
    var waiting = false;

    title.removeAttribute("data-reveal");
    if (items.length) {
      items[0].parentNode.removeAttribute("data-reveal-group");
      items[0].parentNode.removeAttribute("data-bounce-group"); // Ridi's older entrance
    }
    var block = group.block && document.querySelector(group.block);
    if (block) {
      // the block itself stays still: no second reveal, no shooting in (js/case-slides.js)
      block.removeAttribute("data-reveal");
      block.setAttribute("data-enter", "");
    }

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
    // hidden again only once the title has left the screen (desktop only: on phones and
    // tablets the block is taller than the title, and hiding it left an empty screen)
    if (!window.matchMedia("(max-width: 1023px)").matches) {
      new IntersectionObserver(function (entries) {
        if (!entries[entries.length - 1].isIntersecting) wait();
      }).observe(title);
    } else {
      // a jump past the title must not leave the block blank
      new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) play();
      }).observe(title);
    }
    // ...and played when it is well inside it, so a block still fading in is not missed
    new IntersectionObserver(
      function (entries) {
        if (entries[entries.length - 1].intersectionRatio >= 0.9) play();
      },
      { threshold: 0.9, rootMargin: "0px 0px -18% 0px" }
    ).observe(title);

    // at the very end of a page the title may never get that far up: show it then
    window.addEventListener(
      "scroll",
      function () {
        if (!waiting) return;
        var box = title.getBoundingClientRect();
        var atEnd = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
        if (atEnd && box.top < window.innerHeight && box.bottom > 0) play();
      },
      { passive: true }
    );

    // keyboard focus must never land on something still hidden
    parts.forEach(function (part) {
      part.addEventListener("focusin", play);
    });
  });
})();
