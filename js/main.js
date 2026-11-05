(function () {
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var sheet = document.getElementById("nav-sheet");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var skip = document.querySelector(".skip-link");
  if (skip) {
    skip.addEventListener("click", function () {
      var main = document.getElementById("main");
      if (main) main.focus({ preventScroll: true });
    });
  }

  if (nav) {
    var last = 0;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (window.matchMedia("(min-width: 1024px)").matches) {
          nav.classList.toggle("is-hidden", y > last && y > 80);
        } else {
          nav.classList.remove("is-hidden");
        }
        nav.classList.toggle("is-scrolled", y > 80);
        last = y;
        ticking = false;
      });
    }, { passive: true });
  }

  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
      toggle.focus();
    }
  }

  if (toggle && sheet) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.textContent = open ? "Menu" : "Close";
      sheet.hidden = open;
      if (!open) {
        var first = sheet.querySelector("a");
        if (first) first.focus();
      }
    });
    sheet.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeSheet);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSheet();
    });
  }

  var video = document.querySelector(".hero-loop");
  var pauseBtn = document.querySelector(".hero-pause");
  if (video && pauseBtn) {
    var userPaused = false;
    var inView = true;
    function syncPause() {
      var paused = video.paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
    }
    pauseBtn.addEventListener("click", function () {
      if (video.paused) {
        userPaused = false;
        video.play();
      } else {
        userPaused = true;
        video.pause();
      }
      syncPause();
    });
    if (!reduce) {
      video.play().catch(function () {});
      var heroWatch = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (!inView) video.pause();
        else if (!userPaused) video.play().catch(function () {});
        syncPause();
      }, { threshold: 0.25 });
      heroWatch.observe(video);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) video.pause();
        else if (!userPaused && inView) video.play().catch(function () {});
        syncPause();
      });
    }
    video.addEventListener("play", syncPause);
    video.addEventListener("pause", syncPause);
  }

  var screen = document.querySelector(".hero-screen");
  if (screen && fine && !reduce) {
    screen.addEventListener("pointermove", function (event) {
      var rect = screen.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      screen.querySelectorAll(".shift").forEach(function (el) {
        var depth = Number(el.getAttribute("data-depth")) || 0;
        el.style.transform = "translate(" + (x * depth) + "px, " + (y * depth) + "px)";
      });
    });
    screen.addEventListener("pointerleave", function () {
      screen.querySelectorAll(".shift").forEach(function (el) {
        el.style.transform = "";
      });
    });
  }

  var seam = document.querySelector(".seam-wrap");
  var stage = document.querySelector(".split-stage");
  if (seam && stage) {
    if (reduce) {
      seam.classList.add("is-in");
    } else {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) seam.classList.add("is-in");
      }, { threshold: 0.35 }).observe(stage);
    }
  }

  var track = document.querySelector(".work-track");
  var count = document.querySelector(".work-count");
  if (track && count) {
    var cards = Array.prototype.slice.call(track.querySelectorAll(".card"));
    function updateCount() {
      var mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      var best = 0;
      var bestDist = Infinity;
      cards.forEach(function (card, index) {
        var box = card.getBoundingClientRect();
        var dist = Math.abs(box.left + box.width / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      count.textContent = (best + 1) + " / " + cards.length;
    }
    track.addEventListener("scroll", updateCount, { passive: true });
    track.addEventListener("keydown", function (event) {
      var delta = Math.round(track.clientWidth * 0.85);
      if (event.key === "ArrowRight") track.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
      if (event.key === "ArrowLeft") track.scrollBy({ left: -delta, behavior: reduce ? "auto" : "smooth" });
    });
    updateCount();
  }

  var topic = new URLSearchParams(window.location.search).get("topic");
  if (topic) {
    var select = document.querySelector('#contact select[name="topic"]');
    if (select && Array.prototype.some.call(select.options, function (option) { return option.value === topic; })) {
      select.value = topic;
    }
  }

  var suggest = document.querySelector("[data-lang-suggest]");
  if (suggest && document.documentElement.lang === "en") {
    var wantsSpanish = (navigator.language || "").toLowerCase().indexOf("es") === 0;
    if (wantsSpanish && !sessionStorage.getItem("vl-lang-dismiss")) suggest.hidden = false;
    var dismiss = suggest.querySelector("[data-lang-dismiss]");
    if (dismiss) {
      dismiss.addEventListener("click", function () {
        suggest.hidden = true;
        sessionStorage.setItem("vl-lang-dismiss", "1");
      });
    }
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var err = form.querySelector(".form-error");
    var ok = form.querySelector(".form-ok");
    var requiredMsg = form.getAttribute("data-msg-required") || "Fill in this field.";
    var emailMsg = form.getAttribute("data-msg-email") || "Enter a valid email.";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (ok) ok.hidden = true;
      var trap = form.querySelector('[name="company_website"]');
      // TODO(owner): there is no form endpoint yet. A filled honeypot is dropped.
      if (trap && trap.value) return;
      var bad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        if (field.name === "company_website") return;
        field.removeAttribute("aria-invalid");
        var empty = field.required && !String(field.value).trim();
        var badEmail = field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if ((empty || badEmail) && !bad) bad = field;
        if (empty || badEmail) field.setAttribute("aria-invalid", "true");
      });
      if (bad) {
        if (err) {
          err.hidden = false;
          err.textContent = bad.type === "email" && bad.value ? emailMsg : requiredMsg;
        }
        bad.focus();
        return;
      }
      if (err) err.hidden = true;
      if (ok) ok.hidden = false;
      var button = form.querySelector('[type="submit"]');
      if (button) button.disabled = true;
      // TODO(owner): POST the payload once an endpoint exists.
    });
  });
})();

