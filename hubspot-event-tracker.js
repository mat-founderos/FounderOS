(function() {

  const LOCK_DURATION = 5 * 60 * 1000;

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function getUTMValues() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    const utms = {};

    keys.forEach(key => {
      utms[key] = params.get(key) || getCookie(key) || null;
    });

    return utms;
  }

  function identifyFromURL() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (email) {
      var _hsq = window._hsq = window._hsq || [];
      _hsq.push(['identify', { email }]);
    }

    return email;
  }

  const utmData = getUTMValues();
  const userEmail = identifyFromURL();

  function setupHubspotCTATracking({
    ctaClass,
    eventName,
    lockKey,
    extraProperties = {}
  }) {

    const buttons = document.querySelectorAll(ctaClass);
    if (!buttons.length) return;

    function canFireEvent() {
      const lastFired = sessionStorage.getItem(lockKey);
      if (!lastFired) return true;
      return Date.now() - parseInt(lastFired, 10) > LOCK_DURATION;
    }

    function setEventLock() {
      sessionStorage.setItem(lockKey, Date.now());
    }

    buttons.forEach(btn => {
      btn.addEventListener("click", function() {

        if (!canFireEvent()) return;

        var _hsq = window._hsq = window._hsq || [];
        _hsq.push([
          'trackCustomBehavioralEvent',
          {
            name: eventName,
            properties: {
              email: userEmail,
              page_url: window.location.href,
              ...utmData,
              ...extraProperties
            }
          }
        ]);

        setEventLock();
      });
    });
  }

  // 🔥 expose globally
  window.setupHubspotCTATracking = setupHubspotCTATracking;

})();