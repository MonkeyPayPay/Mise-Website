/* Mise — light progressive enhancement. No dependencies. */
(function () {
  "use strict";

  // --- Mobile menu toggle ---
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.hasAttribute("data-open");
      if (open) {
        menu.removeAttribute("data-open");
        menu.hidden = true;
      } else {
        menu.hidden = false;
        menu.setAttribute("data-open", "");
      }
      toggle.setAttribute("aria-expanded", String(!open));
    });
    // Close after tapping a link
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.removeAttribute("data-open");
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Mega-menu dropdowns (click/keyboard; hover is CSS) ---
  var navis = Array.prototype.slice.call(document.querySelectorAll(".navi"));
  if (navis.length) {
    var closeAll = function (except) {
      navis.forEach(function (n) {
        if (n === except) return;
        n.classList.remove("is-open");
        var t = n.querySelector(".navi__trigger");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    };
    navis.forEach(function (n) {
      var trigger = n.querySelector(".navi__trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        var open = n.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(open));
        closeAll(n);
      });
    });
    // Escape closes and returns focus to the open trigger
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = document.querySelector(".navi.is-open");
      if (open) {
        var t = open.querySelector(".navi__trigger");
        closeAll(null);
        if (t) t.focus();
      }
    });
    // Click outside closes
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".navi")) closeAll(null);
    });
  }

  // --- Scroll reveal ---
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // --- Count-up numbers + hero ticket "cascade" (progressive enhancement) ---
  var prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-countup"));
    if (isNaN(target)) return;
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    var fmt = function (v) {
      return pre + v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    };
    if (prefersReduce) { el.textContent = fmt(target); return; }
    var dur = 900, startTs = null;
    el.textContent = fmt(0);
    function step(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min((ts - startTs) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }
  var ticket = document.querySelector("[data-ticket]");
  function startTicket() {
    if (!ticket || ticket.getAttribute("data-live")) return;
    ticket.setAttribute("data-live", "1");
    ticket.classList.add("is-live");
    var nums = Array.prototype.slice.call(ticket.querySelectorAll("[data-countup]"));
    nums.forEach(function (el, i) {
      if (prefersReduce) { animateCount(el); }
      else { setTimeout(function () { animateCount(el); }, 180 + i * 130); } // sync with row stagger
    });
  }
  // any count-ups outside the ticket (future-proof) animate on their own visibility
  var looseCounts = Array.prototype.slice.call(document.querySelectorAll("[data-countup]"))
    .filter(function (el) { return !ticket || !ticket.contains(el); });

  if ("IntersectionObserver" in window) {
    if (ticket) {
      var tio = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (e) { if (e.isIntersecting) { startTicket(); o.unobserve(e.target); } });
      }, { threshold: 0.25 });
      tio.observe(ticket);
    }
    if (looseCounts.length) {
      var lio = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); o.unobserve(e.target); } });
      }, { threshold: 0.4 });
      looseCounts.forEach(function (el) { lio.observe(el); });
    }
  } else {
    startTicket();
    looseCounts.forEach(animateCount);
  }

  // --- Current year in footer ---
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = String(new Date().getFullYear());

  // --- Demo form: captures leads to your inbox via Web3Forms ---------------
  // SETUP (≈60s, no account): go to https://web3forms.com, enter the email you
  // want leads sent to, copy the access key, and paste it below. Until you do,
  // the form gracefully falls back to opening a pre-filled email.
  var WEB3FORMS_KEY = "7130a5a4-b2e8-4fe9-a5cd-adef0807d53e";

  var form = document.querySelector(".cta__form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector("[data-form-note]");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = (form.querySelector("#name") || {}).value || "";
      var email = (form.querySelector("#email") || {}).value || "";
      var rest = (form.querySelector("#restaurant") || {}).value || "";
      var phone = (form.querySelector("#phone") || {}).value || "";
      var honey = (form.querySelector("[name=botcheck]") || {}).checked;
      if (honey) { if (note) note.textContent = "Thanks — we got it."; return; } // bot trap

      // Not configured yet → mailto fallback so a lead is never lost.
      if (!WEB3FORMS_KEY || WEB3FORMS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
        var body = "Name: " + name + "%0ARestaurant: " + rest + "%0AEmail: " + email + "%0APhone: " + phone;
        window.location.href = "mailto:hello@mise-hospitality.com?subject=Demo%20request&body=" + body;
        if (note) note.textContent = "Opening your email app… or write us at hello@mise-hospitality.com.";
        return;
      }

      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      if (note) note.textContent = "Sending…";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "New demo request — Mise",
          from_name: "Mise website",
          name: name, email: email, restaurant: rest, phone: phone,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            if (note) note.textContent = "Thanks — we got it. We'll be in touch shortly.";
          } else if (note) {
            note.textContent = "Something went wrong. Please email hello@mise-hospitality.com.";
          }
        })
        .catch(function () {
          if (note) note.textContent = "Network error. Please email hello@mise-hospitality.com.";
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = "Request a demo"; }
        });
    });
  }
})();
