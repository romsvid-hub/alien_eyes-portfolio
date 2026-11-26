/*
  Text shimmer for links marked [data-shimmer] (ATJ job-card link, Figma
  982:22842). The glint runs 3 passes (css: .is-shimmering) when the link's
  section comes into view, then stops; it plays again on the next entry.
  Does nothing under prefers-reduced-motion.
*/
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  /*
    The same effect on every text link inside a case study (css/link-shimmer.css).
    Marked here, not in the markup: hero data links, links in running text,
    "Link" items of the UI-kit block, the Ridi wireframe text links. Image links,
    buttons, nav and footer are left alone. The glint colour depends on the
    link's own text colour: a light glint on dark text, a case-coloured glint
    on light text (it would not show on near-white letters otherwise).
  */
  var AUTO = [
    '.case-meta dd a',
    '.atj2-uikit__link a',
    '.ridi-wireframe__cta',
    'a[href="case-uniqkey"]:not([class])'
  ];
  var LIGHT_TEXT_GLINT = {
    atj: '#ffd6c8',
    atj2: '#bcd0ff',
    uniqkey: '#bcd0ff',
    uniqkey2: '#bcd0ff',
    yoy: '#ffb800',
    ridi: '#ff8a1f'
  };
  var caseNav = document.querySelector('[data-case]');
  var caseId = caseNav ? caseNav.getAttribute('data-case') : '';

  function luminance(rgb) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
    if (!m) return 0;
    var c = [m[1], m[2], m[3]].map(function (v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  document.querySelectorAll(AUTO.join(',')).forEach(function (link) {
    if (link.hasAttribute('data-shimmer')) return;
    if (link.querySelector('img, svg')) return; // text links only
    link.setAttribute('data-shimmer-auto', '');
    link.setAttribute('data-text', link.textContent.trim().replace(/\s+/g, ' '));
    var light = luminance(getComputedStyle(link).color) > 0.5;
    link.style.setProperty(
      '--glint',
      light ? LIGHT_TEXT_GLINT[caseId] || '#ffffff' : 'rgba(255, 255, 255, 0.95)'
    );
    link.setAttribute('data-shimmer', '');
  });

  document.querySelectorAll('[data-shimmer]').forEach(function (link) {
    var section = link.closest('section') || link;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          link.classList.toggle('is-shimmering', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-15% 0px -15% 0px' }
    );
    observer.observe(section);
  });
})();
