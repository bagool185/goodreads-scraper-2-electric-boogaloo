const { By } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();

const baseUrl = "http://goodreads.com";
const userId = "82924012-bagool";

driver.get(`${baseUrl}/review/list/${userId}?shelf=currently-reading`);

const cleanDrivers = () => {
    driver.quit();
}

async function getCurrentReading (){
    let titles = await driver.findElements(By.className("title"))
    // console.log(await title.findElement(By.css("a")).getAttribute("title"));
    titles.splice(0, 1);
    let names = [];
    for (let title of titles){
        names.push(await title.findElement(By.css("a")).getAttribute("title"));
    }
    return names;
};

// async function getTopRated () {
//     driver.get(`${baseUrl}/review/list/${userId}?shelf=read&sort=rating`);

//     let ratedTitles = await driver.findElements(By.className("title"))
//     ratedTitles.splice(0,1);
//     let ratedNames = [];
//     for (let name of ratedTitles){
//         ratedNames.push(await name.findElement(By.css("a")).getAttribute("title"));
//     }
//     ratedNames.length = 5;
//     // console.log(ratedNames[0]);
//     return ratedNames;
// }
getCurrentReading().then((anything) => {
    console.log("You are currently reading: ");
    console.log(anything)});

// getTopRated().then((anything2) => {
//     console.log("Your top rated books are: ");
//     console.log(anything2)});

setTimeout(cleanDrivers, 20000);