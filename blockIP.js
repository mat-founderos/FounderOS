const blockedIPs = [
  "49.145.0.1612", "196.154.140.101", "196.158.199.105", "87.228.238.114",
  "36.255.185.225", "103.82.121.46", "180.252.194.133", "42.111.144.73",
  "49.179.117.207", "84.90.205.251", "85.255.233.66", "38.248.89.229", "176.56.39.212",
  "62.12.119.243", "64.31.4.149", "64.31.27.86", "185.77.217.177"
];

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

$(document).ready(function () {
  blockIfIPMatchesFromCache();
});