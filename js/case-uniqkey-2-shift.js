/*
  "The Shift" before/after comparison slider — per Roman: dragging was
  unreliable (grabbing the handle often just dragged the image instead
  of moving the divider), so on desktop this now just follows the
  mouse on hover — move the cursor across the block and the divider
  tracks it, no click/drag needed. Only engages 1s after the block
  first becomes visible (IntersectionObserver), so it doesn't jump to
  wherever the cursor already happened to be the instant it scrolls
  into view. Touch has no hover equivalent, so touch keeps the
  original drag behavior.
*/
(function () {
  var shift = document.querySelector('[data-before-after]');
  if (!shift) return;

  var hoverEnabled = false;

  function setPos(percent) {
    percent = Math.max(0, Math.min(100, percent));
    shift.style.setProperty('--shift-pos', percent + '%');
  }

  function moveFromClientX(clientX) {
    var rect = shift.getBoundingClientRect();
    var percent = ((clientX - rect.left) / rect.width) * 100;
    setPos(percent);
  }

  function onMouseMove(e) {
    if (!hoverEnabled) return;
    moveFromClientX(e.clientX);
  }

  var touching = false;
  function onTouchStart(e) {
    touching = true;
    moveFromClientX(e.touches[0].clientX);
  }
  function onTouchMove(e) {
    if (!touching) return;
    moveFromClientX(e.touches[0].clientX);
  }
  function onTouchEnd() {
    touching = false;
  }

  shift.addEventListener('mousemove', onMouseMove);
  shift.addEventListener('touchstart', onTouchStart, { passive: true });
  shift.addEventListener('touchmove', onTouchMove, { passive: true });
  shift.addEventListener('touchend', onTouchEnd);

  setPos(50);

  if ('IntersectionObserver' in window) {
    var timer = null;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!timer) {
              timer = setTimeout(function () {
                hoverEnabled = true;
              }, 1000);
            }
          } else if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(shift);
  } else {
    hoverEnabled = true;
  }
})();
