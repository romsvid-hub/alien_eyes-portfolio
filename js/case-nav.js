/*
  Case nav / Sticky behaviour (css/case-nav.css, Figma 987:4210).

  - Stuck state: the bar lives in the page flow under the hero (and the
    Impact block) and sticks under the site header via CSS position: sticky.
    A 1px sentinel sits right above it; an IntersectionObserver watches that
    sentinel against the line under the header. When the sentinel has gone
    above that line the bar has stuck: .is-stuck is set (Home + role, dark
    bar). Before that the bar is inline ("Agenda:", the case's own colours).
    Both states are 48px tall, so nothing jumps.
  - Scroll spy: the active item is the LAST anchor (in item order) whose top
    is <= header + bar + 1px, read with getBoundingClientRect. The anchors
    must be in the page in the same order as the items; that is checked on
    load and reported with console.error (case name included). Before the
    first anchor has been reached, the first item is active (as in the Figma
    inline instance).
  - Click: smooth scroll to the section (instant with reduced motion); the
    css scroll-margin-top lands its top right under the bar.
  Without JS the links still work as plain anchors.
*/
(function () {
  var nav = document.querySelector("[data-case-nav]");
  if (!nav) return;

  var caseName = nav.getAttribute("data-case") || document.title;
  var header = document.querySelector(".site-nav");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var BAR = 48;

  var links = [].slice.call(nav.querySelectorAll("a[data-case-target]"));
  var targets = [];
  links.forEach(function (a) {
    var id = a.getAttribute("data-case-target");
    var el = document.getElementById(id);
    if (!el) {
      console.error("[case-nav] " + caseName + ": no section with id #" + id + " for the item \"" + a.textContent.trim() + "\"");
      a.parentNode.removeChild(a);
      return;
    }
    targets.push({ id: id, el: el, link: a });
  });

  // Dev check: anchors in the DOM must follow the order of the items, and
  // none of them may live in the Reviews block.
  (function checkOrder() {
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (t.el.closest("#feedbacks, .case-reviews-cta")) {
        console.error("[case-nav] " + caseName + ": the anchor #" + t.id + " is inside the Reviews block");
      }
      if (i === 0) continue;
      var prev = targets[i - 1];
      if (!(prev.el.compareDocumentPosition(t.el) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        console.error(
          "[case-nav] " + caseName + ": anchor order in the page does not match the item order: \"" +
            t.link.textContent.trim() + "\" (#" + t.id + ") comes before \"" +
            prev.link.textContent.trim() + "\" (#" + prev.id + ")"
        );
      }
    }
  })();

  var top = 59;

  function setTop() {
    top = header ? Math.round(header.getBoundingClientRect().height) : 59;
    document.documentElement.style.setProperty("--case-nav-top", top + "px");
  }

  function setActive(id) {
    targets.forEach(function (t) {
      if (t.id === id) t.link.setAttribute("aria-current", "true");
      else t.link.removeAttribute("aria-current");
    });
  }

  // scroll spy: last anchor whose top is at or above the line just under the bar
  function updateActive() {
    if (!targets.length) return;
    var line = top + BAR + 1;
    var active = targets[0].id; // before the first anchor: the first item
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.getBoundingClientRect().top <= line) active = targets[i].id;
    }
    setActive(active);
  }

  // stuck state: sentinel above the bar + IntersectionObserver
  var sentinel = document.createElement("div");
  sentinel.className = "case-nav__sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  nav.parentNode.insertBefore(sentinel, nav);

  var io = null;

  function observe() {
    if (io) io.disconnect();
    if (!("IntersectionObserver" in window)) {
      // very old browsers: fall back to measuring
      nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= top + 0.5);
      return;
    }
    io = new IntersectionObserver(
      function (entries) {
        var e = entries[entries.length - 1];
        // sentinel gone above the line under the header => the bar has stuck
        nav.classList.toggle("is-stuck", !e.isIntersecting && e.boundingClientRect.top < top);
      },
      { rootMargin: "-" + top + "px 0px 0px 0px", threshold: [0, 1] }
    );
    io.observe(sentinel);
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("data-case-target");
      var el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      el.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });

  // a handful of getBoundingClientRect calls per scroll event: cheap enough to run directly
  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", function () {
    setTop();
    observe();
    updateActive();
  });

  setTop();
  observe();
  updateActive();
})();
