(function () {
  function getUTMSource() {
    const params = new URLSearchParams(window.location.search);
    let source = params.get('utm_source');

    if (!source) {
      source = sessionStorage.getItem('utm_source');
    }

    if (!source) {
      const match = document.cookie.match(/(?:^|; )utm_source=([^;]*)/);
      source = match ? decodeURIComponent(match[1]) : null;
    }

    return source ? source.toLowerCase() : null;
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
      const field = form.querySelector(`[name="${config.fieldName || 'form_name'}"]`);
      if (field) {
        field.value = mappedName;
      }
    });

    console.log('[Form Name Handler]', { utmSource });
  }

  // expose globally
  window.ApplicationFormNameHandler = run;
})();