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
    let titles = await driver.findElements(
        By.className("title"))
    // let title = titles[1];
    // console.log(await title.findElement(By.css("a")).getAttribute("title"));
    titles.splice(0, 1);
    let names = [];
    for (let title of titles){
        names.push(await title.findElement(By.css("a")).getAttribute("title"));
    }
    return names;
};

getCurrentReading().then((anything) => {console.log(anything)});

setTimeout(cleanDrivers, 5000);