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
        this.capital = capital;
        this.flag = flags.svg;
        this.card = `
            <div class="country-card">
                <img src="${this.flag}" alt="${this.name}" onclick="openCountry(this)">
                <p class="country-name">${this.name}</p>
                <p class="country-population">Population: <strong>${this.population}</strong></p>
                <p class="country-region">Region: <strong>${this.region}</strong></p>
                <p class="country-capital">Capital: <strong>${this.capital !== undefined ? this.capital.join(", ") : "none"}</strong></p>
            </div>
        `;
    }
}

async function openCountry(countryImage) {
    const country = Array.from(await fetchData()).find(element => element.name.common === countryImage.parentElement.textContent.trim().split("\n")[0])
    const scrollPosition = window.scrollY
    const population = new Intl.NumberFormat("en").format(country.population);
    const borderCountries = await fetchData().then(data => country.borders !== undefined ? country.borders.map(element => element = data.find(cont => cont.cca3 === element).name.common) : null)

    document.body.classList.add("open-country");
    const openedCountry = document.createElement("div")
    openedCountry.className = "opened-country"
    openedCountry.innerHTML = `
    <div class="return-button">
        <p>←&nbsp;Back</p>
    </div>
    <div class="card-container">
        <img src="${country.flags.svg}" alt="${country.name}" class="full-size-image">
        <div class="card-description">
            <p class="full-size-name">${country.name.common}</p>
            <div class="parameters-container">
                <div class="left-parameters">
                     Native Name: <strong>${Object.values(country.name.nativeName)[Object.values(country.name.nativeName).length - 1].common}</strong><br>
                     Population: <strong>${population}</strong><br>
                     Region: <strong>${country.region}</strong><br>
                     Sub region: <strong>${country.subregion}</strong><br>
                     Capital: <strong>${country.capital !== undefined ? country.capital.join(", ") : "none"}</strong><br>
                </div>
                <div class="right-parameters">
                     Top Level Domain: <strong>${country.tld}</strong><br>
                     Currencies: <strong>${Object.values(country.currencies)[0].name}</strong><br>
                     Languages: <strong>${Object.values(country.languages).join(", ")}</strong><br>
                </div>
            </div>
            <div class="border-countries">
                Border-countries:
                <div class="countries"></div>
            </div>
        </div>
    </div>`
    box.appendChild(openedCountry);
    const borderCountry = document.createElement("div")
    borderCountry.className = "border-country"
    borderCountries !== null ? borderCountries.forEach(element => document.querySelector(".countries").innerHTML += `<p class="border-country">${element} </p>`) : null;
    document.querySelector(".return-button").addEventListener("click", () => {
        box.removeChild(openedCountry);
        document.body.classList.remove("open-country");
        window.scrollTo(0, scrollPosition)
    });
}

themeSwitch.addEventListener("change", () => {
    localStorage.setItem("theme", themeSwitch.checked ? "dark" : "light");
    document.body.classList.toggle("dark-theme", themeSwitch.checked);
});
systemTheme.addListener(() => toggleTheme());

searchBar.addEventListener('keyup', element => {
    fetchData().then(data => render(formater(search(data))))
    saveData()
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
            return country.name.common.toLowerCase().startsWith(searchData) && country.region === countryRegion
        } else return country.name.common.toLowerCase().startsWith(searchData)
    })
}

// clear region selection
function clearselection() {
    regionCheckbox.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.classList.remove("region-checked");
    })
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

if (localStorage.getItem('region') === null && localStorage.getItem('searchInput') === null) {
    fetchData().then(data => render(formater(data)))
} else {
    regionCheckbox.forEach(element => {
        if (element.parentElement.textContent === localStorage.getItem('region')) {
            element.checked = true;
            element.parentElement.classList.toggle("region-checked");
        }
        searchBar.value = localStorage.getItem('searchInput')
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
