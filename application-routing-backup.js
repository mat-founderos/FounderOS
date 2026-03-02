/* =====================================
   APPLICATION ROUTING ENGINE
   Version: 1.0
   Works with setupReCAPTCHAForm
===================================== */

(function () {

  function calculateScore(form) {
    let total = 0;

    const checkedInputs = form.querySelectorAll(
      "input:checked, option:checked"
    );

    checkedInputs.forEach(el => {
      const score = Number(el.dataset.score || 0);
      total += score;
    });

    return total;
  }

  function getTier(score, tiers) {
    return tiers.find(
      tier => score >= tier.min && score <= tier.max
    );
  }

  function buildRedirectResolver({ tiers, debug }) {

    return function (form) {

      try {
        const score = calculateScore(form);
        const tier = getTier(score, tiers);

        if (!tier) {
          console.warn("No tier matched. Redirecting to root.");
          return "/";
        }

        if (debug) {
          console.log("Application Score:", score);
          console.log("Matched Tier:", tier.name);
          console.log("Redirect URL:", tier.url);
        }

        return tier.url;

      } catch (err) {
        console.error("Routing error:", err);
        return "/";
      }
    };
  }

  // expose global init
  window.createApplicationRedirectResolver = function ({
    tiers = [],
    debug = false
  }) {
    return buildRedirectResolver({ tiers, debug });
  };

})();