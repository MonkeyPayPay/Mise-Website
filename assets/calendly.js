/* ============================================================
   CALENDLY config — THE single swappable location for the
   demo-call scheduler.

   LIVE since 2026-08-01 — booking notifications go to the
   support@mise-hospitality.com Calendly account.

   TO CHANGE THE LINK: replace CALENDLY_URL below. ⚠️ If you edit
   the event's URL slug in Calendly (Event types → the event →
   its link), the old link 404s — update it here at the same time.
   Renaming the event's display NAME is safe; the slug is what matters.

   WHILE UNSET (or if Calendly fails to load) the scheduler
   section stays hidden and the contact form is the only path —
   a visitor never sees a broken widget or a dead end.
   ============================================================ */
(function () {
  "use strict";

  var CALENDLY_URL = "https://calendly.com/mise-hospitality-support/30min";

  // Brand the embed to the candlelight palette (Calendly reads these params).
  var THEME = {
    background_color: "0e1218", // --paper
    text_color: "e9edf3",       // --ink
    primary_color: "e8b34b"     // --saffron
  };

  window.MISE_CALENDLY = CALENDLY_URL;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var section = document.querySelector("[data-calendly-section]");
    var mount = document.querySelector("[data-calendly]");
    if (!section || !mount) return;

    // Not configured yet → leave the section hidden; the form below carries the page.
    if (!CALENDLY_URL || CALENDLY_URL.indexOf("TODO-CALENDLY-URL") === 0) return;

    var url = CALENDLY_URL
      + (CALENDLY_URL.indexOf("?") === -1 ? "?" : "&")
      + "hide_gdpr_banner=1"
      + "&background_color=" + THEME.background_color
      + "&text_color=" + THEME.text_color
      + "&primary_color=" + THEME.primary_color;

    mount.className = "calendly-inline-widget";
    mount.setAttribute("data-url", url);

    // Load Calendly's widget script once; reveal the section only once it's in.
    var s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = function () { section.hidden = false; };
    s.onerror = function () { /* stay hidden — the form remains the path */ };
    document.head.appendChild(s);

    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);
  });
})();
