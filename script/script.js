let list = [];
let box = document.getElementsByClassName("application")
let clicked = false
document.getElementsByClassName("filter")[0].addEventListener("click", (event) => {
    console.log(event.target)
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

function render() {

    list.forEach(element => box[0].innerHTML += (element.card))
}

function saveData() {
    const elements = document.getElementsByClassName("application");
    const htmlContents = Array.from(elements).map(element => element.innerHTML).join("\n");
    localStorage.setItem('myBook', htmlContents);
}

insert().then(render)