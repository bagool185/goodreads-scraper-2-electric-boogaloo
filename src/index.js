const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();

const baseUrl = "http://goodreads.com";
const userId = "82924012-bagool";

driver.get(`${baseUrl}/user/show/${userId}`);

const cleanDrivers = () => {
    driver.quit();
}

setTimeout(cleanDrivers, 5000);
