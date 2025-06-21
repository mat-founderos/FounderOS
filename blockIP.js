// Add your blocked IPs here
  const blockedIPs = [
    "49.145.0.1613333", // Example IP
    "196.154.140.101"
  ];

  function blockIfIPMatches() {
    if (typeof geoip2 !== "undefined" && typeof geoip2.city === "function") {
      geoip2.city(function (response) {
        const userIP = response?.traits?.ip_address;
        if (userIP && blockedIPs.includes(userIP)) {
          alert("Access denied.");
          document.body.innerHTML = ""; // Optional: blank out content
        }
      }, function (error) {
        console.warn("GeoIP fetch failed for IP block check:", error);
      });
    }
  }

  $(document).ready(function () {
    blockIfIPMatches(); // Run early
  });