let list = [];
let box = document.querySelector(".application")
const searchBar = document.querySelector('.search-bar')
const regionCheckbox = document.querySelectorAll(".region-checkbox");
let isRunning = false;

// Add theme switch event listener
document.querySelector(".themeswitch").addEventListener("change", () => {
        if (document.querySelector(".themeswitch").checked) {
            document.body.classList.add("dark-theme");
        } else
            document.body.classList.remove("dark-theme")
    }
)

// clear region selection
function clearselection() {
    regionCheckbox.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.classList.remove("region-checked");
    })
}

// add search event listener by pressing enter
searchBar.addEventListener('keypress', element => {
    if (element.key === 'Enter') {
        clearselection()
        isRunning = true
        render(list.filter(element => element.name.toLowerCase().includes(searchBar.value.toLowerCase()))).then()
    }
})
// add search event listener
searchBar.addEventListener('blur', () => {
    clearselection()
    render(list.filter(element => element.name.toLowerCase().includes(searchBar.value.toLowerCase()))).then()

});

// dropdown menu event listener
document.querySelector(".filter-checkbox").addEventListener("change", () => {
    if (document.querySelector(".filter-checkbox").checked) {
        document.body.classList.add("show-dropdown");
    } else {
        document.body.classList.remove("show-dropdown");
    }
})
// add event listener for each region
regionCheckbox.forEach(element => element.addEventListener("change", () => {
    if (element.checked) {
        clearselection()
        element.checked = true;
        element.parentElement.classList.add("region-checked");
        document.body.classList.remove("show-dropdown");
        searchBar.value = '';
        render(list.filter(country => {
            let countryRegion = element.parentElement.textContent;
            countryRegion === "America" ? countryRegion = "Americas" : null;
            return country.region === countryRegion ? country.region : null;
        })).then()

    } else {
        element.parentElement.classList.remove("region-checked")
        document.body.classList.remove("show-dropdown");
        render()
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
    data.forEach(element => {
        list.push(new CountryCard(element).card)
    })
}

async function render(array) {
    if(array) box.innerHTML = array.join("\n");
    else box.innerHTML = list.join("\n");
}

function saveData() {
    const elements = document.getElementsByClassName("application");
    const htmlContents = Array.from(elements).map(element => element.innerHTML).join("\n");
    localStorage.setItem('myBook', htmlContents);
}

insert().then(() => render(list))