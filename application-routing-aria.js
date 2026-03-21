/* =====================================
   Founder OS Application Routing for ARIA
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
    direct_to_closer: "https://aria.founderos.com",
    setter: "https://aria.founderos.com",
    nurture: "https://aria.founderos.com"
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

        const finalRedirect =
        paramString
        ? `${baseRedirect}${baseRedirect.includes("?") ? "&" : "?"}${paramString}`
        : baseRedirect;

        setHiddenField(form, "application_score", score);
        setHiddenField(form, "application_route", route);
        setHiddenField(form, "application_disqualifier", disqualifier);

        if (finalRedirect) {
          window.__dynamicRedirectUrl = finalRedirect;
        }

        if (debug) {
          console.log("Score:", score);
          console.log("Decision Authority:", decisionAuthority);
          console.log("Disqualifier:", disqualifier);
          console.log("Route:", route);
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

    
