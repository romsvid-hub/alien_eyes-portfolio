/*
  Ridi-specific entrance animations, per Roman (2026-09-12):
  - [data-bounce] / [data-bounce-group]: elements "jump up" from below,
    slightly overshoot, then settle — 0.7s base delay, random order per
    load (re-shuffled every time, not scroll-triggered for the Hero
    group since it's above the fold; scroll-triggered via
    IntersectionObserver for groups below the fold, e.g. Audience).
  - [data-fog] / [data-fog-group]: elements fade in through a blur
    ("as if out of fog"), scroll-triggered, no random order (single
    smooth reveal, not a staggered effect).
  Respects prefers-reduced-motion: reduce by doing nothing (CSS already
  shows the final state via the @media guard in case-ridi.css).
*/
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var BASE_DELAY_MS = 700;
  var STAGGER_MS = 150;

  function shuffledIndices(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function armBounceGroup(group) {
    var items = Array.prototype.slice.call(group.children);
    items.forEach(function (el) {
      el.classList.add('bounce-init');
    });
    var order = shuffledIndices(items.length);
    items.forEach(function (el, i) {
      var rank = order.indexOf(i);
      el.style.setProperty('--bounce-delay', (BASE_DELAY_MS + rank * STAGGER_MS) + 'ms');
    });
    return items;
  }

  // Hero bounce group: plays once on page load (above the fold, always
  // visible immediately — no scroll trigger needed).
  document.querySelectorAll('[data-bounce-group="load"]').forEach(function (group) {
    var items = armBounceGroup(group);
    // Force a reflow so the .bounce-init starting state is painted
    // before .is-bounced-in is added, otherwise the animation can be
    // skipped by the browser.
    void group.offsetWidth;
    items.forEach(function (el) {
      el.classList.add('is-bounced-in');
    });
  });

  // Scroll-triggered bounce groups (e.g. Audience segmentation): armed
  // once, then played the first time the group enters the viewport.
  var bounceScrollGroups = document.querySelectorAll('[data-bounce-group="scroll"]');
  if (bounceScrollGroups.length && 'IntersectionObserver' in window) {
    var bounceObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          armBounceGroup(entry.target).forEach(function (el) {
            el.classList.add('is-bounced-in');
          });
          bounceObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    bounceScrollGroups.forEach(function (group) {
      bounceObserver.observe(group);
    });
  }

  // Fog-in (blur reveal): single element or a group of independent
  // elements, each fades in on its own the first time it's in view.
  var fogTargets = [];
  document.querySelectorAll('[data-fog]').forEach(function (el) {
    fogTargets.push(el);
  });
  document.querySelectorAll('[data-fog-group]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el) {
      fogTargets.push(el);
    });
  });

  if (fogTargets.length && 'IntersectionObserver' in window) {
    fogTargets.forEach(function (el) {
      el.classList.add('fog-init');
    });
    var fogObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-fogged-in');
          fogObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    fogTargets.forEach(function (el) {
      fogObserver.observe(el);
    });
  } else if (fogTargets.length) {
    fogTargets.forEach(function (el) {
      el.classList.add('is-fogged-in');
    });
  }
})();
