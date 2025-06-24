function blockIfIPMatchesFromCache() {
  const cacheKey = "userCountryInfo";
  const now = Date.now();
  let cached = null;

  try {
    cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
  } catch (e) {
    console.warn("Invalid localStorage cache. Skipping IP check.");
    return; // Exit early without clearing the cache
  }

  const isFresh = cached && (now - cached.timestamp < 86400000); // 24 hours
  const ip = cached?.ip;

  if (isFresh && ip) {
    if (blockedIPs.includes(ip)) {
      alert("Access denied.");
      document.body.innerHTML = "";
    }
  } else {
    // Fallback: request from geoip2.city once to get the IP
    if (typeof geoip2 !== "undefined" && typeof geoip2.city === "function") {
      geoip2.city(
        function (response) {
          const ip = response?.traits?.ip_address || null;
          if (ip) {
            // Update localStorage cache with IP only (preserve other values if possible)
            const updatedCache = {
              ...cached,
              ip,
              timestamp: now,
            };
            localStorage.setItem(cacheKey, JSON.stringify(updatedCache));

            if (blockedIPs.includes(ip)) {
              alert("Access denied.");
              document.body.innerHTML = "";
            }
          }
        },
        function (error) {
          console.warn("GeoIP fetch failed for IP block check:", error);
        }
      );
    }
  }
}
