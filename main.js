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

  // --- Demo form: no backend wired yet, so guide instead of silently failing ---
  var form = document.querySelector(".cta__form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector("[data-form-note]");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var email = encodeURIComponent((form.querySelector("#email") || {}).value || "");
      var name = encodeURIComponent((form.querySelector("#name") || {}).value || "");
      var rest = encodeURIComponent((form.querySelector("#restaurant") || {}).value || "");
      // Fallback that always works with zero backend: open a pre-filled email.
      var body = "Name: " + decodeURIComponent(name) +
                 "%0ARestaurant: " + decodeURIComponent(rest) +
                 "%0AEmail: " + decodeURIComponent(email);
      window.location.href =
        "mailto:hello@mise-hospitality.com?subject=Demo%20request&body=" + body;
      if (note) note.textContent = "Opening your email app… or write us directly at hello@mise-hospitality.com.";
    });
  }
})();
