
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
        input.value = formattedNumber; // Update the visible input value
        
        var countryCode = iti.getSelectedCountryData().dialCode;
        var fullNumber = "+" + countryCode + input.value.replace(/^0/, "");
      
        // Update any hidden input fields
        if ($(".full-phone-input").length) {
          $(".full-phone-input").val(fullNumber);
        }
      
        // Update HubSpot's phone field and trigger change event
        if ($("input[name='phone'].hs-input").length) {
          var hubspotField = $("input[name='phone'].hs-input");
          hubspotField.val(fullNumber); // Update the value
          hubspotField.trigger("input"); // Trigger input event for dynamic updates
          hubspotField.trigger("change"); // Trigger change event to notify HubSpot
        }
      
      }
      

      var form = $(input).closest('form');
      form.submit(function() {
        // Get the country code
        var countryCode = iti.getSelectedCountryData().dialCode;
        
        // Get the full international number
        var fullNumber = iti.getNumber(intlTelInputUtils.numberFormat.INTERNATIONAL);

        // Set the input value to the full number (including country code)
        input.value = fullNumber;
        console.log(countryCode,fullNumber)
        
        // Optionally, you can add the country code separately in another hidden field
        // Example: $(form).find('input[name="country_code"]').val(countryCode);
      });
    });
  });
