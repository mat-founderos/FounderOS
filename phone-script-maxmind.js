function fetchCountryCode() {
  if (countryCodePromise) return countryCodePromise;

  const cacheKey = "userCountryInfo";
  let cached = null;
  const now = Date.now();

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
      console.log("Country Name (cached): " + cached.name);
    }
    if ($('#user_ip_address').length && cached.ip) {
      $('#user_ip_address').val(cached.ip);
    }
    countryCodePromise = Promise.resolve(cached.code);
    return countryCodePromise;
  }

  const fallbackCountry = "us";

  countryCodePromise = new Promise((resolve) => {
    if (typeof geoip2 === "undefined" || typeof geoip2.country !== "function") {
      console.warn("geoip2 not available, using fallback:", fallbackCountry);
      resolve(fallbackCountry);
      return;
    }

    geoip2.country(
      (response) => {
        const code = response?.country?.iso_code?.toLowerCase?.() || null;
        const countryName = response?.country?.names?.en || "";
        const ipAddress = response?.traits?.ip_address || "";

        if (isValidCountryCode(code)) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              code,
              name: countryName,
              ip: ipAddress,
              timestamp: now,
            })
          );

          if ($('input[name="user_country_name"]').length) {
            $('input[name="user_country_name"]').val(countryName);
            console.log("Country Name (fresh): " + countryName);
          }

          if ($('#user_ip_address').length) {
            $('#user_ip_address').val(ipAddress);
            console.log("IP Address: " + ipAddress);
          }

          resolve(code);
        } else {
          resolve(fallbackCountry);
        }
      },
      (error) => {
        console.error("GeoIP fetch failed:", error);
        resolve(fallbackCountry);
      }
    );
  });

  return countryCodePromise;
}
