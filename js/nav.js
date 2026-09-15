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
  Mobile "back to home" chevron (.nav-back, case-study pages only) —
  per Roman: hitting back from a case study should return Home to the
  exact scroll position it was at before, not the top. A plain
  href="index.html" is a fresh forward navigation (browser reports its
  performance-entry type as "navigate"), which js/home-scroll-restore.js
  can't tell apart from a first-time visit — so prefer a genuine
  history.back() when it's safe to assume that goes to Home (same-origin
  referrer, real history to go back to), which the browser reports as
  "back_forward" and lets that script restore correctly. Falls back to
  the plain href for direct/bookmarked visits with no useful history.
*/
document.addEventListener("DOMContentLoaded", function () {
  var navBack = document.querySelector(".nav-back");
  if (!navBack) return;

  navBack.addEventListener("click", function (e) {
    var cameFromSameOrigin =
      document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (cameFromSameOrigin && window.history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
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
  var activeLink = null;

  function setActiveLink(link) {
    if (activeLink) activeLink.classList.remove("is-active");
    activeLink = link;
    if (activeLink) activeLink.classList.add("is-active");
  }

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
    setActiveLink(null);
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

    var a = document.createElement("a");
    a.className = "nav-popup-case";
    a.href = link.getAttribute("href");

    if (media) {
      // Some cards (Uniqkey) compose their thumbnail from more than one
      // absolutely-positioned/percentage-sized layer (glow + dashboard
      // screenshot + laptop frame) rather than a single flattened
      // image — cloning the whole .case-card__media node reuses that
      // exact composite via the same CSS classes (already loaded via
      // home.css on every page) instead of grabbing just one layer and
      // showing an incomplete/wrong picture.
      var mediaWrap = document.createElement("div");
      mediaWrap.className = "nav-popup-case__media";
      mediaWrap.appendChild(media.cloneNode(true));
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

  /*
    Contact popup — added 2026-09-15, per Roman: "Contact Me" should
    offer a real choice of channel instead of silently just being a
    LinkedIn link, so the label matches what actually happens on
    click. Triggered from every [data-popup="contact"] element on the
    page (Hero, the bottom CTA section — replacing the old dead-ish
    "Book a Call" — and the mobile menu's own Contact Me button), not
    just one fixed header link, so this builds its own shell each time
    rather than relocating existing DOM like openFeedbacksPopup does.
  */
  function openContactPopup() {
    var content = buildShell();
    content.className += " nav-popup__contact-wrap";

    var heading = document.createElement("h2");
    heading.className = "h2-section nav-popup__heading";
    heading.textContent = "Contact Me:";
    content.appendChild(heading);

    var list = document.createElement("div");
    list.className = "nav-popup__contact";
    content.appendChild(list);

    var channels = [
      {
        href: "https://www.linkedin.com/in/romsvid/",
        icon: "assets/icons/social-linkedin.svg",
        title: "LinkedIn",
        desc: "My full experience, projects and recommendations.",
        external: true,
        primary: true,
      },
      {
        href: "https://t.me/Rmsddddd",
        icon: "assets/icons/social-telegram.svg",
        title: "Telegram",
        desc: "Fastest way to reach me directly.",
        external: true,
      },
      {
        href: "mailto:svidddrommm25@gmail.com",
        icon: "assets/icons/social-email.svg",
        title: "Email",
        desc: "svidddrommm25@gmail.com",
        external: false,
      },
    ];

    channels.forEach(function (channel) {
      var a = document.createElement("a");
      a.className =
        "nav-popup-contact-link" +
        (channel.primary ? " nav-popup-contact-link--primary" : "");
      a.href = channel.href;
      if (channel.external) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      // Closes the popup on click too — the destination opens in its
      // own tab (LinkedIn/Telegram) or hands off to the OS mail client
      // (Email), so there's nothing left for the popup to do here.
      a.addEventListener("click", closePopup);

      var iconWrap = document.createElement("div");
      iconWrap.className = "nav-popup-contact-link__icon";
      var img = document.createElement("img");
      img.loading = "lazy";
      img.src = channel.icon;
      img.alt = "";
      iconWrap.appendChild(img);
      a.appendChild(iconWrap);

      var body = document.createElement("div");
      body.className = "nav-popup-contact-link__body";
      var title = document.createElement("p");
      title.className = "nav-popup-contact-link__title";
      title.textContent = channel.title;
      var desc = document.createElement("p");
      desc.className = "nav-popup-contact-link__desc";
      desc.textContent = channel.desc;
      body.appendChild(title);
      body.appendChild(desc);
      a.appendChild(body);

      list.appendChild(a);
    });
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
        // Already open via this same button: no-op, per Roman — the
        // button's active state is the only feedback needed.
        if (link === activeLink) return;
        closeMobileMenu();
        // Defensive: switching straight from one popup to another
        // (e.g. Cases open, then Feedbacks clicked) previously left
        // the first overlay's DOM behind since buildShell() always
        // appends a fresh one — close whatever's open first.
        closePopup();
        openCasesPopup();
        setActiveLink(link);
      });
    } else if (/#feedbacks$/.test(href)) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (link === activeLink) return;
        closeMobileMenu();
        closePopup();
        openFeedbacksPopup();
        setActiveLink(link);
      });
    }
  });

  // Contact popup — every [data-popup="contact"] trigger site-wide
  // (Hero, the bottom CTA section, the mobile menu's own button), not
  // just one header link, so it isn't part of the .nav-links__link
  // active-state loop above.
  document.querySelectorAll('[data-popup="contact"]').forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      closeMobileMenu();
      closePopup();
      openContactPopup();
    });
  });
}
