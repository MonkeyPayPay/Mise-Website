/* Pricing page renderer + package builder.
   Renders EVERYTHING from window.MISE_PRICING (assets/pricing-model.js) —
   no dollar amounts live in the HTML. The builder and the tier cards call
   the same computePrice engine (DESIGN-PLAN-BUILDER: "a tier is a saved
   configuration; a custom package is an unsaved one"). */
(function () {
  "use strict";
  var P = window.MISE_PRICING;
  if (!P) return;
  var BOOK = P.BOOK, money = P.money, tierLabel = P.tierLabel;

  var state = { family: "backoffice", cycle: "monthly" };
  var bld = { family: "backoffice", tier: "starter", locations: 1, terminalsPerLocation: 2, seats: 20, addons: [], connections: 0, cycle: "monthly" };

  /* ---------- tier cards ---------- */
  var TIER_BLURBS = {
    starter: "The book, the schedule and the numbers — the honest start.",
    professional: "Inventory, events, marketing and ops boards join in.",
    business: "Multi-location, advanced reporting, payouts and channels.",
    enterprise: "Custom limits, SLA, dedicated support, org tier."
  };
  function tierIncludes(t) {
    var lim = BOOK.limits[t];
    var out = [];
    if (lim.custom) {
      out.push("Custom locations, terminals & seats", "Everything in Business", "SLA + dedicated support", "Sandbox tenant");
      return out;
    }
    out.push(lim.locationsIncluded + (lim.locationsIncluded > 1 ? " locations" : " location") + " included" + (lim.locationsMax > lim.locationsIncluded ? " (up to " + lim.locationsMax + ")" : ""));
    if (state.family === "fullsuite") out.push(lim.terminalsIncluded + " terminals per location");
    else out.push((lim.connections || 0) + " POS adapter connection" + (lim.connections === 1 ? "" : "s") + " included");
    out.push(lim.seats + " staff seats");
    if (lim.email > 0) out.push(lim.email.toLocaleString() + " emails / mo");
    out.push(lim.sms.toLocaleString ? lim.sms.toLocaleString() + " SMS segments / mo" : "");
    return out.filter(Boolean);
  }
  function renderTiers() {
    var el = document.getElementById("tierCards");
    if (!el) return;
    var html = BOOK.tierNames.map(function (t) {
      var base = BOOK.base[state.family][t];
      var featured = t === "professional";
      var isEnt = t === "enterprise";
      var priceHtml, metaHtml = "";
      if (state.cycle === "annual") {
        var eq = Math.round(base * (1 - BOOK.annualDiscountPct / 100));
        priceHtml = (isEnt ? "from " : "") + money(eq) + '<span style="font-size:1rem;color:var(--muted)">/mo</span>';
        metaHtml = money(eq * 12) + " billed annually" + (isEnt ? " · contract" : "");
      } else {
        priceHtml = (isEnt ? "from " : "") + money(base) + '<span style="font-size:1rem;color:var(--muted)">/mo</span>';
        metaHtml = isEnt ? "annual contract" : "per month";
      }
      var inc = tierIncludes(t).map(function (i) { return "<li>" + i + "</li>"; }).join("");
      return '<article class="price' + (featured ? " price--featured" : "") + ' reveal is-visible">'
        + (featured ? '<p class="price__badge">Most popular</p>' : "")
        + '<h3 class="price__name">' + tierLabel(t) + "</h3>"
        + '<p class="price__amount">' + priceHtml + "</p>"
        + '<p class="price__meta">' + metaHtml + "</p>"
        + '<p style="color:var(--muted);font-size:.92rem;margin-top:.6rem">' + TIER_BLURBS[t] + "</p>"
        + '<ul class="price__inc">' + inc + "</ul>"
        + '<p style="margin-top:1.3rem"><a class="btn ' + (featured ? "btn--solid" : "btn--outline") + ' btn--block" href="' + (isEnt ? "/contact.html" : "/contact.html") + '">' + (isEnt ? "Talk to us" : "Start with " + tierLabel(t)) + "</a></p>"
        + "</article>";
    }).join("");
    el.innerHTML = html;
  }

  /* ---------- gating matrix ---------- */
  function renderMatrix() {
    var el = document.getElementById("matrixTable");
    if (!el) return;
    var head = "<thead><tr><th class=\"cmp__col1\">Module</th>" + BOOK.tierNames.map(function (t) {
      return '<th scope="col"' + (t === "professional" ? ' class="is-mise"' : "") + ">" + tierLabel(t) + "</th>";
    }).join("") + "</tr></thead>";
    var rows = BOOK.matrix.map(function (r) {
      var cells = r.slice(1).map(function (v, i) {
        var cls = i === 1 ? ' class="is-mise"' : "";
        var span = v === "✓" ? '<span class="yes"></span>' : v === "—" ? '<span class="no"></span>' : "<strong>$</strong> add-on";
        return "<td" + cls + ">" + span + "</td>";
      }).join("");
      return '<tr><th scope="row">' + r[0] + "</th>" + cells + "</tr>";
    }).join("");
    el.innerHTML = head + "<tbody>" + rows + "</tbody>";
  }

  /* ---------- toggles ---------- */
  document.querySelectorAll("[data-family]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.family = b.getAttribute("data-family");
      document.querySelectorAll("[data-family]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var note = document.getElementById("famNote");
      if (note) note.textContent = state.family === "backoffice"
        ? "Back-office: the full suite minus our terminal — connect the POS you already run (Toast, Square, Lightspeed)."
        : "Full suite: everything in back-office plus the Mise POS terminal app, Studio, KDS, drawers and the device fleet.";
      renderTiers();
    });
  });
  document.querySelectorAll("[data-cycle]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.cycle = b.getAttribute("data-cycle");
      document.querySelectorAll("[data-cycle]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderTiers();
    });
  });
  var pctEl = document.getElementById("annualPct");
  if (pctEl) pctEl.textContent = "(−" + BOOK.annualDiscountPct + "%)";

  /* ---------- builder ---------- */
  var order = BOOK.tierNames;
  function renderAddons() {
    var box = document.getElementById("bAddons");
    if (!box) return;
    box.innerHTML = Object.keys(BOOK.addons).map(function (id) {
      var a = BOOK.addons[id];
      var included = order.indexOf(bld.tier) >= order.indexOf(a.includedFrom);
      var available = order.indexOf(bld.tier) >= order.indexOf(a.availableAt);
      var note = included ? "Included in " + tierLabel(bld.tier)
        : available ? money(a.price) + "/mo add-on"
        : "Included from " + tierLabel(a.includedFrom);
      var disabled = included || !available;
      var checked = included || bld.addons.indexOf(id) !== -1;
      return '<label class="chk"><input type="checkbox" data-addon="' + id + '"' + (checked ? " checked" : "") + (disabled ? " disabled" : "") + ' /> <span>' + a.label + '<span class="note">' + note + "</span></span></label>";
    }).join("");
    box.querySelectorAll("[data-addon]").forEach(function (c) {
      c.addEventListener("change", function () {
        var id = c.getAttribute("data-addon");
        var i = bld.addons.indexOf(id);
        if (c.checked && i === -1) bld.addons.push(id);
        if (!c.checked && i !== -1) bld.addons.splice(i, 1);
        renderQuote();
      });
    });
  }
  function clampToTier() {
    var lim = BOOK.limits[bld.tier];
    // hard location ceiling: crossing it re-anchors upward (DESIGN-PLAN-BUILDER §4)
    while (bld.locations > BOOK.limits[bld.tier].locationsMax && bld.tier !== "business") {
      bld.tier = order[order.indexOf(bld.tier) + 1];
      var sel = document.getElementById("bTier"); if (sel) sel.value = bld.tier;
    }
    lim = BOOK.limits[bld.tier];
    if (bld.locations > lim.locationsMax) bld.locations = lim.locationsMax;
    if (bld.terminalsPerLocation < lim.terminalsIncluded) bld.terminalsPerLocation = lim.terminalsIncluded;
    if (bld.seats < lim.seats) bld.seats = lim.seats;
  }
  function renderQuote() {
    clampToTier();
    document.getElementById("oLoc").textContent = bld.locations;
    document.getElementById("oTerm").textContent = bld.terminalsPerLocation;
    document.getElementById("oSeats").textContent = bld.seats;
    document.getElementById("oConn").textContent = bld.connections;
    document.getElementById("fTerm").style.display = bld.family === "fullsuite" ? "" : "none";

    var q = P.computePrice(bld, BOOK, bld.cycle);
    var lines = document.getElementById("qLines");
    lines.innerHTML = q.lines.map(function (l) {
      return '<div class="ln"><span>' + l.label + (l.qty > 1 ? " × " + l.qty : "") + '</span><span class="v">' + money(l.total) + "</span></div>";
    }).join("");
    var totalEl = document.getElementById("qTotal"), subEl = document.getElementById("qSub");
    if (bld.cycle === "annual") {
      totalEl.textContent = money(q.monthlyEquivalentCents) + "/mo equivalent";
      subEl.textContent = money(q.annualTotalCents) + " billed annually (−" + q.discountPct + "%) · usage bills monthly";
    } else {
      totalEl.textContent = money(q.monthlyCents) + "/mo";
      subEl.textContent = "billed monthly · usage in arrears";
    }

    /* tier-honesty nudge: if a higher named tier covers this config for less, say so */
    var nudge = document.getElementById("qNudge");
    nudge.hidden = true;
    for (var i = order.indexOf(bld.tier) + 1; i < 3; i++) {
      var t = order[i];
      var lim = BOOK.limits[t];
      if (bld.locations > lim.locationsMax) continue;
      var covered = bld.addons.every(function (id) {
        return order.indexOf(t) >= order.indexOf(BOOK.addons[id].includedFrom);
      });
      if (!covered) continue;
      var alt = P.computePrice({ family: bld.family, tier: t, locations: bld.locations, terminalsPerLocation: bld.terminalsPerLocation, seats: bld.seats, addons: [], connections: bld.connections }, BOOK, bld.cycle);
      var mine = bld.cycle === "annual" ? P.computePrice(bld, BOOK, bld.cycle).monthlyEquivalentCents : q.monthlyCents;
      var theirs = bld.cycle === "annual" ? alt.monthlyEquivalentCents : alt.monthlyCents;
      if (theirs < mine) {
        nudge.innerHTML = "This package costs more than <strong>" + tierLabel(t) + "</strong> (" + money(theirs) + "/mo), which includes everything you picked — and more. We&rsquo;d rather you know.";
        nudge.hidden = false;
        break;
      }
    }
  }
  var famSel = document.getElementById("bFam"), tierSel = document.getElementById("bTier"), cycSel = document.getElementById("bCycle");
  if (famSel) {
    famSel.addEventListener("change", function () { bld.family = famSel.value; renderQuote(); });
    tierSel.addEventListener("change", function () {
      bld.tier = tierSel.value;
      var lim = BOOK.limits[bld.tier];
      bld.terminalsPerLocation = lim.terminalsIncluded; bld.seats = lim.seats;
      bld.addons = bld.addons.filter(function (id) {
        var a = BOOK.addons[id];
        return order.indexOf(bld.tier) >= order.indexOf(a.availableAt) && order.indexOf(bld.tier) < order.indexOf(a.includedFrom);
      });
      renderAddons(); renderQuote();
    });
    cycSel.addEventListener("change", function () { bld.cycle = cycSel.value; renderQuote(); });
    document.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-step"), d = parseInt(b.getAttribute("data-d"), 10);
        if (k === "loc") bld.locations = Math.max(1, bld.locations + d);
        if (k === "term") bld.terminalsPerLocation = Math.max(0, bld.terminalsPerLocation + d);
        if (k === "seats") bld.seats = Math.max(0, bld.seats + d);
        if (k === "conn") bld.connections = Math.max(0, bld.connections + d);
        renderQuote();
      });
    });
  }

  renderTiers(); renderMatrix(); renderAddons();
  if (document.getElementById("qLines")) renderQuote();
})();
