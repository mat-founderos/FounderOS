/* =====================================
   LIVE SCORING → DYNAMIC REDIRECT
   Updates redirectUrl BEFORE submit
===================================== */

(function () {

  function calculateScore(form) {
    let total = 0;

    form.querySelectorAll("input:checked, option:checked").forEach(el => {
      total += Number(el.dataset.score || 0);
    });

    return total;
  }

  function getTier(score, tiers) {
    return tiers.find(t => score >= t.min && score <= t.max);
  }

  window.initApplicationRouting = function ({
    formSelector,
    tiers,
    debug = false
  }) {

    document.querySelectorAll(formSelector).forEach(form => {

      function updateRedirect() {
        const score = calculateScore(form);
        const tier = getTier(score, tiers);
        const url = tier ? tier.url : null;

        if (url) window.__dynamicRedirectUrl = url;

        if (debug) {
          console.log("Live Score:", score);
          console.log("Live Tier:", tier?.name);
          console.log("Live Redirect:", url);
        }
      }

      // 🔥 listen to any answer change
      form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("change", updateRedirect);
      });

      // run once in case prefilled
      updateRedirect();
    });

  };

})();