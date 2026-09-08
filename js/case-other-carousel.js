/*
  Other Screens carousel (Uniqkey case). Content transcribed from Figma
  "Copy portfolio" (fileKey DU3fuTo8QXIJ0uMcI3jh91), Page 1 canvas,
  frames "MacBook Air - 1".."MacBook Air - 6" (612:4369-612:4633) — v2,
  replacing the earlier Screen_1..6 source (2:16823-2:17136, since
  deleted from the file). Images are each frame's own "Picture N"
  sub-node, exported without the heading/description baked in.

  Single image element, swapped mid-transition rather than a real
  multi-slide track: on next/prev, the current image fades+slides out in
  the direction of travel, the src/heading/description swap while it's
  invisible, then it fades+slides in from the opposite side. Simpler than
  a two-image crossfade and looks the same. Respects
  prefers-reduced-motion by skipping the animation and swapping instantly.
*/
(function () {
  var slides = [
    {
      title: "Admin Portal – Groups",
      desc:
        "A unified table view for monitoring security scores and activity across all groups. The toolbar enables quick management actions, and clicking any row opens a detailed view of that group.",
      src: "assets/case-uniqkey/otherscreens-v2-1-groups.png",
      alt: "Admin Portal group table view",
    },
    {
      title: "Admin Portal – Group details",
      desc:
        "A detailed group view with key metrics, member count, login usage, and security score, organized across tabs for easy navigation. The same consistent layout is applied across both groups and employees.",
      src: "assets/case-uniqkey/otherscreens-v2-2-groupdetails.png",
      alt: "Admin Portal group detail view",
    },
    {
      title: "Admin Portal – Data sorting",
      desc:
        "A centralized view of shared company logins, organized into groups and folders for easier access management. Structured permissions allow admins to control visibility by department or role, so employees only see credentials relevant to their work.",
      src: "assets/case-uniqkey/otherscreens-v2-3-datasorting.png",
      alt: "Shared company logins, grouped by folder",
    },
    {
      title: "Mobile app",
      desc:
        "A mobile home screen with saved logins organized into tabs and department folders for faster navigation. Selecting a login opens full credentials, 2FA, sharing details, and quick actions — giving users everything they need in one place.",
      src: "assets/case-uniqkey/otherscreens-v2-4-mobileapp.png",
      alt: "Mobile app home screen with saved logins",
    },
    {
      title: "Browser extension",
      desc:
        "For secure access to company credentials, payments, and notes, synchronized with the mobile app for seamless authentication. The interface enables quick login actions, secure password management, advanced filtering, and real-time security monitoring in a compact, accessible workflow.",
      src: "assets/case-uniqkey/otherscreens-v2-5-browserext.png",
      alt: "Browser extension credential list",
    },
    {
      title: "Partner Portal",
      desc:
        "A centralized dashboard for managing partners, organizations, and license distribution across the ecosystem. The interface provides quick access to key metrics, detailed partner views, and organization management — streamlining product distribution and access control in one place.",
      src: "assets/case-uniqkey/otherscreens-v2-6-partnerportal.png",
      alt: "Partner portal dashboard",
    },
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector("[data-other-carousel]");
    if (!root) return;

    var titleEl = root.querySelector("[data-other-carousel-title]");
    var descEl = root.querySelector("[data-other-carousel-desc]");
    var imgEl = root.querySelector("[data-other-carousel-img]");
    var prevBtn = root.querySelector("[data-other-carousel-prev]");
    var nextBtn = root.querySelector("[data-other-carousel-next]");
    var dots = root.querySelectorAll("[data-other-carousel-dots] .case-other-carousel__dot");

    if (!titleEl || !descEl || !imgEl || !prevBtn || !nextBtn) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;
    var animating = false;
    var OUT_MS = 280;

    function apply(index) {
      var slide = slides[index];
      titleEl.textContent = slide.title;
      descEl.textContent = slide.desc;
      imgEl.src = slide.src;
      imgEl.alt = slide.alt;
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function goTo(index, direction) {
      if (animating) return;
      current = (index + slides.length) % slides.length;

      if (reduceMotion) {
        apply(current);
        return;
      }

      animating = true;
      var outClass = direction === "next" ? "is-out-next" : "is-out-prev";
      var inClass = direction === "next" ? "is-in-next" : "is-in-prev";

      imgEl.classList.add(outClass);

      window.setTimeout(function () {
        apply(current);
        imgEl.classList.remove(outClass);
        imgEl.classList.add(inClass);
        // Force layout so the browser registers the "in" starting state
        // before transitioning it away — otherwise it just snaps in.
        void imgEl.offsetWidth;
        imgEl.classList.remove(inClass);

        window.setTimeout(function () {
          animating = false;
        }, OUT_MS);
      }, OUT_MS);
    }

    prevBtn.addEventListener("click", function () {
      goTo(current - 1, "prev");
    });

    nextBtn.addEventListener("click", function () {
      goTo(current + 1, "next");
    });
  });
})();
