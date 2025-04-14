const mainCountries = [
  "pr", "az", "uy", "ss", "sk", "cy", "lk", "gt", "jm", "th", "nz", "bg", "lt", "no", "tw", "hk", "es", "au", "ch",
  "cr", "vn", "de", "ae", "pt", "be", "tr", "ro", "gr", "fr", "gb", "sg", "za", "hu", "lb", "ar", "ie", "cz", "se",
  "bo", "us", "sa", "bd", "ca", "mx", "dk", "br", "nl"
];

const downSellCountries = [
  "pa", "pl", "pk", "ph", "co", "jp", "it", "ng", "in", "id", "my", "ni", "ec", "hr"
];

const optionCountries = [
  "at", "ke", "fi", "ma", "eg", "il", "bb", "cl", "rs", "mk", "do", "pe", "lv", "ee", "ve", "et", "cm", "mt", "dz",
  "ug", "si", "qa", "gh", "kr", "ru", "lu", "jo", "ua", "rw", "om", "ge", "zw", "tt", "tz", "mu", "np", "mw", "kw",
  "is", "dm", "ky", "bj", "bs", "aw", "uz", "py", "na", "ad", "al", "sr", "sv", "cw", "bh", "zm", "tn", "mm", "me",
  "md", "li", "je", "hn", "gu", "cn", "kh", "bt", "vi", "ne", "mn", "mv", "mg", "kz", "iq", "ga", "sz", "ci", "bn",
  "bw", "ba", "bz", "by", "am"
];

const headerTextElement = document.getElementById('home-header');

function getCountryCode() {
  return fetch('https://ipapi.co/country_code/')
    .then(response => response.text())
    .then(code => code.toLowerCase())
    .catch(error => {
      console.error('Error fetching country:', error);
      return null;
    });
}

async function updateHeaderText() {
  const currentCode = await getCountryCode();
  console.log('Current Country Code:', currentCode);

  if (currentCode && mainCountries.includes(currentCode)) {
    document.getElementById('main').style.display = 'block';
    document.getElementById('down-sell').style.display = 'none';
    document.getElementById('option').style.display = 'none';
  } else if (currentCode && downSellCountries.includes(currentCode)) {
    document.getElementById('main').style.display = 'none';
    document.getElementById('down-sell').style.display = 'block';
    document.getElementById('option').style.display = 'none';
    headerTextElement.textContent = 'Down sell';
  } else if (currentCode && optionCountries.includes(currentCode)) {
    document.getElementById('main').style.display = 'none';
    document.getElementById('down-sell').style.display = 'none';
    document.getElementById('option').style.display = 'block';
  } else {
    document.getElementById('main').style.display = 'block';
    document.getElementById('down-sell').style.display = 'none';
    document.getElementById('option').style.display = 'none';
  }
}

updateHeaderText();
