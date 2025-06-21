// Add your blocked IPs here
  const blockedIPs = [
    "49.145.0.1613333", // Example IP
    "196.154.140.101"
  ];
function blockIfIPMatches(){"undefined"!=typeof geoip2&&"function"==typeof geoip2.city&&geoip2.city((function(e){const c=e?.traits?.ip_address;c&&blockedIPs.includes(c)&&(alert("Access denied."),document.body.innerHTML="")}),(function(e){console.warn("GeoIP fetch failed for IP block check:",e)}))}$(document).ready((function(){blockIfIPMatches()}));