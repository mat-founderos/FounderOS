document.addEventListener("DOMContentLoaded", function () {
    fetch("https://ipinfo.io/json")
        .then(response => response.json())
        .then(data => {
            console.log("User IP Address:", data.ip);
            console.log("User Country Code:", data.country);
            return Promise.all([
                fetch(`https://restcountries.com/v3.1/alpha/${data.country}`).then(res => res.json()),
                fetch("https://restcountries.com/v3.1/all").then(res => res.json()),
                Promise.resolve(data.ip)
            ]);
        })
        .then(([countryData, allCountries, userIP]) => {
            const countryFullName = countryData[0]?.name?.common || "Country Not Found";
            console.log("Full Country Name:", countryFullName);

            // Set IP address value if field exists
            let ipField = document.querySelector("#ip-address");
            if (ipField) {
                ipField.value = userIP || "IP Not Found";
            }

            // Set country name value if input field exists
            let countryInput = document.querySelector("#country");
            if (countryInput) {
                countryInput.value = countryFullName;
            }

            // Populate dropdown selector
            let countrySelector = document.querySelector("#country-selector");
            if (countrySelector) {
                // Sort countries alphabetically
                allCountries.sort((a, b) => {
                    const nameA = a.name.common.toUpperCase();
                    const nameB = b.name.common.toUpperCase();
                    return nameA.localeCompare(nameB);
                });

                // Populate options
                allCountries.forEach(country => {
                    const option = document.createElement("option");
                    option.value = country.name.common;
                    option.textContent = country.name.common;
                    if (country.name.common === countryFullName) {
                        option.selected = true;
                    }
                    countrySelector.appendChild(option);
                });
            }
        })
        .catch(error => console.error("Error fetching IP or country data:", error));
});
