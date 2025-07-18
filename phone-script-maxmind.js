$(document).ready(function () {
  function isValidCountryCode(code) {
    return /^[a-z]{2}$/.test(code);
  }

  let countryCodePromise = null;

  function fetchCountryCode() {
    if (countryCodePromise) return countryCodePromise;

    const cacheKey = "userCountryInfo";
    const now = Date.now();

    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    } catch (e) {
      console.warn("Invalid localStorage cache. Clearing.");
      localStorage.removeItem(cacheKey);
    }

    if (
      cached &&
      now - cached.timestamp < 86400000 &&
      isValidCountryCode(cached.code)
    ) {
      if ($('input[name="user_country_name"]').length && cached.name) {
        $('input[name="user_country_name"]').val(cached.name);
      }
      if (cached.ip && $('input[name="ip_address"]').length) {
        $('input[name="ip_address"]').val(cached.ip);
      }

      countryCodePromise = Promise.resolve(cached.code);
      return countryCodePromise;
    }

    const fallbackCountry = "us";

    countryCodePromise = new Promise((resolve) => {
      const saveToCache = (code, countryName, ip) => {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            code,
            name: countryName,
            ip,
            timestamp: now,
          })
        );

        if ($('input[name="user_country_name"]').length) {
          $('input[name="user_country_name"]').val(countryName);
        }
        if (ip && $('input[name="ip_address"]').length) {
          $('input[name="ip_address"]').val(ip);
        }

        resolve(code);
      };

      if (typeof geoip2 !== "undefined" && typeof geoip2.country === "function") {
        geoip2.country(
          (response) => {
            const code = response?.country?.iso_code?.toLowerCase?.() || null;
            const countryName = response?.country?.names?.en || "";
            const ip = response?.traits?.ip_address || null;

            if (isValidCountryCode(code)) {
              saveToCache(code, countryName, ip);
            } else {
              resolve(fallbackCountry);
            }
          },
          (error) => {
            console.error("GeoIP fetch failed:", error);
            resolve(fallbackCountry);
          }
        );
      } else {
        resolve(fallbackCountry);
      }
    });

    return countryCodePromise;
  }

  const phoneInputs = $('input[ms-code-phone-number]');
  fetchCountryCode(); // Trigger early

  const initializedForms = new Set();

  phoneInputs.each(function () {
    const input = this;
    const preferredCountries = $(input).attr("ms-code-phone-number").split(",");

    const iti = window.intlTelInput(input, {
      preferredCountries,
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    iti.promise.then(() => {
      fetchCountryCode().then((countryCode) => {
        if (countryCode) {
          iti.setCountry(countryCode);
        }
      });

      function formatPhoneNumber() {
        if (typeof intlTelInputUtils === "undefined") return;

        const formattedNumber = iti.getNumber(
          intlTelInputUtils.numberFormat.NATIONAL
        );
        input.value = formattedNumber;

        const countryDialCode = iti.getSelectedCountryData().dialCode;
        const fullNumber = "+" + countryDialCode + input.value.replace(/^0/, "");

        const $form = $(input).closest("form");

        const fullInput = $form.find(".full-phone-input");
        if (fullInput.length) {
          fullInput.val(fullNumber);
        }

        const hubspotField = $form.find("input[name='phone'].hs-input");
        if (hubspotField.length) {
          hubspotField.val(fullNumber).trigger("input").trigger("change");
        }
      }

      input.addEventListener("change", formatPhoneNumber);
      input.addEventListener("keyup", formatPhoneNumber);

      const form = $(input).closest("form");
      if (!initializedForms.has(form[0])) {
        initializedForms.add(form[0]);

        form.submit(function () {
          const fullNumber = iti.getNumber(
            intlTelInputUtils.numberFormat.INTERNATIONAL
          );
          input.value = fullNumber;
        });
      }
    });
  });
});
