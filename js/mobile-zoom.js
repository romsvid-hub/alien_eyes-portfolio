/*
  Below 1024px (styles: css/mobile.css). Mobile audit, 2026-11-27.
  - A tap on a marked image opens a full screen viewer: pinch, double tap, drag, + and -
    buttons, mouse wheel.
      data-zoom            a grey "Tap to zoom" caption under the image
      data-zoom="badge"    no caption: a small magnifier in the image's corner
      data-zoom="gallery"  the "Other Screens" carousel (caption under it)
      data-zoom-set="x"    images sharing a name, or all images inside the marked element,
                           are one gallery: the viewer steps through them (buttons, swipe,
                           arrow keys)
  - [data-zoom-compare] (the Before / After slider) gets its own "Zoom to compare" button,
    so the viewer never competes with the slider's gesture; inside the viewer the two states
    are switched with buttons and the zoom stays where it is.
  - The "Other Screens" carousel can be swiped; its arrows stay.
  Nothing is added to the page from 1024px, and a click on an image does nothing there.
*/
(function () {
  var narrow = window.matchMedia("(max-width: 1023px)");

  var GLASS =
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14M7 5v4M5 7h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  function button(className, text, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.textContent = text;
    if (label) b.setAttribute("aria-label", label);
    return b;
  }

  /* ---------- the viewer ---------- */

  // how: "states" (Before / After: same picture, the zoom stays) or "set" (a gallery)
  function openViewer(shots, opener, how, startAt) {
    var view = document.createElement("div");
    view.className = "zoom-view";
    view.setAttribute("role", "dialog");
    view.setAttribute("aria-modal", "true");
    view.setAttribute("aria-label", "Image viewer");

    var top = document.createElement("div");
    top.className = "zoom-view__top";
    var note = document.createElement("span");
    note.className = "zoom-view__note";
    note.textContent = "Pinch or double-tap to zoom";
    var close = button("zoom-view__btn zoom-view__btn--close", "×", "Close");
    top.appendChild(note);
    top.appendChild(close);

    var stage = document.createElement("div");
    stage.className = "zoom-view__stage";
    var img = document.createElement("img");
    stage.appendChild(img);

    var bottom = document.createElement("div");
    bottom.className = "zoom-view__bottom";
    var states = [];
    var inSet = how === "set" && shots.length > 1;
    if (inSet) {
      var prev = button("zoom-view__btn", "\u2039", "Previous image");
      var next = button("zoom-view__btn", "\u203a", "Next image");
      prev.addEventListener("click", function () {
        step(-1);
      });
      next.addEventListener("click", function () {
        step(1);
      });
      bottom.appendChild(prev);
      bottom.appendChild(next);
    }
    if (how === "states") {
      shots.forEach(function (shot, i) {
        var b = button("zoom-view__btn", shot.name);
        b.addEventListener("click", function () {
          select(i);
        });
        states.push(b);
        bottom.appendChild(b);
      });
    }
    var minus = button("zoom-view__btn", "−", "Zoom out");
    var plus = button("zoom-view__btn", "+", "Zoom in");
    bottom.appendChild(minus);
    bottom.appendChild(plus);

    view.appendChild(top);
    view.appendChild(stage);
    view.appendChild(bottom);
    document.body.appendChild(view);
    document.documentElement.classList.add("zoom-open");

    var scale = 1;
    var x = 0;
    var y = 0;
    var baseW = 0; // size at scale 1: the whole image inside the stage
    var baseH = 0;
    var maxScale = 4;
    var ready = false;

    function clamp() {
      var sw = stage.clientWidth;
      var sh = stage.clientHeight;
      var w = baseW * scale;
      var h = baseH * scale;
      x = w <= sw ? (sw - w) / 2 : Math.min(0, Math.max(sw - w, x));
      y = h <= sh ? (sh - h) / 2 : Math.min(0, Math.max(sh - h, y));
    }

    function draw() {
      clamp();
      // sized, not scaled: the browser redraws the picture sharp at every zoom
      img.style.width = baseW * scale + "px";
      img.style.height = baseH * scale + "px";
      img.style.transform = "translate(" + x + "px, " + y + "px)";
      minus.disabled = scale <= 1.001;
      plus.disabled = scale >= maxScale - 0.001;
    }

    // zoom around a point of the stage, so what is under the finger stays there
    function zoomTo(next, cx, cy) {
      if (!ready) return;
      next = Math.min(maxScale, Math.max(1, next));
      if (cx === undefined) {
        cx = stage.clientWidth / 2;
        cy = stage.clientHeight / 2;
      }
      var k = next / scale;
      x = cx - (cx - x) * k;
      y = cy - (cy - y) * k;
      scale = next;
      draw();
    }

    function fit(keep) {
      var nw = img.naturalWidth || 1;
      var nh = img.naturalHeight || 1;
      var k = Math.min(stage.clientWidth / nw, stage.clientHeight / nh);
      baseW = nw * k;
      baseH = nh * k;
      maxScale = Math.min(10, Math.max(4, (1.5 * nw) / baseW));
      if (!keep) {
        scale = 1;
        x = y = 0;
      }
      scale = Math.min(scale, maxScale);
      // a very tall screenshot would be a thin strip: start at the full width, from its top
      if (!keep && nh / nw > 2.5 && baseW < stage.clientWidth * 0.6) {
        scale = Math.min(maxScale, (stage.clientWidth * 0.94) / baseW);
        x = (stage.clientWidth - baseW * scale) / 2;
      }
      ready = true;
      draw();
    }

    var current = -1;
    function select(i) {
      var keep = how === "states" && current !== -1; // switching Before / After keeps the same spot
      current = i;
      img.onload = function () {
        fit(keep);
      };
      img.alt = shots[i].alt;
      img.src = shots[i].src;
      if (img.complete && img.naturalWidth) fit(keep);
      states.forEach(function (b, n) {
        b.setAttribute("aria-pressed", n === i ? "true" : "false");
      });
      if (inSet) note.textContent = i + 1 + " / " + shots.length + (how === "set" ? "  \u00b7  swipe, pinch to zoom" : "");
    }

    function step(by) {
      ready = false;
      select((current + by + shots.length) % shots.length);
    }

    var points = new Map();
    var pinch = null;
    var lastTap = 0;
    var downAt = null;
    var swipeFrom = null;

    function local(ev) {
      var r = stage.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    function two() {
      var p = Array.from(points.values());
      return {
        d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1,
        x: (p[0].x + p[1].x) / 2,
        y: (p[0].y + p[1].y) / 2
      };
    }

    stage.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      try {
        stage.setPointerCapture(ev.pointerId);
      } catch (error) {
        /* a synthetic pointer */
      }
      points.set(ev.pointerId, local(ev));
      if (points.size === 2) pinch = two();
      downAt = points.size === 1 ? local(ev) : null;
      if (points.size > 1) swipeFrom = null;
      else swipeFrom = inSet && scale <= 1.01 ? local(ev) : null;
    });

    stage.addEventListener("pointermove", function (ev) {
      if (!points.has(ev.pointerId)) return;
      var was = points.get(ev.pointerId);
      var now = local(ev);
      points.set(ev.pointerId, now);
      if (points.size === 2 && pinch) {
        var next = two();
        x += next.x - pinch.x;
        y += next.y - pinch.y;
        zoomTo(scale * (next.d / pinch.d), next.x, next.y);
        pinch = next;
      } else if (points.size === 1) {
        x += now.x - was.x;
        y += now.y - was.y;
        draw();
      }
    });

    function lift(ev) {
      if (!points.has(ev.pointerId)) return;
      var at = local(ev);
      points.delete(ev.pointerId);
      if (points.size < 2) pinch = null;
      if (ev.type === "pointerup" && swipeFrom) {
        var dx = at.x - swipeFrom.x;
        var dy = at.y - swipeFrom.y;
        swipeFrom = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          downAt = null;
          return step(dx < 0 ? 1 : -1);
        }
      }
      if (ev.type === "pointerup" && downAt && Math.hypot(at.x - downAt.x, at.y - downAt.y) < 8) {
        var now = Date.now();
        if (now - lastTap < 320) {
          zoomTo(scale > 1.01 ? 1 : Math.min(maxScale, 3), at.x, at.y);
          lastTap = 0;
        } else {
          lastTap = now;
        }
      }
      downAt = null;
    }
    stage.addEventListener("pointerup", lift);
    stage.addEventListener("pointercancel", lift);

    stage.addEventListener(
      "wheel",
      function (ev) {
        ev.preventDefault();
        var at = local(ev);
        zoomTo(scale * Math.exp(-ev.deltaY * 0.002), at.x, at.y);
      },
      { passive: false }
    );

    plus.addEventListener("click", function () {
      zoomTo(scale * 1.6);
    });
    minus.addEventListener("click", function () {
      zoomTo(scale / 1.6);
    });

    function resize() {
      if (!narrow.matches) return shut();
      fit(false);
    }

    function keys(ev) {
      if (ev.key === "Escape") return shut();
      if (inSet && ev.key === "ArrowRight") return step(1);
      if (inSet && ev.key === "ArrowLeft") return step(-1);
      if (ev.key === "+" || ev.key === "=") return zoomTo(scale * 1.6);
      if (ev.key === "-") return zoomTo(scale / 1.6);
      if (ev.key !== "Tab") return;
      var list = [].slice.call(view.querySelectorAll("button:not([disabled])"));
      var i = list.indexOf(document.activeElement);
      ev.preventDefault();
      list[(i + (ev.shiftKey ? list.length - 1 : 1)) % list.length].focus();
    }

    function shut() {
      document.removeEventListener("keydown", keys);
      window.removeEventListener("resize", resize);
      view.remove();
      document.documentElement.classList.remove("zoom-open");
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }

    close.addEventListener("click", shut);
    document.addEventListener("keydown", keys);
    window.addEventListener("resize", resize);
    select(startAt || 0);
    close.focus({ preventScroll: true });
  }

  /* ---------- captions, badges and taps ---------- */

  function shotOf(img, name) {
    return { src: img.currentSrc || img.src, alt: img.alt, name: name };
  }

  // the element after which the caption goes: the image, or the frame that holds only it
  function frameOf(el) {
    var parent = el.parentElement;
    return parent && parent.tagName === "DIV" && parent.children.length === 1 ? parent : el;
  }

  function hint(text, after, onDark) {
    var b = button("zoom-hint" + (onDark ? " zoom-hint--on-dark" : ""), "");
    b.innerHTML = GLASS;
    b.appendChild(document.createTextNode(text));
    after.parentNode.insertBefore(b, after.nextSibling);
    return b;
  }

  // a magnifier in the corner. It goes inside the picture's own frame; only a bare image or
  // a row that scrolls gets a wrapper (a wrapper changes what is next to what in the page,
  // and with it the spacing)
  function badge(target) {
    var b = button("zoom-badge", "", "Zoom image");
    b.innerHTML = GLASS;
    var scrolls = /auto|scroll/.test(getComputedStyle(target).overflowX);
    if (target.tagName === "DIV" && target.children.length === 1 && !scrolls) {
      if (getComputedStyle(target).position === "static") target.style.position = "relative";
      target.appendChild(b);
    } else {
      var wrap = document.createElement("div");
      wrap.className = "zoom-wrap";
      target.parentNode.insertBefore(wrap, target);
      wrap.appendChild(target);
      wrap.appendChild(b);
    }
    return b;
  }

  function wire(imgs, opener) {
    function openAt(i) {
      if (!narrow.matches) return;
      if (imgs.length === 1) openViewer([shotOf(imgs[0], "")], opener);
      else openViewer(imgs.map(function (img) { return shotOf(img, ""); }), opener, "set", i);
    }
    opener.addEventListener("click", function () {
      openAt(0);
    });
    imgs.forEach(function (img, i) {
      img.setAttribute("data-zoomable", "");
      img.addEventListener("click", function (ev) {
        if (!narrow.matches) return;
        // a picture that is also a link: the tap zooms, the link keeps its own button
        if (img.closest("a")) ev.preventDefault();
        openAt(i);
      });
    });
  }

  var ready = false;
  function setUp() {
    if (ready || !narrow.matches) return;
    ready = true;

    [].forEach.call(document.querySelectorAll("img[data-zoom]"), function (img) {
      var kind = img.getAttribute("data-zoom");
      if (img.closest("[data-zoom-set]")) return;
      var link = img.closest("a");
      var opener;
      if (kind === "badge") {
        opener = badge(link ? link.parentElement : frameOf(img));
      } else {
        var after = kind === "gallery" ? img.closest(".case-other-carousel__stage") : frameOf(img);
        opener = hint("Tap to zoom", after, img.closest("[data-zoom-dark]") !== null);
      }
      wire([img], opener);
    });

    // galleries: elements with a set name; one badge per element, one viewer per name
    var sets = {};
    var order = [];
    [].forEach.call(document.querySelectorAll("[data-zoom-set]"), function (el, i) {
      var name = el.getAttribute("data-zoom-set") || "set-" + i;
      if (!sets[name]) {
        sets[name] = [];
        order.push(name);
      }
      sets[name].push(el);
    });
    order.forEach(function (name) {
      var imgs = [];
      sets[name].forEach(function (el) {
        var found = el.tagName === "IMG" ? [el] : [].slice.call(el.querySelectorAll("img:not([aria-hidden])"));
        imgs = imgs.concat(found);
      });
      if (!imgs.length) return;
      var openers = sets[name].map(function (el) {
        var first = el.tagName === "IMG" ? el : el.querySelector("img:not([aria-hidden])");
        return { el: badge(el.tagName === "IMG" ? frameOf(el) : el), at: imgs.indexOf(first) };
      });
      var open = function (i, opener) {
        if (!narrow.matches) return;
        if (imgs.length === 1) openViewer([shotOf(imgs[0], "")], opener);
        else openViewer(imgs.map(function (img) { return shotOf(img, ""); }), opener, "set", i);
      };
      openers.forEach(function (o) {
        o.el.addEventListener("click", function () {
          open(o.at, o.el);
        });
      });
      imgs.forEach(function (img, i) {
        img.setAttribute("data-zoomable", "");
        img.addEventListener("click", function (ev) {
          if (img.closest("a")) ev.preventDefault();
          open(i, openers[0].el);
        });
      });
    });

    [].forEach.call(document.querySelectorAll("[data-zoom-compare]"), function (box) {
      var images = box.querySelectorAll("img");
      if (images.length < 2) return;
      var caption = hint("Zoom to compare", box, false);
      caption.className += " zoom-hint--button";
      caption.addEventListener("click", function () {
        if (narrow.matches) openViewer([shotOf(images[0], "Before"), shotOf(images[1], "After")], caption, "states");
      });
    });
  }

  setUp();
  if (narrow.addEventListener) narrow.addEventListener("change", setUp);

  /* ---------- swipe through "Other Screens" ---------- */

  var carousel = document.querySelector("[data-other-carousel]");
  var viewport = carousel && carousel.querySelector(".case-other-carousel__viewport");
  if (!viewport) return;
  var from = null;
  var swiped = 0;

  viewport.addEventListener("pointerdown", function (ev) {
    from = narrow.matches && ev.isPrimary ? { x: ev.clientX, y: ev.clientY } : null;
  });
  window.addEventListener("pointerup", function (ev) {
    if (!from) return;
    var dx = ev.clientX - from.x;
    var dy = ev.clientY - from.y;
    from = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    swiped = Date.now();
    carousel.querySelector(dx < 0 ? "[data-other-carousel-next]" : "[data-other-carousel-prev]").click();
  });
  window.addEventListener("pointercancel", function () {
    from = null;
  });
  // a swipe is not a tap: it must not open the viewer
  viewport.addEventListener(
    "click",
    function (ev) {
      if (Date.now() - swiped < 400) ev.stopPropagation();
    },
    true
  );
})();
