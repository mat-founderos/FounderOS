const mainCountries = ["pr", "az", "uy", "ss", "sk", "cy", "lk", "gt", "jm", "th", "nz", "bg", "lt", "no", "tw", "hk", "es", "au", "ch", "cr", "vn", "de", "ae", "pt", "be", "tr", "ro", "gr", "fr", "gb", "sg", "za", "hu", "lb", "ar", "ie", "cz", "se", "bo", "us", "sa", "bd", "ca", "mx", "dk", "br", "nl"];
const downSellCountries = ["pa", "pl", "pk", "ph", "co", "jp", "it", "ng", "in", "id", "my", "ni", "ec", "hr"];
const optionCountries = ["at", "ke", "fi", "ma", "eg", "il", "bb", "cl", "rs", "mk", "do", "pe", "lv", "ee", "ve", "et", "cm", "mt", "dz", "ug", "si", "qa", "gh", "kr", "ru", "lu", "jo", "ua", "rw", "om", "ge", "zw", "tt", "tz", "mu", "np", "mw", "kw", "is", "dm", "ky", "bj", "bs", "aw", "uz", "py", "na", "ad", "al", "sr", "sv", "cw", "bh", "zm", "tn", "mm", "me", "md", "li", "je", "hn", "gu", "cn", "kh", "bt", "vi", "ne", "mn", "mv", "mg", "kz", "iq", "ga", "sz", "ci", "bn", "bw", "ba", "bz", "by", "am"];

function isValidCountryCode(e) {
    return /^[a-z]{2}$/.test(e);
}

let cachedCountryCode = null;
let countryCodePromise = null;
async function getCountryCode() {
    if (cachedCountryCode) return cachedCountryCode;
    if (countryCodePromise) return countryCodePromise;

    countryCodePromise = (async () => {
        let e = JSON.parse(localStorage.getItem("userCountryInfo") || "null"),
            t = Date.now();
        if (e && t - e.timestamp < 864e5) return (cachedCountryCode = e.code);

        try {
            let o = await new Promise((resolve, reject) => {
                geoip2.country(
                    (res) => resolve(res.country.iso_code.toLowerCase()),
                    (err) => reject(err)
                );
            });

            if (isValidCountryCode(o)) {
                cachedCountryCode = o;
                localStorage.setItem("userCountryInfo", JSON.stringify({ code: o, timestamp: t }));
                return o;
            }
        } catch (i) {
            console.error("Error fetching country from MaxMind:", i);
        }

        return null;
    })();

    return countryCodePromise;
}



function setElementVisibility(e, t) {
    let n = document.getElementById(e);
    n && (n.style.display = t ? "block" : "none");
}
async function toggleElementByCountry(e, t) {
    let n = await getCountryCode();
    console.log("User Country Code:", n);
    let o = n?.trim().toLowerCase() || null,
        i = mainCountries.includes(o),
        r = downSellCountries.includes(o),
        a = optionCountries.includes(o);
    i || r || a ? setElementVisibility(e, ("main" === t && i) || ("down-sell" === t && r) || ("option" === t && a)) : setElementVisibility(e, "main" === t);
}
async function getPageCategory() {
    let e = await getCountryCode(),
        t = e?.toLowerCase();
    return mainCountries.includes(t) ? "Main" : downSellCountries.includes(t) ? "Down Sell" : optionCountries.includes(t) ? "Option" : "Main";
}
getPageCategory().then((e) => {
    let t = "main" === e ? "" : ` (${e.replace("-", " ").replace(/\b\w/g, (e) => e.toUpperCase())})`;
    document.title.includes(t) || (document.title += t);
});