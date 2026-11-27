/*
  Case nav / Sticky behaviour (css/case-nav.css, Figma 987:4210).

  - Stuck state: the bar lives in the page flow under the hero (and the
    Impact block) and sticks under the site header via CSS position: sticky.
    It counts as stuck as soon as its own top (getBoundingClientRect) has reached the
    header height: .is-stuck is set (the bar looks the same either way; the class tells
    when to keep the active item in view on narrow screens). The state is re-read on
    scroll (rAF + a trailing timer), after a click on an item, on hashchange
    and on load, so a jump that skips the whole band can't leave it stale.
  - Scroll spy: the active item is the LAST anchor (in item order) whose top
    is <= header + bar + 1px. Item order is never changed. Anchors must be in
    the page in the same order as the items; checked on load, reported with
    console.error (case name included). Before the first anchor has been
    reached, the first item is active (as in the Figma inline instance).
  - Anchor tops are computed from the layout (offsetTop chain), not from
    getBoundingClientRect, so a pending [data-reveal] transform (translateY)
    doesn't shift them by 28px.
  - Click: scroll so the section's top lands right under the bar (smooth, or
    instant with reduced motion). After the scroll stops, the landing is
    re-checked and corrected if it drifted more than 4px (lazy images
    growing above the target).
  - Stuck + overflowing bar (mobile): the active item is scrolled into view
    inside the bar only (the page does not move).
  Without JS the links still work as plain anchors.
*/
(function () {
  var nav = document.querySelector("[data-case-nav]");
  if (!nav) return;

  var caseName = nav.getAttribute("data-case") || document.title;
  var header = document.querySelector(".site-nav");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var BAR = 48;
  var TOLERANCE = 4; // px of landing drift tolerated after a jump

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

  var top = 59; // header height = the bar's sticky offset

  function setTop() {
    top = header ? Math.round(header.getBoundingClientRect().height) : 59;
    document.documentElement.style.setProperty("--case-nav-top", top + "px");
  }

  // Position of an element in the document from the layout alone (ignores
  // transforms such as the pending [data-reveal] translateY).
  function docTop(el) {
    var y = 0;
    while (el) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  }

  // Optional extra room above an anchor that has no padding of its own
  // (CSS custom property --case-anchor-gap on the anchor element)
  function anchorTop(el) {
    var gap = parseFloat(getComputedStyle(el).getPropertyValue("--case-anchor-gap")) || 0;
    return docTop(el) - gap;
  }

  function landing(el) {
    return Math.max(0, Math.round(anchorTop(el) - (top + BAR)));
  }

  var activeId = null;

  function revealActiveItem(link) {
    // only inside the bar; scrollIntoView() would move the page too
    if (nav.scrollWidth <= nav.clientWidth + 1) return;
    var nr = nav.getBoundingClientRect();
    var lr = link.getBoundingClientRect();
    var pad = 16;
    var d = 0;
    // below 1024 "Home" is pinned on the left (css/mobile.css): items must clear it
    var lead = nav.querySelector(".case-nav__lead");
    var left = nr.left;
    if (lead && getComputedStyle(lead).position === "sticky") left = lead.getBoundingClientRect().right + 8;
    if (lr.left < left + pad) d = lr.left - left - pad;
    else if (lr.right > nr.right - pad) d = lr.right - nr.right + pad;
    if (d) nav.scrollLeft += d; // instant: a short strip, and it must not depend on animation frames
  }

  function setActive(id, justStuck) {
    var changed = id !== activeId;
    activeId = id;
    targets.forEach(function (t) {
      if (t.id === id) {
        t.link.setAttribute("aria-current", "true");
        // keep the active item visible in an overflowing (mobile) bar: when it
        // changes, and when the bar has only just stuck
        if ((changed || justStuck) && nav.classList.contains("is-stuck")) revealActiveItem(t.link);
      } else {
        t.link.removeAttribute("aria-current");
      }
    });
  }

  function update() {
    // stuck: the bar's own top has reached the sticky offset under the header
    var wasStuck = nav.classList.contains("is-stuck");
    var stuck = nav.getBoundingClientRect().top <= top + 0.5;
    nav.classList.toggle("is-stuck", stuck);

    if (!targets.length) return;
    // scroll spy: last anchor at or above the line just under the bar
    var line = window.pageYOffset + top + BAR + 1;
    var active = targets[0].id; // before the first anchor: the first item
    for (var i = 0; i < targets.length; i++) {
      if (anchorTop(targets[i].el) <= line) active = targets[i].id;
    }
    setActive(active, stuck && !wasStuck);
  }

  var raf = 0;
  var timer = 0;

  function schedule() {
    if (!raf) {
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        update();
      });
    }
    // trailing pass: the last scroll position always gets measured
    window.clearTimeout(timer);
    timer = window.setTimeout(update, 120);
  }

  // --- jumping to a section -------------------------------------------------

  var settleToken = 0;

  function goTo(el, smooth) {
    var token = ++settleToken;
    window.scrollTo({
      top: landing(el),
      behavior: smooth && !reduce.matches ? "smooth" : "auto"
    });
    update();

    // wait until the scroll has stopped, then correct a drifted landing
    var tries = 0;
    var lastY = null;
    var still = 0;
    var poll = window.setInterval(function () {
      if (token !== settleToken) {
        window.clearInterval(poll);
        return;
      }
      var y = window.pageYOffset;
      still = y === lastY ? still + 1 : 0;
      lastY = y;
      if (still < 2) return; // still moving
      var want = landing(el);
      if (Math.abs(want - y) > TOLERANCE && tries < 4) {
        tries++;
        still = 0;
        window.scrollTo({ top: want, behavior: "auto" });
      } else {
        window.clearInterval(poll);
        update();
      }
    }, 100);
    window.setTimeout(function () {
      window.clearInterval(poll);
    }, 6000);
  }

  function targetFromHash() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return null;
    for (var i = 0; i < targets.length; i++) if (targets[i].id === id) return targets[i].el;
    return null;
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("data-case-target");
      var el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      goTo(el, true);
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  });

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", function () {
    setTop();
    schedule();
  });
  window.addEventListener("hashchange", function () {
    var el = targetFromHash();
    if (el) goTo(el, false);
    else schedule();
  });
  window.addEventListener("pageshow", schedule);
  window.addEventListener("load", function () {
    // direct link to an anchor: the images above it have loaded now
    var el = targetFromHash();
    if (el) goTo(el, false);
    else schedule();
  });

  setTop();
  update();
})();
