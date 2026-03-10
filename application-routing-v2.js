/* =====================================
   Founder OS Application Routing v2
   With Calendly Redirects
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
    direct_to_closer: "https://calendly.com/d/cxqn-5hd-8fz/brand-strategy-call",
    setter: "https://calendly.com/d/cw2s-j7z-zyk/intro-call",
    nurture: "/not-a-fit?dq=not_ready"
  };

  function calculateScore(form) {
    let total = 0;

    form.querySelectorAll("input:checked, option:checked").forEach(el => {
      total += Number(el.dataset.score || 0);
    });

    return total;
  }

  function getDecisionAuthority(form) {
    const el = form.querySelector('[name="application_decision_authority"]:checked');
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
      return "/not-a-fit?dq=pre_revenue";
    }

    if (disqualifier === "procurement_required") {
      return "/not-a-fit?dq=procurement";
    }

    return ROUTE_URLS[route] || ROUTE_URLS.nurture;
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

        const redirectUrl = getRedirect(route, disqualifier);

        setHiddenField(form, "application_score", score);
        setHiddenField(form, "application_route", route);
        setHiddenField(form, "application_disqualifier", disqualifier);

        if (redirectUrl) {
          window.__dynamicRedirectUrl = redirectUrl;
        }

        if (debug) {
          console.log("Score:", score);
          console.log("Decision Authority:", decisionAuthority);
          console.log("Disqualifier:", disqualifier);
          console.log("Route:", route);
          console.log("Redirect:", redirectUrl);
        }

      }

      form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("change", updateRouting);
      });

      updateRouting();

    });

  };

})();