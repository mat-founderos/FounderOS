const mainCountries = ["pr", "az", "uy", "ss", "sk", "cy", "lk", "gt", "jm", "th", "nz", "bg", "lt", "no", "tw", "hk", "es", "au", "ch", "cr", "vn", "de", "ae", "pt", "be", "tr", "ro", "gr", "fr", "gb", "sg", "za", "hu", "lb", "ar", "ie", "cz", "se", "bo", "us", "sa", "bd", "ca", "mx", "dk", "br", "nl"];
const downSellCountries = ["pa", "pl", "pk", "ph", "co", "jp", "it", "ng", "in", "id", "my", "ni", "ec", "hr"];
const optionCountries = ["at", "ke", "fi", "ma", "eg", "il", "bb", "cl", "rs", "mk", "do", "pe", "lv", "ee", "ve", "et", "cm", "mt", "dz", "ug", "si", "qa", "gh", "kr", "ru", "lu", "jo", "ua", "rw", "om", "ge", "zw", "tt", "tz", "mu", "np", "mw", "kw", "is", "dm", "ky", "bj", "bs", "aw", "uz", "py", "na", "ad", "al", "sr", "sv", "cw", "bh", "zm", "tn", "mm", "me", "md", "li", "je", "hn", "gu", "cn", "kh", "bt", "vi", "ne", "mn", "mv", "mg", "kz", "iq", "ga", "sz", "ci", "bn", "bw", "ba", "bz", "by", "am"];

function isValidCountryCode(code) {
  return /^[a-z]{2}$/.test(code);
}

let cachedCountryCode = null;

async function getCountryCode() {
  if (cachedCountryCode) return cachedCountryCode;

  const cached = JSON.parse(localStorage.getItem("userCountryInfo") || "null");
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (cached && now - cached.timestamp < oneDay) {
    cachedCountryCode = cached.code;
    return cachedCountryCode;
  }

  try {
    const response = await fetch('https://ipinfo.io/country?token=5a76bf9a5f92a9');
    const country = (await response.text()).toLowerCase().trim();

    if (isValidCountryCode(country)) {
      cachedCountryCode = country;
      localStorage.setItem("userCountryInfo", JSON.stringify({
        code: country,
        timestamp: now,
      }));
      return country;
    }
  } catch (error) {
    console.error('Error fetching country:', error);
  }

  return null;
}

function setElementVisibility(targetId, shouldShow) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.style.display = shouldShow ? 'block' : 'none'; 
}

async function toggleElementByCountry(targetId, groupType) {
  const currentCode = await getCountryCode();
  console.log('User Country Code:', currentCode);

  const normalizedCode = currentCode?.trim().toLowerCase() || null;
  const isMain = mainCountries.includes(normalizedCode);
  const isDownSell = downSellCountries.includes(normalizedCode);
  const isOption = optionCountries.includes(normalizedCode);

  if (isMain || isDownSell || isOption) {
    setElementVisibility(targetId,
      (groupType === 'main' && isMain) ||
      (groupType === 'down-sell' && isDownSell) ||
      (groupType === 'option' && isOption)
    );
  } else {
    setElementVisibility(targetId, groupType === 'main');
  }
}
  
  
async function getPageCategory() {
  const currentCode = await getCountryCode();
  const normalizedCode = currentCode?.toLowerCase();

  if (mainCountries.includes(normalizedCode)) return 'Main';
  if (downSellCountries.includes(normalizedCode)) return 'Down Sell';
  if (optionCountries.includes(normalizedCode)) return 'Option';
  return 'Main'; 
}

getPageCategory().then(category => {
  const formattedCategory = category === 'main' ? '' : ` (${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())})`;
  if (!document.title.includes(formattedCategory)) {
    document.title += formattedCategory;
  }
});
 