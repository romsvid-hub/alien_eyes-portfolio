document.addEventListener("DOMContentLoaded", function () {
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");

  if (!nav || !toggle) {
    return;
  }

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  initNavPopups();
});

/*
  Nav popups (Case Studies / Feedbacks) — added 2026-09-12, per Roman:
  clicking either link in the header, on ANY page, opens a popup on top
  of the current page instead of navigating/scrolling away.

  - Case Studies: reads the 5 real case cards from index.html (fetched
    if we're not already on it) so this never drifts out of sync with
    Home's actual content — no separate hardcoded list to maintain.
  - Feedbacks: relocates the page's own .reviews-heading/.reviews-carousel
    into the popup (and back on close) so it's the exact same instance
    reviews.js already drives — same dots, same arrows, same reviews —
    then auto-advances it every 7s via the existing "next" button.
*/
function initNavPopups() {
  var FEEDBACK_INTERVAL_MS = 7000;
  var overlay = null;
  var feedbackTimer = null;
  var relocated = null; // { el, parent, next }[]

  function isHomePage() {
    var path = window.location.pathname;
    return path === "/" || /(^|\/)index\.html$/.test(path);
  }

  function closePopup() {
    if (feedbackTimer) {
      clearInterval(feedbackTimer);
      feedbackTimer = null;
    }
    if (relocated) {
      relocated.forEach(function (item) {
        item.parent.insertBefore(item.el, item.next);
      });
      relocated = null;
    }
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    document.documentElement.classList.remove("nav-popup-open");
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (e.key === "Escape") closePopup();
  }

  function buildShell() {
    overlay = document.createElement("div");
    overlay.className = "nav-popup-overlay";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closePopup();
    });

    var panel = document.createElement("div");
    panel.className = "nav-popup";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "nav-popup__close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2L14 14M14 2L2 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    closeBtn.addEventListener("click", closePopup);
    panel.appendChild(closeBtn);

    var content = document.createElement("div");
    content.className = "nav-popup__body";
    panel.appendChild(content);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    document.documentElement.classList.add("nav-popup-open");
    document.addEventListener("keydown", onKeydown);
    return content;
  }

  function renderCaseCard(card) {
    var title = card.querySelector(".case-card__title");
    var link = card.querySelector(".case-card__cta");
    if (!title || !link) return null;

    var desc = card.querySelector(".case-card__description");
    var media = card.querySelector(".case-card__media");
    var img = media
      ? media.querySelector("img:not(.case-card__glow)")
      : null;

    var a = document.createElement("a");
    a.className = "nav-popup-case";
    a.href = link.getAttribute("href");

    if (img) {
      var mediaWrap = document.createElement("div");
      mediaWrap.className = "nav-popup-case__media";
      var imgEl = document.createElement("img");
      imgEl.loading = "lazy";
      imgEl.alt = "";
      imgEl.src = img.getAttribute("src");
      mediaWrap.appendChild(imgEl);
      a.appendChild(mediaWrap);
    }

    var titleEl = document.createElement("p");
    titleEl.className = "nav-popup-case__title";
    titleEl.textContent = title.textContent.trim();
    a.appendChild(titleEl);

    if (desc) {
      var descEl = document.createElement("p");
      descEl.className = "nav-popup-case__desc";
      descEl.textContent = desc.textContent.trim();
      a.appendChild(descEl);
    }

    return a;
  }

  function openCasesPopup() {
    var content = buildShell();
    var heading = document.createElement("h2");
    heading.className = "h2-section nav-popup__heading";
    heading.textContent = "Case Studies:";
    content.appendChild(heading);

    var grid = document.createElement("div");
    grid.className = "nav-popup__cases-grid";
    content.appendChild(grid);

    function populate(doc) {
      var cards = doc.querySelectorAll(".case-card");
      cards.forEach(function (card) {
        var el = renderCaseCard(card);
        if (el) grid.appendChild(el);
      });
    }

    if (isHomePage()) {
      populate(document);
    } else {
      fetch("index.html")
        .then(function (res) {
          return res.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          populate(doc);
        })
        .catch(function () {
          grid.textContent = "Couldn't load case studies right now.";
        });
    }
  }

  function openFeedbacksPopup() {
    var heading = document.querySelector(".reviews-heading");
    var carousel = document.querySelector(".reviews-carousel");
    var progress = document.querySelector(".reviews-progress");
    if (!heading || !carousel) return;

    var content = buildShell();
    content.className += " nav-popup__feedback";

    relocated = [
      { el: heading, parent: heading.parentNode, next: heading.nextSibling },
      { el: carousel, parent: carousel.parentNode, next: carousel.nextSibling },
    ];
    content.appendChild(heading);
    content.appendChild(carousel);
    // .reviews-progress (the dot segments) is a sibling of .reviews-carousel
    // in the markup, not nested inside it — move it too.
    if (progress) {
      relocated.push({
        el: progress,
        parent: progress.parentNode,
        next: progress.nextSibling,
      });
      content.appendChild(progress);
    }

    var nextBtn = carousel.querySelector(".reviews-arrow--next");
    if (nextBtn) {
      feedbackTimer = setInterval(function () {
        nextBtn.click();
      }, FEEDBACK_INTERVAL_MS);
    }
  }

  function closeMobileMenu() {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  }

  document.querySelectorAll(".nav-links__link").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (/#case-studies$/.test(href)) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        closeMobileMenu();
        openCasesPopup();
      });
    } else if (/#feedbacks$/.test(href)) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        closeMobileMenu();
        openFeedbacksPopup();
      });
    }
  });
}
