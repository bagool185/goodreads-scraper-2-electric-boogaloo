const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();

driver.get("http://goodreads.com");
driver.quit();