/* ============================================================
   PRICE MODEL — data + one engine. Mirrors the platform repo's
   DESIGN-PRICING-PACKAGING.md (§2 primitives, §3 families,
   §4 gating matrix + limits ladder, §5 launch defaults, §6 annual
   discount & display rule) and DESIGN-PLAN-BUILDER.md.

   RULES THIS FILE ENFORCES (from the design docs):
   - ONE price model: tiers are named presets over the same
     primitives the builder uses; both price via computePrice().
   - The site renders from this data — no page hardcodes a dollar.
   - Prices are launch DEFAULTS (price-book data, not constants):
     edit here, every surface updates.
   - Annual: subscription components only, default 15% off, shown
     as monthly-equivalent + total billed (both, always). Usage is
     monthly, in arrears, never discounted, never prepaid.
   - All money integer cents.
   ============================================================ */
(function () {
  "use strict";

  var BOOK = {
    version: "launch-defaults-2026-08",
    currency: "USD",
    annualDiscountPct: 15,

    /* §5.1 base components (per month, first location included) */
    base: {
      backoffice: { starter: 7900, professional: 18900, business: 34900, enterprise: 59900 },
      fullsuite:  { starter: 12900, professional: 26900, business: 47900, enterprise: 79900 }
    },
    enterpriseIsFrom: true, // "from $X, contract"

    /* §5.2 unit components (cents/month) */
    units: {
      extraLocation:   { backoffice: 6900, fullsuite: 9900 },
      extraTerminal:   4000,               // full-suite only
      seatBlock10:     2000,               // staff seats in blocks of 10
      extraConnection: 2500                // aggregator / channel connection
    },

    /* §5.2 module add-ons: availability per the ONE gating matrix (§4.1).
       availableAt: tier where it's purchasable ($); includedFrom: tier where it's ✓. */
    addons: {
      inventory:  { label: "Inventory + procurement", price: 4900, availableAt: "starter",      includedFrom: "professional" },
      events:     { label: "Events / BEO",            price: 4900, availableAt: "starter",      includedFrom: "professional" },
      tippayouts: { label: "Tip payouts",             price: 5900, availableAt: "professional", includedFrom: "business" },
      channels:   { label: "Reservation channels",    price: 4900, availableAt: "professional", includedFrom: "business" }
    },

    /* usage overage rates (always monthly, in arrears) */
    usage: {
      emailPer1000: 150,   // $1.50 / 1,000 sends
      smsPerSegment: 2,    // $0.02 / segment
      instantPayout: 25    // $0.25 / payout
    },

    /* §4.2 limits ladder (shared by both families) */
    limits: {
      starter:      { locationsIncluded: 1, locationsMax: 1,  terminalsIncluded: 2, seats: 20,  email: 0,     sms: 250,  connections: 1 },
      professional: { locationsIncluded: 1, locationsMax: 3,  terminalsIncluded: 4, seats: 50,  email: 5000,  sms: 1000, connections: 1 },
      business:     { locationsIncluded: 3, locationsMax: 10, terminalsIncluded: 8, seats: 150, email: 25000, sms: 5000, connections: 3 },
      enterprise:   { locationsIncluded: 1, locationsMax: 99, terminalsIncluded: 0, seats: 0,   email: 0,     sms: 0,    connections: 0, custom: true }
    },

    /* §4.1 gating matrix rows for display (✓ / $ / —) */
    matrix: [
      ["Reservations, floor, waitlist, guest book, public booking", "✓","✓","✓","✓"],
      ["Scheduling, time clock, payroll exports",                   "✓","✓","✓","✓"],
      ["Team comms, tasks, checklists, logbook",                    "✓","✓","✓","✓"],
      ["Core finance (daily sales, P&L, cash, GL/QBO export)",      "✓","✓","✓","✓"],
      ["Online ordering (first-party + QR)",                        "✓","✓","✓","✓"],
      ["Inventory + procurement",                                   "$","✓","✓","✓"],
      ["Events / BEO",                                              "$","✓","✓","✓"],
      ["Email marketing",                                           "—","✓","✓","✓"],
      ["Ops boards",                                                "—","✓","✓","✓"],
      ["Tip payouts",                                               "—","$","✓","✓"],
      ["Reservation channels (Yelp / OpenTable)",                   "—","$","✓","✓"],
      ["Advanced reporting",                                        "—","—","✓","✓"],
      ["Multi-location portfolio",                                  "—","—","✓","✓"],
      ["API access + webhooks",                                     "—","—","✓","✓"],
      ["Custom roles at scale, SLA, dedicated support",             "—","—","—","✓"]
    ],
    tierNames: ["starter", "professional", "business", "enterprise"]
  };

  /* ---- the ONE engine -----------------------------------------------------
     computePrice(config, book, cycle) -> Quote
     config: { family, tier, locations, terminalsPerLocation, seats, addons: [ids] }
     Pure and deterministic. Tiers and the builder use the same shape.        */
  function computePrice(config, book, cycle) {
    book = book || BOOK;
    var f = config.family, t = config.tier;
    var lim = book.limits[t];
    var lines = [];
    var base = book.base[f][t];
    lines.push({ label: tierLabel(t) + " base (" + famLabel(f) + ")", qty: 1, unit: base, total: base });

    var locs = Math.max(1, config.locations || 1);
    var extraLoc = Math.max(0, locs - lim.locationsIncluded);
    if (extraLoc > 0) {
      var lp = book.units.extraLocation[f];
      lines.push({ label: "Extra locations", qty: extraLoc, unit: lp, total: extraLoc * lp });
    }

    if (f === "fullsuite") {
      var tpl = config.terminalsPerLocation || lim.terminalsIncluded;
      var extraTerm = Math.max(0, (tpl - lim.terminalsIncluded)) * locs;
      if (extraTerm > 0) lines.push({ label: "Extra terminals", qty: extraTerm, unit: book.units.extraTerminal, total: extraTerm * book.units.extraTerminal });
    }

    var seats = config.seats || lim.seats;
    var extraSeats = Math.max(0, seats - lim.seats);
    if (extraSeats > 0) {
      var blocks = Math.ceil(extraSeats / 10);
      lines.push({ label: "Extra staff seats (blocks of 10)", qty: blocks, unit: book.units.seatBlock10, total: blocks * book.units.seatBlock10 });
    }

    (config.addons || []).forEach(function (id) {
      var a = book.addons[id];
      if (!a) return;
      var order = book.tierNames;
      // included at or above includedFrom -> no charge; below availableAt -> not sellable
      if (order.indexOf(t) >= order.indexOf(a.includedFrom)) return;
      if (order.indexOf(t) < order.indexOf(a.availableAt)) return;
      lines.push({ label: a.label + " add-on", qty: 1, unit: a.price, total: a.price });
    });

    var connections = config.connections || 0;
    var extraConn = Math.max(0, connections - lim.connections);
    if (extraConn > 0) lines.push({ label: "Extra channel connections", qty: extraConn, unit: book.units.extraConnection, total: extraConn * book.units.extraConnection });

    var monthly = lines.reduce(function (s, l) { return s + l.total; }, 0);
    var q = { lines: lines, cycle: cycle, monthlyCents: monthly };
    if (cycle === "annual") {
      var pct = book.annualDiscountPct / 100;
      q.monthlyEquivalentCents = Math.round(monthly * (1 - pct));
      q.annualTotalCents = q.monthlyEquivalentCents * 12;
      q.discountPct = book.annualDiscountPct;
    }
    return q;
  }

  function tierLabel(t) { return { starter: "Starter", professional: "Professional", business: "Business", enterprise: "Enterprise" }[t]; }
  function famLabel(f)  { return { backoffice: "Back-office", fullsuite: "Full suite" }[f]; }
  function money(cents) { return "$" + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

  window.MISE_PRICING = { BOOK: BOOK, computePrice: computePrice, money: money, tierLabel: tierLabel, famLabel: famLabel };
})();
