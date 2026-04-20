/* ========================================
   Founder OS Application Routing
   Score-based only. UTMs are attribution,
   not routing. One path: qualified or nurture.
   ======================================== */

(function () {

  var QUALIFIED_THRESHOLD = 11;

  var HARD_DISQUALIFIERS = [
    "pre_revenue",
    "procurement_required"
  ];

  var ROUTE_URLS = {
    qualified: "/book-now?route=qualified",
    nurture: "/fos-light-offer?dq=not_ready"
  };


  var PARAM_FIELDS = [
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
    var total = 0;
    form.querySelectorAll("input:checked, option:checked").forEach(function (el) {
      total += Number(el.dataset.score || 0);
    });
    return total;
  }

  function getDisqualifier(form) {
    var dq = "none";
    form.querySelectorAll("input:checked").forEach(function (el) {
      var disq = el.dataset.disqualifier;
      if (disq && HARD_DISQUALIFIERS.indexOf(disq) !== -1) {
        dq = disq;
      }
    });
    return dq;
  }

  function determineRoute(score, disqualifier) {
    if (disqualifier !== "none") {
      return "nurture";
    }
    if (score >= QUALIFIED_THRESHOLD) {
      return "qualified";
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
    var params = new URLSearchParams();
    PARAM_FIELDS.forEach(function (field) {
      var el = form.querySelector("#" + field + ", [name=\"" + field + "\"]");
      if (el && el.value) {
        params.append(field, el.value);
      }
    });
    return params.toString();
  }

  function setHiddenField(form, name, value) {
    var field = form.querySelector("[name=\"" + name + "\"]");
    if (field) field.value = value;
  }

  window.initApplicationRouting = function (config) {
    var formSelector = config.formSelector;
    var debug = config.debug || false;

    document.querySelectorAll(formSelector).forEach(function (form) {

      function updateRouting() {
        var score = calculateScore(form);
        var disqualifier = getDisqualifier(form);
        var route = determineRoute(score, disqualifier);
        var baseRedirect = getRedirect(route, disqualifier);
        var paramString = collectParams(form);

        var finalRedirect = paramString
          ? baseRedirect + (baseRedirect.indexOf("?") !== -1 ? "&" : "?") + paramString
          : baseRedirect;

        setHiddenField(form, "application_score", score);
        setHiddenField(form, "application_route", route);
        setHiddenField(form, "application_disqualifier", disqualifier);

        if (finalRedirect) {
          window.__dynamicRedirectUrl = finalRedirect;
        }

        if (debug) {
          console.log("[FOS Routing] Score:", score, "Route:", route, "DQ:", disqualifier, "Redirect:", finalRedirect);
        }
      }

      form.querySelectorAll("input, select").forEach(function (el) {
        el.addEventListener("change", updateRouting);
      });

      updateRouting();
    });
  };

})();
