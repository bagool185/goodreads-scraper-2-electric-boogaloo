const { By } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();

const baseUrl = "http://goodreads.com";
const userId = "82924012-bagool";
const searchData = "THE BIBLE";


const cleanDrivers = () => {
    driver.quit();
}

async function getCurrentReading (){
    driver.get(`${baseUrl}/review/list/${userId}?shelf=currently-reading`);

    let titles = await driver.findElements(By.className("title"))
    // console.log(await title.findElement(By.css("a")).getAttribute("title"));
    titles.splice(0, 1);
    let names = [];
    for (let title of titles){
        names.push(await title.findElement(By.css("a")).getAttribute("title"));
    }
    return names;
};

async function getTopRated () {
    driver.get(`${baseUrl}/review/list/${userId}?shelf=read&sort=rating`);

    let ratedTitles = await driver.findElements(By.className("title"));
    ratedTitles.splice(0,1);
    let ratedNames = [];
    for (let name of ratedTitles){
        ratedNames.push(await name.findElement(By.css("a")).getAttribute("title"));
    }
    ratedNames.length = 5;
    return ratedNames;
}

async function searchBook(){
    driver.get(`${baseUrl}/search?q=${searchData}`);

    let searchResults = await driver.findElements(By.className("bookTitle"));
    let searchTitles = [];
    for (let book of searchResults) {
        searchTitles.push(await book.getText());
    }
    searchTitles.length = 5;
    return searchTitles;
}

// searchBook().then( (searchTitles) => {
// console.log(searchTitles)});

// getCurrentReading().then((anything) => {
//     console.log("You are currently reading: ");
//     console.log(anything)});

// getTopRated().then((anything2) => {
//     console.log("Your top rated books are: ");
//     console.log(anything2)});

setTimeout(cleanDrivers, 10000);