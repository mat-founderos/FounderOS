(function () {

  window.setupHubspotCTATracking = function ({
    ctaClass,
    eventName,
    lockKey = "hs_cta_event_lock",
    lockDuration = 5 * 60 * 1000 // 5 minutes
  }) {

    if (!ctaClass || !eventName) {
      console.warn("HubSpot CTA Tracking: Missing required params");
      return;
    }

    const LOCK_KEY = lockKey;
    const LOCK_DURATION = lockDuration;

    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get("email");

    // Identify user if email exists
    if (userEmail) {
      var _hsq = (window._hsq = window._hsq || []);
      _hsq.push(["identify", { email: userEmail }]);
      console.log("HubSpot identified user:", userEmail);
    }

    function canFireEvent() {
      const lastFired = sessionStorage.getItem(LOCK_KEY);
      if (!lastFired) return true;

      const now = Date.now();
      return now - parseInt(lastFired, 10) > LOCK_DURATION;
    }

    function setEventLock() {
      sessionStorage.setItem(LOCK_KEY, Date.now());
    }

    const ctaButtons = document.querySelectorAll(ctaClass);

    if (!ctaButtons.length) {
      console.warn("HubSpot CTA Tracking: No elements found for", ctaClass);
      return;
    }

    ctaButtons.forEach(function (button) {
      button.addEventListener("click", function () {

        if (!canFireEvent()) {
          console.log("CTA event blocked (duplicate within lock window)");
          return;
        }

        var _hsq = (window._hsq = window._hsq || []);
        _hsq.push([
          "trackCustomBehavioralEvent",
          {
            name: eventName,
            properties: {
              email: userEmail,
              page_url: window.location.href
            }
          }
        ]);

        setEventLock();
        console.log("HubSpot event sent:", eventName);
      });
    });
  };

})();