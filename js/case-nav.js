/*
  Case nav / Sticky behaviour (css/case-nav.css, Figma 987:4210).

  - Show: the bar is hidden while the hero (first <section> of <main>) is
    visible and fades in once the hero has scrolled up out of sight under
    the site header + this bar. Hide again when the hero comes back.
    (IntersectionObserver.)
  - Active item: the mapped section that covers a thin line just below
    the header + bar. (IntersectionObserver on a 1px band.) Sections that
    aren't mapped leave the previous item active.
  - Click: smooth scroll to the section (instant with reduced motion);
    css scroll-margin-top keeps its heading clear of header + bar.
  Without JS the links still work as plain anchors.
*/
(function () {
  var nav = document.querySelector("[data-case-nav]");
  var hero = document.querySelector("main > section");
  if (!nav || !hero || !("IntersectionObserver" in window)) return;

  var header = document.querySelector(".site-nav");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var BAR = 48;
  var LINE_GAP = 96; // the "reading line" sits this far below the bar

  var links = [].slice.call(nav.querySelectorAll("a[data-case-target]"));
  var byId = {};
  links.forEach(function (a) {
    var id = a.getAttribute("data-case-target");
    var el = document.getElementById(id);
    if (!el) {
      a.parentNode.removeChild(a);
      return;
    }
    byId[id] = a;
  });

  function headerHeight() {
    return header ? Math.round(header.getBoundingClientRect().height) : 59;
  }

  function setTop() {
    document.documentElement.style.setProperty("--case-nav-top", headerHeight() + "px");
  }

  function setActive(id) {
    Object.keys(byId).forEach(function (key) {
      if (key === id) byId[key].setAttribute("aria-current", "true");
      else byId[key].removeAttribute("aria-current");
    });
  }

  var heroObserver = null;
  var spyObserver = null;

  function observeHero() {
    if (heroObserver) heroObserver.disconnect();
    // the hero counts as gone once it is entirely under the header + this bar
    var cover = headerHeight() + BAR;
    heroObserver = new IntersectionObserver(
      function (entries) {
        var e = entries[entries.length - 1];
        var gone = !e.isIntersecting && e.boundingClientRect.bottom <= cover + 1;
        nav.classList.toggle("is-visible", gone);
      },
      { rootMargin: "-" + cover + "px 0px 0px 0px", threshold: 0 }
    );
    heroObserver.observe(hero);
  }

  function observeSections() {
    if (spyObserver) spyObserver.disconnect();
    var line = headerHeight() + BAR + LINE_GAP;
    var vh = window.innerHeight;
    spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-" + line + "px 0px -" + Math.max(vh - line - 1, 0) + "px 0px", threshold: 0 }
    );
    Object.keys(byId).forEach(function (id) {
      spyObserver.observe(document.getElementById(id));
    });
  }

  function init() {
    setTop();
    observeHero();
    observeSections();
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("data-case-target");
      var el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      el.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
      setActive(id);
    });
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });

  init();
})();
