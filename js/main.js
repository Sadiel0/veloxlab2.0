(function () {
  var config = window.VELOX_CONFIG || {};

  document.querySelectorAll("[data-config]").forEach(function (el) {
    var path = el.getAttribute("data-config").split(".");
    var value = path.reduce(function (obj, key) { return obj && obj[key]; }, config);
    if (!value) return;
    if (el.getAttribute("data-config") === "email") {
      el.textContent = value;
      el.href = "mailto:" + value;
      return;
    }
    if (el.tagName === "A") el.href = value;
    if (el.tagName === "FORM") el.setAttribute("data-endpoint", value);
  });

  var previewFlag = new URLSearchParams(window.location.search).get("preview");
  var host = window.location.hostname;
  var production = host === "veloxlab.studio" || host === "www.veloxlab.studio";
  var showProposed = previewFlag === "1" || (previewFlag !== "0" && !production);
  if (showProposed) {
    document.querySelectorAll("[data-preview-only]").forEach(function (el) { el.hidden = false; });
  }

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
      // A filled honeypot is dropped. Nothing is posted until config.ready is true.
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
      /* Submissions stay on this page until js/config.js ready is true and formEndpoint is a real URL. */
      if (!config.ready) return;
    });
  });
})();
