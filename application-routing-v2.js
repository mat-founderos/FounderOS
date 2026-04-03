/* =====================================
   Founder OS Application Routing v2
   With Calendly Redirect + Parameters
   + UTM आधारित Route Modifier (NEW)
===================================== */

(function () {

  const SCORE_THRESHOLDS = {
    direct: 19,
    setter: 11
  };

  const HARD_DISQUALIFIERS = [
    "pre_revenue",
    "procurement_required"
  ];

  const ROUTE_URLS = {
    direct_to_closer: "/book-now?route=closer",
    setter: "/book-now?route=setter",
    nurture: "/fos-light-offer?dq=not_ready"
  };

  const PARAM_FIELDS = [
    "email",
    "first_name",
    "last_name",
    "phone",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content"
  ];

  /* ================================
     NEW: UTM ROUTE CONFIG
  ================================= */
  const UTM_ROUTE_MAP = {
    meta: "_ads",
    //facebook: "_ads",
    //instagram: "_ads"
    // easy to extend:
    // google: "_google",
    // youtube: "_yt"
  };

  function getUTMSource() {
    const params = new URLSearchParams(window.location.search);
    let source = params.get("utm_source");

    if (!source) {
      source = sessionStorage.getItem("utm_source");
    }

    if (!source) {
      const match = document.cookie.match(/(?:^|; )utm_source=([^;]*)/);
      source = match ? decodeURIComponent(match[1]) : null;
    }

    return source ? source.toLowerCase() : null;
  }

  function calculateScore(form) {
    let total = 0;

    form.querySelectorAll("input:checked, option:checked").forEach(el => {
      total += Number(el.dataset.score || 0);
    });

    return total;
  }

  function getDecisionAuthority(form) {
    const el = form.querySelector('[name="When-it-comes-to-investing-in-your-business-growth-who-s-involved-in-making-that-decision"]:checked');
    return el ? el.value : null;
  }

  function getDisqualifier(form) {
    let dq = "none";

    form.querySelectorAll("input:checked").forEach(el => {
      const disq = el.dataset.disqualifier;
      if (HARD_DISQUALIFIERS.includes(disq)) {
        dq = disq;
      }
    });

    return dq;
  }

  function determineRoute(score, decisionAuthority, disqualifier) {

  const utmSource = getUTMSource();

  // 🔥 FORCE META TRAFFIC TO SETTER
  if (utmSource === "meta") {
    return "setter";
  }

  if (disqualifier !== "none") {
    return "nurture";
  }

  if (
    score >= SCORE_THRESHOLDS.direct &&
    decisionAuthority === "just_me"
  ) {
    return "direct_to_closer";
  }

  if (score >= SCORE_THRESHOLDS.setter) {
    return "setter";
  }

  return "nurture";
}

  function getRedirect(route, disqualifier) {

    if (disqualifier === "pre_revenue") {
      return "/fos-light-offer?dq=pre_revenue";
    }

    if (disqualifier === "procurement_required") {
      return "/fos-light-offer?dq=procurement";
    }

    return ROUTE_URLS[route] || ROUTE_URLS.nurture;
  }

  function collectParams(form) {

    const params = new URLSearchParams();

    PARAM_FIELDS.forEach(field => {
      const el = form.querySelector(`#${field}, [name="${field}"]`);
      if (el && el.value) {
        params.append(field, el.value);
      }
    });

    return params.toString();
  }

  function setHiddenField(form, name, value) {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) field.value = value;
  }

  /* ================================
     NEW: ROUTE MODIFIER VIA UTM
  ================================= */
  function adjustRouteByUTM(url) {
    if (!url) return url;

    const utmSource = getUTMSource();
    if (!utmSource) return url;

    const suffix = UTM_ROUTE_MAP[utmSource];
    if (!suffix) return url;

    const urlObj = new URL(url, window.location.origin);
    const route = urlObj.searchParams.get("route");

    if (!route) return url;

    if (route === "setter") {
      urlObj.searchParams.set("route", "setter" + suffix);
    }

    if (route === "closer") {
      urlObj.searchParams.set("route", "closer" + suffix);
    }

    return urlObj.pathname + "?" + urlObj.searchParams.toString();
  }

  window.initApplicationRouting = function ({
    formSelector,
    debug = false
  }) {

    document.querySelectorAll(formSelector).forEach(form => {

      function updateRouting() {

        const score = calculateScore(form);
        const decisionAuthority = getDecisionAuthority(form);
        const disqualifier = getDisqualifier(form);

        const route = determineRoute(
          score,
          decisionAuthority,
          disqualifier
        );

        const baseRedirect = getRedirect(route, disqualifier);
        const paramString = collectParams(form);

        let finalRedirect =
        paramString
        ? `${baseRedirect}${baseRedirect.includes("?") ? "&" : "?"}${paramString}`
        : baseRedirect;

        /* ✅ ONLY ADDITION */
        finalRedirect = adjustRouteByUTM(finalRedirect);

        setHiddenField(form, "application_score", score);
        setHiddenField(form, "application_route", route);
        setHiddenField(form, "application_disqualifier", disqualifier);

        if (finalRedirect) {
          window.__dynamicRedirectUrl = finalRedirect;
        }

        if (debug) {
          console.log("Score:", score);
          console.log("Route:", route);
          console.log("UTM Source:", getUTMSource());
          console.log("Redirect:", finalRedirect);
        }

      }

      form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("change", updateRouting);
      });

      updateRouting();

    });

  };

})();