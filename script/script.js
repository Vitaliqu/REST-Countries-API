let box = document.querySelector(".application")
const searchBar = document.querySelector('.search-bar')
const regionCheckbox = document.querySelectorAll(".region-checkbox");
const themeSwitch = document.querySelector(".themeswitch")
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

class CountryCard {
    constructor(item) {
        let {name, population, region, capital, flags} = item;
        this.name = name.common;
        this.population = new Intl.NumberFormat("en").format(population);
        this.region = region;
        this.capital = capital
        this.flag = flags.svg;
        this.card = `
        <div class="country-card">
            <img src=${this.flag} alt="${this.name}">
            <p class="country-name">${this.name}</p>
            <p class="country-population">Population: <strong>${this.population}</strong></p>
            <p class="country-region">Region: <strong>${this.region}</strong></p>
            <p class="country-capital">Capital: <strong>${this.capital !== undefined ? this.capital.join(", ") : "none"}</strong></p>
        </div>`
    }
}

themeSwitch.addEventListener("change", () => {
    localStorage.setItem("theme", themeSwitch.checked ? "dark" : "light");
    document.body.classList.toggle("dark-theme", themeSwitch.checked);
});
systemTheme.addListener(() => toggleTheme());

searchBar.addEventListener('keyup', element => {
    fetchData().then(data => render(formater(search(data))))
})

document.querySelector(".filter-checkbox").addEventListener("change", () => {
    document.body.classList.toggle("show-dropdown");
})
regionCheckbox.forEach(element => element.addEventListener("change", () => {
    if (element.checked) {
        clearselection()
        element.checked = true;
        element.parentElement.classList.toggle("region-checked");
        document.body.classList.remove("show-dropdown");
    } else {
        element.parentElement.classList.remove("region-checked")
        document.body.classList.remove("show-dropdown");
    }
    fetchData().then(data => render(formater(search(data))));
}))

async function fetchData() {
    return await fetch('https://restcountries.com/v3.1/all').then(data => data.json())
}

async function render(array) {
    if (array) box.innerHTML = array.join("\n");
    else fetchData().then(data => render(formater(data)))
    saveData()
    openCountry()
}

function formater(data) {
    return data.map(element => (new CountryCard(element).card))
}

function search(data) {
    const checkedRegion = Array.from(regionCheckbox).find(region => region.checked)
    const searchData = searchBar.value.toLowerCase()
    return data.filter(country => {
        if (checkedRegion) {
            let countryRegion = checkedRegion.parentElement.textContent
            countryRegion === "America" ? countryRegion = "Americas" : null;
            return country.name.common.toLowerCase().includes(searchData) && country.region === countryRegion
        } else return country.name.common.toLowerCase().includes(searchData)
    })
}

// clear region selection
function clearselection() {
    regionCheckbox.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.classList.remove("region-checked");
    })
}

async function openCountry() {
    for (const element of document.querySelectorAll(".country-card img")) {
        element.addEventListener("click", async () => {
            const country = await fetchData().then((data) => {
                return data.filter(
                    (country) =>
                        country.name.common ===
                        `${element.parentElement.textContent.split("\n")[2].trim()}`
                )[0]
            })
            console.log(country)
            const scrollPosition = window.scrollY
            document.body.classList.add("open-country");

            const returnButton = document.createElement("div");
            returnButton.className = "return-button";
            returnButton.innerHTML = `<p>←&nbsp;Back</p>`

            const openedCountry = document.createElement("div");
            openedCountry.className = "opened-country";

            const img = document.createElement("img");
            img.src = element.src;
            img.className = "full-size-image"

            const cardContainer = document.createElement("div");
            cardContainer.className = "card-container"

            const cardDescription = document.createElement("div")
            cardDescription.className = "card-description"
            const population = new Intl.NumberFormat("en").format(country.population);
            cardDescription.innerHTML = `
            <p class="full-size-name">${country.name.common}
            </p>
            <div class="parameters-container">
                <div class="left-parameters">
                     Native Name: <strong>${country.tld}</strong><br>
                     Population: <strong>${population}</strong><br>
                     Region: <strong>${country.region}</strong><br>
                     Sub region: <strong>${country.subregion}</strong><br>
                     Capital: <strong>${country.capital}</strong><br>
                </div>
                <div class="right-parameters">
                     Top Level Domain: <strong>${country.tld}</strong><br>
                     Currencies: <strong>${country.currencies}</strong><br>
                     Languages: <strong>${country.languages}</strong><br>
                
                </div>
            </div>
             <div>
             </div>`

            openedCountry.appendChild(returnButton);
            cardContainer.appendChild(img)
            cardContainer.appendChild(cardDescription)
            openedCountry.appendChild(cardContainer);

            box.appendChild(openedCountry);

            document.querySelector(".return-button").addEventListener("click", () => {
                box.removeChild(openedCountry);
                document.body.classList.remove("open-country");
                window.scrollTo(0, scrollPosition)
            });
        });
    }
}

function saveData() {
    let region;
    try {
        region = Array.from(regionCheckbox).find(region => region.checked).parentElement.textContent
    } catch (error) {
        region = null
    }
    localStorage.setItem('region', region);
    localStorage.setItem('searchInput', searchBar.value)
}

if (localStorage.getItem('region') === null) {
    fetchData().then(data => render(formater(data)))
} else {
    regionCheckbox.forEach(element => {
        if (element.parentElement.textContent === localStorage.getItem('region')) {
            element.checked = true;
            searchBar.value = localStorage.getItem('searchInput')

            element.parentElement.classList.toggle("region-checked");
        }

    })
    fetchData().then(data => render(formater(search(data))));
}

function toggleTheme() {
    themeSwitch.checked = systemTheme.matches;
    localStorage.setItem("theme", systemTheme.matches ? "dark" : "light");
    if (systemTheme.matches) document.body.classList.add("dark-theme")
    else document.body.classList.remove("dark-theme")
}

if (!localStorage.getItem("theme")) toggleTheme()
else {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
        themeSwitch.checked = true;
    }
}
