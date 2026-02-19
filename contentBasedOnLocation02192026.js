/* =========================
   COUNTRY BUCKETS
========================= */

const curatedCountries = [
  "us","de","au","ca","gb","ae","pt","es","in","ch","be","br","hr"
];

const hybridCountries = [
  "sg","fr","bg","nl","za","mx","si","nz","id","pl","cr","my",
  "dk","ie","se","ph","no","ar"
];

const nonCuratedCountries = [
  "pk","cn","tw","ma","pa","gr","vn","ro","ke","il","co","jp","ee","hu","at","rs","gt",
  "hk","it","cz","do","lb","th","im","tr","sk","pr","ug","cy","lt","uy","bb","mz","sa",
  "ba","cl","kr","ua","bd","ec","eg","fi","lv","mt","ng","pe","qa","lk","gp","gh","jo",
  "kw","is","ad","al","jm","om","uz","mu","na","hn","ru","bj","cd","ni","lu","kz","bm",
  "li","ky","dz","et","mc","kh","zw","az","cm","tz","ve","ge","bo","sn","je","zm","gu",
  "tt","py","mk","bs","me","md","mn","am","sc","bh","rw","np","sv","aw","iq","fj","tn",
  "bz","ci","cw","gg","ye","pg","re","ga","la","so","sr","mo","kg","bw","af","mq","ly",
  "nc","gm","mw","bt","bn","by","sx"
];


/* =========================
   HELPERS
========================= */

function isValidCountryCode(code) {
  return /^[a-z]{2}$/.test(code);
}

let cachedCountryCode = null;
let countryCodePromise = null;

async function getCountryCode() {
  if (cachedCountryCode) return cachedCountryCode;
  if (countryCodePromise) return countryCodePromise;

  countryCodePromise = (async () => {
    const stored = JSON.parse(localStorage.getItem("userCountryInfo") || "null");
    const now = Date.now();

    if (stored && now - stored.timestamp < 86400000) {
      cachedCountryCode = stored.code;
      return cachedCountryCode;
    }

    try {
      const code = await new Promise((resolve, reject) => {
        geoip2.country(
          res => resolve(res.country.iso_code.toLowerCase()),
          err => reject(err)
        );
      });

      if (isValidCountryCode(code)) {
        cachedCountryCode = code;
        localStorage.setItem("userCountryInfo", JSON.stringify({
          code,
          timestamp: now
        }));
        return code;
      }
    } catch (err) {
      console.error("MaxMind error:", err);
    }

    return null;
  })();

  return countryCodePromise;
}


/* =========================
   GROUP DETECTION
========================= */

function getCountryGroup(code) {
  if (!code) return "nonCurated";

  if (curatedCountries.includes(code)) return "curated";
  if (hybridCountries.includes(code)) return "hybrid";
  if (nonCuratedCountries.includes(code)) return "nonCurated";

  return "nonCurated"; // default fallback
}


/* =========================
   ELEMENT VISIBILITY
========================= */

function setElementVisibility(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? "block" : "none";
}

async function toggleElementByCountry(elementId, groupTarget) {
  const code = await getCountryCode();
  const group = getCountryGroup(code);

  console.log("Country:", code, "Group:", group);

  setElementVisibility(elementId, group === groupTarget);
}


/* =========================
   PAGE CATEGORY LABEL
========================= */

async function getPageCategory() {
  const code = await getCountryCode();
  return getCountryGroup(code);
}

getPageCategory().then(group => {
  const label =
    group === "curated"
      ? ""
      : ` (${group.replace(/\b\w/g, l => l.toUpperCase())})`;

  if (!document.title.includes(label)) {
    document.title += label;
  }
});


/* =========================
   REDIRECT LOGIC
========================= */

async function redirectByCountryConfig(config = {}) {
  const {
    curated = null,
    hybrid = null,
    nonCurated = null
  } = config;

  const code = await getCountryCode();
  const group = getCountryGroup(code);

  // 👉 check hybrid bypass
  const params = new URLSearchParams(window.location.search);
  const hasHybridParam = params.get("hybrid") === "1";

  // If hybrid AND bypass present → treat as curated (no redirect)
  if (group === "hybrid" && hasHybridParam) {
    return;
  }

  const redirectMap = {
    curated,
    hybrid,
    nonCurated
  };

  const redirectUrl = redirectMap[group];

  if (redirectUrl) {
    window.location.replace(redirectUrl);
  }
}

