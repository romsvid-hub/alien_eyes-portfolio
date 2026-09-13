/*
  Restores Home's scroll position on back/forward navigation, per
  Roman: scroll down Home, click into a case study, view it, hit back
  (browser back or the mobile nav-back chevron — see js/nav.js), land
  exactly where you left off instead of back at the top.

  history.scrollRestoration is set to "manual" in an inline <head>
  script (before this file loads) so the browser's own automatic
  restoration doesn't fire first and fight with this.
*/
(function () {
  var STORAGE_KEY = "home-scroll-y";

  function isBackForwardNavigation() {
    var entries =
      window.performance && performance.getEntriesByType
        ? performance.getEntriesByType("navigation")
        : [];
    if (entries.length && entries[0].type) {
      return entries[0].type === "back_forward";
    }
    // Fallback for older browsers without the Navigation Timing L2 API.
    return !!(
      window.performance &&
      performance.navigation &&
      performance.navigation.type === 2
    );
  }

  function saveScroll() {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    } catch (e) {
      // Storage unavailable (private mode, disabled, etc.) — restoration
      // just won't happen; not worth failing louder than that for this.
    }
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        saveScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  // Covers the position at the moment of navigating away, in case it
  // changed since the last throttled scroll tick above.
  window.addEventListener("pagehide", saveScroll);

  if (isBackForwardNavigation()) {
    var saved;
    try {
      saved = sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      saved = null;
    }
    if (saved !== null) {
      var y = parseInt(saved, 10);
      var restore = function () {
        window.scrollTo(0, y);
      };
      // Applied immediately, again next frame (after layout settles),
      // and once more on full load (images/fonts can still shift
      // height after the first two attempts).
      restore();
      requestAnimationFrame(restore);
      window.addEventListener("load", restore);
    }
  }
})();
