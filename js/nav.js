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
});
