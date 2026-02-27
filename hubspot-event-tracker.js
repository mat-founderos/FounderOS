
document.addEventListener("DOMContentLoaded", function() {

  const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

  /* -----------------------------
     Cookie helper
  ----------------------------- */
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  /* -----------------------------
     Get UTMs (URL → Cookie fallback)
  ----------------------------- */
  function getUTMValues() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    const utms = {};

    keys.forEach(key => {
      utms[key] = params.get(key) || getCookie(key) || null;
    });

    return utms;
  }

  const utmData = getUTMValues();

  /* -----------------------------
     Identify if email present
  ----------------------------- */
  function identifyFromURL() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (email) {
      var _hsq = window._hsq = window._hsq || [];
      _hsq.push(['identify', { email }]);
      console.log("HubSpot identified:", email);
    }

    return email;
  }

  const userEmail = identifyFromURL();

  /* -----------------------------
     MAIN REUSABLE TRACKER
  ----------------------------- */
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

        if (!canFireEvent()) {
          console.log("Event blocked:", eventName);
          return;
        }

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
        console.log("HubSpot event sent:", eventName);
      });
    });
  }

  /* -----------------------------
     EXAMPLE USAGE
  ----------------------------- */

  setupHubspotCTATracking({
    ctaClass: '.pbsp-cta',
    eventName: 'pe44306052_personal_brand_starter_pack_cta_click',
    lockKey: 'pbsp_cta_lock'
  });

  // You can reuse again like this:
  /*
  setupHubspotCTATracking({
    ctaClass: '.hero-cta',
    eventName: 'hero_cta_click',
    lockKey: 'hero_cta_lock',
    extraProperties: { section: 'hero' }
  });
  */

});