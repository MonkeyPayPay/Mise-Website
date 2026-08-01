/* ============================================================
   DEMO-URLS config — THE single swappable location for every
   live-demo link on the site.

   Mirrors DEMO-URLS.md in the platform repo
   (MonkeyPayPay/Reservation-Scheduling-App, demo-mode branch).
   URLs there are declared final; change them HERE and they change
   everywhere — every demo link/button carries data-demo="<key>"
   and is filled from this map at load.

   Placeholders: any value beginning with "TODO-DEMO-URL" renders
   the link disabled with a "coming soon" title instead of a dead
   href. Native-app store links are TODO until signed builds exist
   (see DEMO-URLS.md "Native binaries").
   ============================================================ */
(function () {
  "use strict";
  var DEMOS = {
    /* The four live demo surfaces — one shared sandbox per visitor */
    backoffice:   "https://demo.mise-hospitality.com",
    pos:          "https://demo-pos.mise-hospitality.com",
    reservations: "https://demo-reservations.mise-hospitality.com",
    mobile:       "https://demo-app.mise-hospitality.com",

    /* Persona deep links (any demo host + ?persona=<key>) */
    "backoffice-owner":      "https://demo.mise-hospitality.com/?persona=owner",
    "backoffice-gm":         "https://demo.mise-hospitality.com/?persona=gm",
    "backoffice-chef":       "https://demo.mise-hospitality.com/?persona=chef",
    "backoffice-accounting": "https://demo.mise-hospitality.com/?persona=accounting",
    "backoffice-marketing":  "https://demo.mise-hospitality.com/?persona=marketing",
    "mobile-server":         "https://demo-app.mise-hospitality.com/?persona=server",
    "mobile-host":           "https://demo-app.mise-hospitality.com/?persona=host",

    /* Native binaries — operator-gated; not yet published */
    ios:     "TODO-DEMO-URL-testflight",   // FILL: public TestFlight link once signed build exists
    android: "TODO-DEMO-URL-play"          // FILL: Play internal-testing opt-in link
  };

  window.MISE_DEMOS = DEMOS;

  function apply() {
    var links = document.querySelectorAll("[data-demo]");
    Array.prototype.forEach.call(links, function (a) {
      var key = a.getAttribute("data-demo");
      var url = DEMOS[key];
      if (!url) return;
      if (url.indexOf("TODO-DEMO-URL") === 0) {
        a.setAttribute("aria-disabled", "true");
        a.classList.add("btn--disabled");
        a.removeAttribute("href");
        a.title = "Coming soon";
        return;
      }
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
