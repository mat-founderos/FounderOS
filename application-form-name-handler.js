(function () {
  /* Read utm_source from cookie set by utmScript.js (single source of truth) */
  function getUTMSource() {
    var match = document.cookie.match(/(?:^|; )utm_source=([^;]*)/);
    return match ? decodeURIComponent(match[1]).toLowerCase() : null;
  }

  function normalizeFormName(name) {
    return 'wf-form-' + name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-'); // spaces to dash
  }

  function run(config) {
    if (!config || !config.formClass || !config.sourceMap) return;

    const forms = document.querySelectorAll(config.formClass);
    if (!forms.length) return;

    const utmSource = getUTMSource();
    if (!utmSource) return;

    const mappedName = config.sourceMap[utmSource];
    if (!mappedName) return; // do nothing if not matched

    forms.forEach(form => {
      // update Webflow attributes
      form.setAttribute('data-name', mappedName);
      form.setAttribute('aria-label', mappedName);

      // update form name safely
      form.setAttribute('name', normalizeFormName(mappedName));
    });

    // optional debug
    if (config.debug) {
      console.log('[Form Name Updated]', {
        utmSource,
        newName: mappedName
      });
    }
  }

  // expose globally
  window.ApplicationFormNameHandler = run;
})();