/* Motion layer: Lenis smooth scroll, scroll-linked hero, reveals, marquee,
   embers, cursor. Decorative elements are injected here so EN and ES share it. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var es = root.lang === "es";
  var vh = window.innerHeight;
  var vw = window.innerWidth;
  window.addEventListener("resize", function () { vh = window.innerHeight; vw = window.innerWidth; }, { passive: true });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------- Hero: word masks, atmosphere, meta strip ---------- */

  var screen = document.querySelector(".hero-screen");
  var heroMedia = document.querySelector(".hero-media");
  var heroVideo = document.querySelector(".hero-loop");
  var kws = Array.prototype.slice.call(document.querySelectorAll(".hero-screen .kw"));

  kws.forEach(function (kw) {
    var shift = kw.querySelector(".shift");
    if (!shift || shift.querySelector(".line-in")) return;
    var text = shift.textContent;
    shift.textContent = "";
    var mask = el("span", "line-mask");
    var inner = el("span", "line-in");
    inner.textContent = text;
    mask.appendChild(inner);
    shift.appendChild(mask);
    shift.style.transition = "transform 1100ms cubic-bezier(0.19, 1, 0.22, 1)";
  });

  var embers = null;
  if (heroMedia) {
    var scrim = heroMedia.querySelector(".hero-scrim");
    embers = el("canvas", "hero-embers");
    embers.setAttribute("aria-hidden", "true");
    heroMedia.insertBefore(embers, scrim);
    heroMedia.insertBefore(el("div", "grain"), scrim ? scrim.nextSibling : null);
  }
  if (screen) {
    var meta = el("div", "hero-meta",
      '<span class="rec">Miami · EN / ES</span><span class="scroll-cue"><i></i>' + (es ? "Desliza" : "Scroll") + "</span>");
    meta.setAttribute("aria-hidden", "true");
    screen.appendChild(meta);
  }
  if (heroVideo) {
    var ready = function () { heroVideo.classList.add("is-ready"); };
    if (heroVideo.readyState >= 3 && !heroVideo.paused) ready();
    heroVideo.addEventListener("playing", ready);
  }

  // On phones the words sit in the flow: shrink any word wider than the column (e.g. CONSTRUYE)
  function fitWords() {
    kws.forEach(function (kw) {
      kw.style.fontSize = "";
      if (window.innerWidth >= 768) return;
      var inner = kw.querySelector(".line-in");
      var avail = kw.clientWidth;
      var need = inner ? inner.scrollWidth : kw.scrollWidth;
      if (need > avail && avail > 0) {
        var size = parseFloat(getComputedStyle(kw).fontSize);
        kw.style.fontSize = Math.floor(size * (avail / need) * 0.98) + "px";
      }
    });
  }
  fitWords();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWords);
  window.addEventListener("resize", fitWords, { passive: true });

  function loaded() { root.classList.add("is-loaded"); }
  if (reduce) loaded();
  else {
    var done = false;
    var go = function () { if (done) return; done = true; requestAnimationFrame(function () { requestAnimationFrame(loaded); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 700);
  }

  /* ---------- Marquee built from the service names on the page ---------- */

  var heroFrame = document.querySelector(".hero-frame");
  var marqueeTrack = null;
  var names = Array.prototype.map.call(document.querySelectorAll(".offer-rows strong"), function (s) { return s.textContent.trim(); });
  if (heroFrame && names.length) {
    var marquee = el("div", "marquee");
    marquee.setAttribute("aria-hidden", "true");
    marqueeTrack = el("div", "marquee-track");
    var groupHtml = "";
    for (var rep = 0; rep < 2; rep++) {
      names.forEach(function (n) {
        groupHtml += '<span class="marquee-item">' + n.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
          '<img src="/assets/logo/veloxlab-icon.svg" alt="" width="28" height="28" /></span>';
      });
    }
    marqueeTrack.appendChild(el("div", "marquee-group", groupHtml));
    marqueeTrack.appendChild(el("div", "marquee-group", groupHtml));
    marquee.appendChild(marqueeTrack);
    heroFrame.parentNode.insertBefore(marquee, heroFrame.nextSibling);
  }

  /* ---------- Section eyebrows from the nav labels ---------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-pill a"));
  var n = 0;
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (!sec) return;
    var h2 = sec.querySelector("h2");
    n += 1;
    var eb = el("p", "eyebrow", "<b>(0" + n + ")</b>" + a.textContent.trim());
    eb.setAttribute("aria-hidden", "true");
    if (!h2 || h2.classList.contains("sr-only")) sec.insertBefore(eb, sec.firstElementChild);
    else if (h2.parentNode.classList.contains("work-head")) h2.parentNode.parentNode.insertBefore(eb, h2.parentNode);
    else h2.parentNode.insertBefore(eb, h2);
  });

  /* ---------- Headings: serif accent on the last word, then split into words ---------- */

  var heads = Array.prototype.slice.call(document.querySelectorAll("main h2:not(.sr-only)"));
  heads.forEach(function (h) {
    if (!h.querySelector(".accent")) {
      var last = h.lastChild;
      if (last && last.nodeType === 3) {
        var t = last.textContent.replace(/\s+$/, "");
        var cut = t.lastIndexOf(" ");
        if (cut > 0) {
          last.textContent = t.slice(0, cut + 1);
          var acc = el("span", "accent");
          acc.textContent = t.slice(cut + 1);
          h.appendChild(acc);
        }
      }
    }
    if (reduce) return;
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    var nodes = Array.prototype.slice.call(h.childNodes);
    var i = 0;
    h.textContent = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { h.appendChild(document.createTextNode(" ")); return; }
          var w = el("span", "w");
          var s = el("span");
          s.textContent = part;
          s.style.setProperty("--i", i++);
          w.appendChild(s);
          w.setAttribute("aria-hidden", "true");
          h.appendChild(w);
        });
      } else {
        var w2 = el("span", "w");
        node.style.setProperty("--i", i++);
        node.style.display = "inline-block";
        w2.appendChild(node);
        w2.setAttribute("aria-hidden", "true");
        h.appendChild(w2);
      }
    });
    h.classList.add("split");
  });

  /* ---------- Reveals ---------- */

  var revealSel = [
    ".eyebrow", "main .lede", ".work-head .work-count", ".card", ".offer-rows li", ".half-note", ".bullets li",
    ".outcomes li", ".spot .btn", ".steps li", ".step-n", ".card figcaption", ".why li", ".reel-frame", ".reel-cap", ".form label", ".form .btn",
    ".half .btn", ".booking", ".contact-meta", ".footer-grid > *", ".legal"
  ].join(",");
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(revealSel)).filter(function (e) {
    return !e.closest(".hero-screen") && !e.closest(".hp");
  });
  var counters = new Map();
  revealEls.forEach(function (e) {
    var k = counters.get(e.parentNode) || 0;
    counters.set(e.parentNode, k + 1);
    e.style.setProperty("--i", Math.min(k, 6));
    e.classList.add("rv");
  });
  // labels resolve out of the same glyphs as the code rain in the 3D stage
  var GLYPHS = "01<>/{}=;+*#[]$%";
  function decode(node) {
    var texts = [];
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) texts.push(walker.currentNode);
    texts.forEach(function (t, ti) {
      var final = t.nodeValue;
      var start = performance.now() + ti * 120;
      var dur = 380 + final.length * 38;
      node.classList.add("decoding");
      (function step(now) {
        var p = Math.max(0, (now - start) / dur);
        var out = "";
        for (var i = 0; i < final.length; i++) {
          var c = final[i];
          if (c === " " || p * final.length * 1.15 > i + 0.5) out += c;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        t.nodeValue = out;
        if (p < 1) requestAnimationFrame(step);
        else { t.nodeValue = final; node.classList.remove("decoding"); }
      })(performance.now());
    });
  }

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          if (en.target.matches(".eyebrow, .step-n, .card figcaption, .reel-cap")) decode(en.target);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.concat(heads).forEach(function (e) { io.observe(e); });
  } else {
    revealEls.concat(heads).forEach(function (e) { e.classList.add("is-in"); });
  }

  /* ---------- Nav pill indicator ---------- */

  var pill = document.querySelector(".nav-pill");
  var dot = null;
  if (pill) { dot = el("span", "pill-dot"); dot.setAttribute("aria-hidden", "true"); pill.insertBefore(dot, pill.firstChild); }
  var navTargets = navLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var activeIdx = -1;
  function setActive(idx) {
    if (idx === activeIdx || !dot) return;
    activeIdx = idx;
    navLinks.forEach(function (a, i) { a.classList.toggle("is-active", i === idx); });
    if (idx < 0) { dot.classList.remove("is-on"); return; }
    var a = navLinks[idx];
    dot.style.width = a.offsetWidth + "px";
    dot.style.transform = "translateX(" + a.offsetLeft + "px)";
    dot.classList.add("is-on");
  }

  /* ---------- Steps progress line ---------- */

  var steps = document.querySelector(".steps");
  if (steps) { var bar = el("span", "steps-progress"); bar.setAttribute("aria-hidden", "true"); steps.appendChild(bar); }

  /* ---------- Cursor, magnets, card spotlight ---------- */

  var cursor = null;
  var cx = -100, cy = -100, tx = -100, ty = -100;
  if (fine && !reduce) {
    cursor = el("div", "cursor", "<span>" + (es ? "Ver" : "Play") + "</span>");
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (cx < -50) { cx = tx; cy = ty; }
      cursor.classList.add("is-on");
    }, { passive: true });
    document.addEventListener("pointerleave", function () { cursor.classList.remove("is-on"); });
    document.addEventListener("pointerover", function (e) {
      var t = e.target;
      var play = t.closest && t.closest(".reel-frame");
      var link = t.closest && t.closest("a, button, select, label, [tabindex='0']");
      cursor.classList.toggle("is-play", !!play);
      cursor.classList.toggle("is-link", !play && !!link);
    });

    document.querySelectorAll(".btn:not(.btn-wide), .play-reel").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = "translate(" + dx * 0.22 + "px," + dy * 0.32 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });

    document.querySelectorAll(".card-media").forEach(function (m) {
      m.addEventListener("pointermove", function (e) {
        var r = m.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        m.style.setProperty("--cx", px * 100 + "%");
        m.style.setProperty("--cy", py * 100 + "%");
        m.style.transform = "perspective(900px) rotateX(" + (0.5 - py) * 6 + "deg) rotateY(" + (px - 0.5) * 8 + "deg) translateY(-4px)";
      });
      m.addEventListener("pointerleave", function () { m.style.transform = ""; });
    });

    var reelFrame = document.querySelector(".reel-frame");
    if (reelFrame) {
      reelFrame.addEventListener("pointermove", function (e) {
        var r = reelFrame.getBoundingClientRect();
        reelFrame.style.setProperty("--rx", ((e.clientX - r.left) / r.width) * 100 + "%");
        reelFrame.style.setProperty("--ry", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    }

    if (screen) {
      var scrimEl = screen.querySelector(".hero-scrim");
      screen.addEventListener("pointermove", function (e) {
        var r = screen.getBoundingClientRect();
        if (scrimEl) {
          scrimEl.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          scrimEl.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        }
        pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true;
      });
      screen.addEventListener("pointerleave", function () { pointer.on = false; });
    }
  }

  /* ---------- Embers (2D canvas, paused off screen) ---------- */

  var pointer = { x: 0, y: 0, on: false };
  var ctx = embers && !reduce ? embers.getContext("2d") : null;
  var parts = [];
  var ew = 0, eh = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function sizeEmbers() {
    if (!ctx) return;
    var r = embers.getBoundingClientRect();
    ew = r.width; eh = r.height;
    embers.width = Math.round(ew * dpr);
    embers.height = Math.round(eh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = ew < 700 ? 28 : 64;
    while (parts.length < want) parts.push(spawn(true));
    parts.length = want;
  }
  function spawn(anywhere) {
    var bias = Math.random() < 0.7 ? 0.45 + Math.random() * 0.55 : Math.random();
    return {
      x: bias * ew,
      y: anywhere ? Math.random() * eh : eh + 10,
      vy: 0.25 + Math.random() * 0.7,
      vx: -0.15 - Math.random() * 0.25,
      r: 0.6 + Math.random() * 1.8,
      ph: Math.random() * Math.PI * 2,
      life: 0.4 + Math.random() * 0.6
    };
  }
  if (ctx) { sizeEmbers(); window.addEventListener("resize", sizeEmbers, { passive: true }); }
  function drawEmbers(t) {
    ctx.clearRect(0, 0, ew, eh);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.vy;
      p.x += p.vx + Math.sin(t * 0.0012 + p.ph) * 0.35;
      if (pointer.on) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (1 - d2 / 16000) * 1.6; var d = Math.sqrt(d2) || 1; p.x += (dx / d) * f; p.y += (dy / d) * f; }
      }
      if (p.y < -10 || p.x < -10) { parts[i] = spawn(false); continue; }
      var fade = clamp(p.y / eh, 0, 1);
      var a = p.life * fade * (0.55 + 0.45 * Math.sin(t * 0.004 + p.ph * 3));
      ctx.fillStyle = "rgba(255,140,40," + (a * 0.18).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(255,210,150," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
  }

  /* ---------- Lenis smooth scroll + anchors ---------- */

  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    window.__lenis = lenis;
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.search !== location.search || !url.hash || url.hash === "#") return;
      var target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -84, duration: 1.5, easing: function (x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); } });
      if (history.pushState) history.pushState(null, "", url.hash);
    });
  }

  /* ---------- One frame loop for everything scroll-linked ---------- */

  var marqueeX = 0, marqueeW = 0, lastY = window.scrollY, vel = 0;
  var stepsBar = steps && steps.querySelector(".steps-progress");
  var reel = document.querySelector(".reel-frame");
  var giant = document.querySelector(".giant");
  var footer = document.querySelector(".footer");
  var heroPict = heroMedia && heroMedia.querySelector("picture");
  var frame = 0;

  function tick(t) {
    if (lenis) lenis.raf(t);
    var y = window.scrollY;
    vel = lerp(vel, y - lastY, 0.12);
    lastY = y;
    frame++;

    // hero: shrink, parallax, drift words apart
    if (screen && !reduce) {
      var hh = screen.offsetHeight || vh;
      var p = clamp(y / hh, 0, 1);
      var has3d = root.classList.contains("has-3d");
      if (p < 1 && vw >= 768) {
        screen.style.transform = has3d ? "" : "scale(" + (1 - p * 0.08).toFixed(4) + ")";
        var py = (p * 90).toFixed(1) + "px";
        if (heroPict) heroPict.style.setProperty("--hero-py", py);
        if (heroVideo) heroVideo.style.setProperty("--hero-py", py);
        kws.forEach(function (k, i) {
          var dir = i === 1 ? 1 : -1;
          k.style.transform = "translate3d(" + (dir * p * vw * 0.12).toFixed(1) + "px," + (-p * 40).toFixed(1) + "px,0)";
          k.style.opacity = (1 - p * 1.1).toFixed(3);
        });
      }
      if (ctx && !has3d && p < 0.98 && !document.hidden) drawEmbers(t);
    }

    // marquee: base speed plus scroll velocity
    if (marqueeTrack) {
      if (!marqueeW) marqueeW = marqueeTrack.firstElementChild.offsetWidth;
      if (marqueeW) {
        var speed = reduce ? 0 : 0.6 + Math.min(Math.abs(vel) * 0.35, 14);
        marqueeX -= speed * (vel < -0.5 ? -1 : 1);
        if (marqueeX <= -marqueeW) marqueeX += marqueeW;
        if (marqueeX > 0) marqueeX -= marqueeW;
        marqueeTrack.style.transform = "translate3d(" + marqueeX.toFixed(2) + "px,0,0)";
      }
    }

    // reel grows into frame
    if (reel && !reduce) {
      var rr = reel.getBoundingClientRect();
      var rp = clamp((vh - rr.top) / (vh * 0.8), 0, 1);
      reel.style.setProperty("--reel-clip", ((1 - rp) * 10).toFixed(2) + "% " + ((1 - rp) * 14).toFixed(2) + "%");
    }

    // process line
    if (stepsBar) {
      var sr = steps.getBoundingClientRect();
      stepsBar.style.setProperty("--p", clamp((vh * 0.85 - sr.top) / (vh * 0.5), 0, 1).toFixed(3));
    }

    // footer watermark rises
    if (giant && footer && !reduce) {
      var fr = footer.getBoundingClientRect();
      if (fr.top < vh) giant.style.setProperty("--gy", (clamp((fr.top + fr.height - vh) / fr.height, 0, 1) * 120).toFixed(1) + "px");
    }

    // active nav item, every 6th frame
    if (frame % 6 === 0 && dot) {
      var idx = -1;
      for (var i = 0; i < navTargets.length; i++) {
        var s = navTargets[i];
        if (s && s.getBoundingClientRect().top < vh * 0.45) idx = i;
      }
      setActive(idx);
    }

    // cursor
    if (cursor) {
      cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.addEventListener("resize", function () { marqueeW = 0; }, { passive: true });
})();
