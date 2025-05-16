$(document).ready(function() {
  // Helper to validate country code format
  function isValidCountryCode(code) {
    return /^[a-z]{2}$/.test(code);
  }

  // Get cached country code or fetch fresh from MaxMind
  async function fetchCountryCode() {
    const cacheKey = "userCountryInfo";
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    const now = Date.now();

    if (cached && (now - cached.timestamp < 3600000) && isValidCountryCode(cached.code)) {
      return cached.code;
    }

    try {
      const countryCode = await new Promise((resolve, reject) => {
        geoip2.country(
          (response) => resolve(response.country.iso_code.toLowerCase()),
          (error) => reject(error)
        );
      });

      if (isValidCountryCode(countryCode)) {
        localStorage.setItem(cacheKey, JSON.stringify({ code: countryCode, timestamp: now }));
        return countryCode;
      }
    } catch (e) {
      console.error("Error fetching country from MaxMind:", e);
    }

    return null;
  }

  $('input[ms-code-phone-number]').each(function() {
    var input = this;
    var preferredCountries = $(input).attr('ms-code-phone-number').split(',');

    var iti = window.intlTelInput(input, {
      preferredCountries: preferredCountries,
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
    });

    // Fetch country and set it
    fetchCountryCode().then(function(countryCode) {
      if (countryCode) {
        iti.setCountry(countryCode);
      }
    });

    input.addEventListener('change', formatPhoneNumber);
    input.addEventListener('keyup', formatPhoneNumber);

    function formatPhoneNumber() {
      var formattedNumber = iti.getNumber(intlTelInputUtils.numberFormat.NATIONAL);
      input.value = formattedNumber;

      var countryDialCode = iti.getSelectedCountryData().dialCode;
      var fullNumber = "+" + countryDialCode + input.value.replace(/^0/, "");

      if ($(".full-phone-input").length) {
        $(".full-phone-input").val(fullNumber);
      }

      var hubspotField = $("input[name='phone'].hs-input");
      if (hubspotField.length) {
        hubspotField.val(fullNumber);
        hubspotField.trigger("input");
        hubspotField.trigger("change");
      }
    }

    var form = $(input).closest('form');
    form.submit(function() {
      var countryDialCode = iti.getSelectedCountryData().dialCode;
      var fullNumber = iti.getNumber(intlTelInputUtils.numberFormat.INTERNATIONAL);
      input.value = fullNumber;
      console.log(countryDialCode, fullNumber);
    });
  });
});
