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

  // --- Current year in footer ---
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = String(new Date().getFullYear());

  // --- Demo form: captures leads to your inbox via Web3Forms ---------------
  // SETUP (≈60s, no account): go to https://web3forms.com, enter the email you
  // want leads sent to, copy the access key, and paste it below. Until you do,
  // the form gracefully falls back to opening a pre-filled email.
  var WEB3FORMS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

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
      var honey = (form.querySelector("[name=botcheck]") || {}).checked;
      if (honey) { if (note) note.textContent = "Thanks — we got it."; return; } // bot trap

      // Not configured yet → mailto fallback so a lead is never lost.
      if (!WEB3FORMS_KEY || WEB3FORMS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
        var body = "Name: " + name + "%0ARestaurant: " + rest + "%0AEmail: " + email;
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
          name: name, email: email, restaurant: rest,
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
