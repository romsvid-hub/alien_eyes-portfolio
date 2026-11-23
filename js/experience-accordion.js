/*
  Experience accordion (css/experience.css). Rows are open/closed
  independently (several can be open at once). Markup is complete without JS
  (all panels visible); this script only turns on the accordion look:
  .is-enhanced on the list, aria-expanded on the buttons. Rows that carry
  .is-open in the markup (Uniqkey) start open, the rest start closed.
  The height animation is pure CSS (grid-template-rows 0fr -> 1fr); with
  prefers-reduced-motion the CSS removes the transitions.
*/
(function () {
  var lists = document.querySelectorAll("[data-exp-list]");
  Array.prototype.forEach.call(lists, function (list) {
    list.classList.add("is-enhanced");
    var rows = list.querySelectorAll("[data-exp]");
    Array.prototype.forEach.call(rows, function (row) {
      var btn = row.querySelector(".exp__toggle");
      if (!btn) return;
      function set(open) {
        row.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      }
      set(row.classList.contains("is-open"));
      btn.addEventListener("click", function () {
        set(!row.classList.contains("is-open"));
      });
    });
  });
})();
