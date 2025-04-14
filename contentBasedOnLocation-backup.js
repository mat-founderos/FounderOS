const mainCountries = ["pr", "az", "uy", "ss", "sk", "cy", "lk", "gt", "jm", "th", "nz", "bg", "lt", "no", "tw", "hk", "es", "au", "ch", "cr", "vn", "de", "ae", "pt", "be", "tr", "ro", "gr", "fr", "gb", "sg", "za", "hu", "lb", "ar", "ie", "cz", "se", "bo", "us", "sa", "bd", "ca", "mx", "dk", "br", "nl"];
const downSellCountries = ["pa", "pl", "pk", "ph", "co", "jp", "it", "ng", "in", "id", "my", "ni", "ec", "hr"];
const optionCountries = ["at", "ke", "fi", "ma", "eg", "il", "bb", "cl", "rs", "mk", "do", "pe", "lv", "ee", "ve", "et", "cm", "mt", "dz", "ug", "si", "qa", "gh", "kr", "ru", "lu", "jo", "ua", "rw", "om", "ge", "zw", "tt", "tz", "mu", "np", "mw", "kw", "is", "dm", "ky", "bj", "bs", "aw", "uz", "py", "na", "ad", "al", "sr", "sv", "cw", "bh", "zm", "tn", "mm", "me", "md", "li", "je", "hn", "gu", "cn", "kh", "bt", "vi", "ne", "mn", "mv", "mg", "kz", "iq", "ga", "sz", "ci", "bn", "bw", "ba", "bz", "by", "am"];

async function getCountryCode() {
  try {
    const response = await fetch('https://ipinfo.io/country/');
    return (await response.text()).toLowerCase();
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
}
async function toggleElementByCountry(targetId, groupType) {
  const currentCode = (await getCountryCode()).trim().toLowerCase();
  console.log('User Country Code:', currentCode);

  const isMain = mainCountries.includes(currentCode);
  const isDownSell = downSellCountries.includes(currentCode);
  const isOption = optionCountries.includes(currentCode);
  console.log(isMain);
  console.log(isDownSell);
  console.log(isOption);
  
if(isMain || isDownSell || isOption){
  if (groupType === 'main' && isMain) show();
  else if (groupType === 'down-sell' && isDownSell) show();
  else if (groupType === 'option' && isOption) show();
  else hide();
}
}

toggleElementByCountry("main", "main");
toggleElementByCountry("down-sell", "down-sell");
toggleElementByCountry("option", "option");

