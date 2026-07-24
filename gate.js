/* Mise — pre-launch preview gate (SOFT gate only).
   NOTE: this is a client-side gate for a static public site. It keeps casual
   visitors out until launch; it is NOT real security (page source is still
   fetchable). Remove this file + the two <script> lines in each <head> and the
   #mise-gate CSS block in styles.css to unpublish the gate at launch. */
(function () {
  "use strict";
  var KEY = "mise_gate_ok";
  var PASSWORD = "1234";
  try { if (localStorage.getItem(KEY) === "1") { document.documentElement.classList.remove("mise-locked"); return; } } catch (e) {}

  function build() {
    if (document.getElementById("mise-gate")) return;
    var ov = document.createElement("div");
    ov.id = "mise-gate";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Private preview — password required");
    ov.innerHTML =
      '<div class="mg__card">' +
        '<img class="mg__mark" src="/assets/app-icon-192.png" alt="" width="44" height="44" />' +
        '<p class="mg__eyebrow">Private preview</p>' +
        '<h1 class="mg__title">Mise is almost ready</h1>' +
        '<p class="mg__lede">This site isn’t public yet. Enter the password to take a look.</p>' +
        '<form class="mg__form" novalidate>' +
          '<input class="mg__input" type="password" inputmode="numeric" autocomplete="off" ' +
            'aria-label="Password" placeholder="Password" autofocus />' +
          '<button class="mg__btn" type="submit">Enter</button>' +
        '</form>' +
        '<p class="mg__err" role="alert" hidden>That’s not it — try again.</p>' +
      '</div>';
    document.body.appendChild(ov);

    var form = ov.querySelector(".mg__form");
    var input = ov.querySelector(".mg__input");
    var err = ov.querySelector(".mg__err");
    if (input) { try { input.focus(); } catch (e) {} }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if ((input.value || "").trim() === PASSWORD) {
        try { localStorage.setItem(KEY, "1"); } catch (e) {}
        document.documentElement.classList.remove("mise-locked");
        ov.parentNode && ov.parentNode.removeChild(ov);
      } else {
        err.hidden = false;
        input.value = "";
        input.focus();
        ov.querySelector(".mg__card").classList.remove("mg__card--shake");
        // reflow to restart the shake animation
        void ov.offsetWidth;
        ov.querySelector(".mg__card").classList.add("mg__card--shake");
      }
    });
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
