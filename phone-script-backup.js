$(document).ready(function() {
    $('input[ms-code-phone-number]').each(function() {
      var input = this;
      var preferredCountries = $(input).attr('ms-code-phone-number').split(',');

      var iti = window.intlTelInput(input, {
        preferredCountries: preferredCountries,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
      });

      $.get("https://ipinfo.io", function(response) {
        var countryCode = response.country;
        iti.setCountry(countryCode);
      }, "jsonp");

      input.addEventListener('change', formatPhoneNumber);
      input.addEventListener('keyup', formatPhoneNumber);

      function formatPhoneNumber() {
        var formattedNumber = iti.getNumber(intlTelInputUtils.numberFormat.NATIONAL);
        input.value = formattedNumber;
      }

      var form = $(input).closest('form');
      form.submit(function() {
        var formattedNumber = iti.getNumber(intlTelInputUtils.numberFormat.INTERNATIONAL);
        input.value = formattedNumber;
      });
    });
  });