/*
  The left column in the feedback section (.case-feedback__left) is a
  plain CSS position:sticky at desktop — it needs no scroll-linked JS at
  all, since a sticky element naturally holds in place for exactly as
  long as its row sibling (the taller card stack) keeps scrolling past,
  then releases on its own. The only thing JS still has to do is tell it
  how far from the top to stick, since .site-nav is itself
  position:sticky and would otherwise cover it.
*/
(function () {
  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  function setPinTop() {
    document.documentElement.style.setProperty('--feedback-pin-top', nav.getBoundingClientRect().height + 'px');
  }

  setPinTop();
  window.addEventListener('resize', setPinTop);
  window.addEventListener('load', setPinTop);
})();
