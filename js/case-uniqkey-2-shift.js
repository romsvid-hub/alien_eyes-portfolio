/*
  "The Shift" before/after comparison slider — drag (or tap/click) the
  handle to reveal how much of the "after" screen shows through, per
  Roman's node 916:34103 reference. Pure CSS clip-path driven by one
  custom property (--shift-pos) that this script updates on
  pointer/touch drag; starts at 50% so both states are visible before
  any interaction.
*/
(function () {
  var shift = document.querySelector('[data-before-after]');
  if (!shift) return;

  var dragging = false;

  function setPos(percent) {
    percent = Math.max(0, Math.min(100, percent));
    shift.style.setProperty('--shift-pos', percent + '%');
  }

  function moveFromClientX(clientX) {
    var rect = shift.getBoundingClientRect();
    var percent = ((clientX - rect.left) / rect.width) * 100;
    setPos(percent);
  }

  function clientXFrom(e) {
    return e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
  }

  function onDown(e) {
    dragging = true;
    shift.classList.add('is-dragging');
    moveFromClientX(clientXFrom(e));
  }

  function onMove(e) {
    if (!dragging) return;
    moveFromClientX(clientXFrom(e));
  }

  function onUp() {
    dragging = false;
    shift.classList.remove('is-dragging');
  }

  shift.addEventListener('mousedown', onDown);
  shift.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  setPos(50);
})();
