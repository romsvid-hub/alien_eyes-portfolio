/*
  Case nav / Sticky behaviour (css/case-nav.css, Figma 987:4210).

  - The bar lives in the page flow under the hero (and the Impact block)
    and sticks under the site header via CSS position: sticky.
    Here: .is-stuck is toggled once its top reaches the sticky offset
    (shows "Home" and the role; the unstuck bar shows only the items).
  - Active item: of the mapped sections, the last one whose top has
    passed a reading line just below header + bar. Item order is never
    changed, the highlight just follows the scroll position, whatever the
    order of the sections in the page.
  - Click: smooth scroll to the section (instant with reduced motion);
    css scroll-margin-top keeps its heading clear of header + bar.
  Without JS the links still work as plain anchors.
*/
(function () {
  var nav = document.querySelector("[data-case-nav]");
  if (!nav) return;

  var header = document.querySelector(".site-nav");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var BAR = 48;
  var LINE_GAP = 96; // the "reading line" sits this far below the bar

  var links = [].slice.call(nav.querySelectorAll("a[data-case-target]"));
  var targets = [];
  links.forEach(function (a) {
    var id = a.getAttribute("data-case-target");
    var el = document.getElementById(id);
    if (!el) {
      a.parentNode.removeChild(a);
      return;
    }
    targets.push({ id: id, el: el, link: a });
  });

  function headerHeight() {
    return header ? Math.round(header.getBoundingClientRect().height) : 59;
  }

  var top = 59;

  function setTop() {
    top = headerHeight();
    document.documentElement.style.setProperty("--case-nav-top", top + "px");
  }

  function setActive(id) {
    targets.forEach(function (t) {
      if (t.id === id) t.link.setAttribute("aria-current", "true");
      else t.link.removeAttribute("aria-current");
    });
  }

  function update() {
    // stuck: the bar has reached its sticky offset under the header
    nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= top + 0.5);

    // scroll spy: the last mapped section that has reached the reading line.
    // Before the first one the bar is "unstuck" and nothing is active.
    var line = top + BAR + LINE_GAP;
    var active = null;
    var best = -Infinity;
    targets.forEach(function (t) {
      var y = t.el.getBoundingClientRect().top;
      if (y <= line && y > best) {
        best = y;
        active = t.id;
      }
    });
    setActive(active);
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
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", function () {
    setTop();
    update();
  });

  setTop();
  update();
})();
