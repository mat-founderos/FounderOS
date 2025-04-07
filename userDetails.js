document.addEventListener("DOMContentLoaded", function () {
    fetch("https://ipinfo.io/json")
        .then(response => response.json())
        .then(data => {
            console.log("User IP Address:", data.ip);
            console.log("User Country Code:", data.country);
            return Promise.all([
                Promise.resolve(data),
                fetch(`https://restcountries.com/v3.1/alpha/${data.country}`)
            ]);
        })
        .then(([data, response]) => response.json().then(countryData => ({ data, countryData })))
        .then(({ data, countryData }) => {
            const countryFullName = countryData[0]?.name?.common || "Country Not Found";
            console.log("Full Country Name:", countryFullName);

            let ipField = document.querySelector("#ip-address");
            if (ipField) {
                ipField.value = data.ip || "IP Not Found";
            }

            let countryField = document.querySelector("#country");
            if (countryField) {
                countryField.value = countryFullName;
            }

            let countrySelector = document.querySelector("#country-selector");
            if (countrySelector) {
                let options = Array.from(countrySelector.options);
                let matchedOption = options.find(
                    opt => opt.text.trim().toLowerCase() === countryFullName.trim().toLowerCase()
                );
                if (matchedOption) {
                    countrySelector.value = matchedOption.value;
                }
            }
        })
        .catch(error => console.error("Error fetching IP or country name:", error));
});
