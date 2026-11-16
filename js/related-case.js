/*
  Related-case block at the bottom of every case page (between Reviews and
  the CTA). Each case shows its pair; change the pairs / headings HERE.

  The card itself is not duplicated: it is cloned from the matching card on
  Home (index.html) — same markup and styles, so image, title, description
  and tags always match Home, and the card is one link with the same hover /
  focus / pressed states. The page only carries an empty
  <div class="related-case" data-related-case hidden></div> placeholder.
*/
(function () {
  var RELATED_CASES = {
    "case-uniqkey": { href: "case-uniqkey-2", heading: "More from Uniqkey" },
    "case-uniqkey-2": { href: "case-uniqkey", heading: "More from Uniqkey" },
    "case-atj": { href: "case-atj-2", heading: "More from ATJ" },
    "case-atj-2": { href: "case-atj", heading: "More from ATJ" },
    "case-yoy": { href: "case-ridi", heading: "Next case" },
    "case-ridi": { href: "case-yoy", heading: "Next case" }
  };

  var holder = document.querySelector("[data-related-case]");
  if (!holder) return;

  var page = location.pathname.split("/").pop().replace(/\.html$/, "");
  var pair = RELATED_CASES[page];
  if (!pair) return;

  fetch("index.html")
    .then(function (res) {
      return res.text();
    })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var link = doc.querySelector('.case-card__link[href="' + pair.href + '"]');
      var card = link && link.closest(".case-card");
      if (!card) return;

      var clone = document.importNode(card, true);
      clone.removeAttribute("data-reveal");
      // Figma "Зразок футра з наближеним кейсом": media on the left, text right
      clone.classList.add("case-card--reverse");

      var heading = document.createElement("h2");
      heading.className = "h2-section reviews-heading";
      heading.textContent = pair.heading;

      holder.appendChild(heading);
      holder.appendChild(clone);
      holder.hidden = false;
    })
    .catch(function () {
      /* no network / file:// — the block simply stays hidden */
    });
})();
