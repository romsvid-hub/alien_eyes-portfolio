/*
  Prevents "hanging" 1-2 letter words (a, to, of, in, is, ...) from being
  left alone at the end of a wrapped line — glues a short word to the
  word that follows it with a non-breaking space instead, so they always
  wrap together. Runs once on load across the whole page, and is exposed
  as window.applyNbspTypography so scripts that swap text dynamically
  (reviews.js, case-other-carousel.js) can re-apply it to just the
  element they updated.

  Non-breaking spaces work at every viewport width by construction (the
  browser simply can't break the line there), so this needs no
  resize/breakpoint handling.

  Known gap: a short word immediately followed by an inline element
  (e.g. "a <strong>...") isn't glued to the text inside that element,
  since the check only looks ahead within the same text node. Fixing
  that would require walking across sibling/element boundaries, which
  isn't worth the complexity for how rarely a paragraph happens to break
  a short word right at that spot.
*/
(function () {
  var SKIP_TAGS = { SCRIPT: true, STYLE: true, TEXTAREA: true, CODE: true, PRE: true };

  // Leading context (start-of-node or whitespace) + a 1-2 letter word +
  // a plain space/tab + a following non-space character in the same
  // text node.
  var SHORT_WORD = /(^|[\s])([A-Za-zА-Яа-яІіЇїЄєҐґ]{1,2})[ \t]+(?=\S)/g;

  function fix(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parentTag = node.parentNode && node.parentNode.nodeName;
        return SKIP_TAGS[parentTag] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });

    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }

    nodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      var fixed = text.replace(SHORT_WORD, '$1$2 ');
      if (fixed !== text) {
        textNode.nodeValue = fixed;
      }
    });
  }

  window.applyNbspTypography = fix;

  document.addEventListener('DOMContentLoaded', function () {
    fix(document.body);
  });
})();
