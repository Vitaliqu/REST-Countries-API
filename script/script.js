let list = [];
let box = document.querySelector(".application")
let clicked = false
const searchBar = document.querySelector('.search-bar')
const regionCheckbox = document.querySelectorAll(".region-checkbox")
document.querySelector(".themeswitch").addEventListener("change", element => {
    if(document.querySelector(".themeswitch").checked) document.body.classList.add("dark-theme")
    else document.body.classList.remove("dark-theme")
})

function clearselection() {
    regionCheckbox.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.classList.remove("region-checked");
    })
}

searchBar.addEventListener('keypress', element => {
    if (element.key === 'Enter') {
        clearselection()
        render(list.filter(element => element.name.toLowerCase().includes(searchBar.value.toLowerCase())))
    }
})
searchBar.addEventListener('blur', () => {
    clearselection()
    render(list.filter(element => element.name.toLowerCase().includes(searchBar.value.toLowerCase())))

});
document.querySelector(".filter").addEventListener("click", (event) => {
    if (event.target.matches(".filter, .dropdown-text, .arrow")) {
        if (!clicked) {
            document.body.classList.add("show-dropdown");
            clicked = true;
        } else {
            document.body.classList.remove("show-dropdown");
            clicked = false;
        }
    }
})
regionCheckbox.forEach(element => element.addEventListener("change", () => {
    if (element.checked) {
        clearselection()
        element.checked = true;
        element.parentElement.classList.add("region-checked");
        document.body.classList.remove("show-dropdown");
        clicked = false;
        searchBar.value = '';
        render(list.filter(country => {
            let countryRegion = element.parentElement.textContent;
            countryRegion === "America" ? countryRegion = "Americas" : null;
            return country.region === countryRegion ? country.region : null;
        }))

    } else {
        element.parentElement.classList.remove("region-checked")
        document.body.classList.remove("show-dropdown");
        clicked = false
        render(list)
    }
}))

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
            <img src=${this.flag}>
            <p class="country-name">${this.name}</p>
            <p class="country-population">Population: <strong>${this.population}</strong></p>
            <p class="country-region">Region: <strong>${this.region}</strong></p>
            <p class="country-capital">Capital: <strong>${this.capital}</strong></p>
        </div>`
    }
}

async function insert() {
    const data = await fetch('https://restcountries.com/v3.1/all').then(data => data.json())
    data.forEach(element => list.push(new CountryCard(element)))
}

function render(array) {
    box.innerHTML = null
    array.forEach(element => box.innerHTML += (element.card))
}

function saveData() {
    const elements = document.getElementsByClassName("application");
    const htmlContents = Array.from(elements).map(element => element.innerHTML).join("\n");
    localStorage.setItem('myBook', htmlContents);
}

insert().then(() => render(list))