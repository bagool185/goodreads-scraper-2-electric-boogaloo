const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = "http://goodreads.com";
const userId = "82924012-bagool";
let searchData = "THE BIBLE";
const { By } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { SlashCommandBuilder } = require('discord.js');

    let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();


// const cleanDrivers = () => {
//     driver.quit();
// }

// async function getCurrentReading (){
//     driver.get(`${baseUrl}/review/list/${userId}?shelf=currently-reading`);

//     let titles = await driver.findElements(By.className("title"))
//     // console.log(await title.findElement(By.css("a")).getAttribute("title"));
//     titles.splice(0, 1);
//     let names = [];
//     for (let title of titles){
//         names.push(await title.findElement(By.css("a")).getAttribute("title"));
//     }
//     return names;
// };

// async function getTopRated () {
//     driver.get(`${baseUrl}/review/list/${userId}?shelf=read&sort=rating`);

//     let ratedTitles = await driver.findElements(By.className("title"));
//     ratedTitles.splice(0,1);
//     let ratedNames = [];
//     for (let name of ratedTitles){
//         ratedNames.push(await name.findElement(By.css("a")).getAttribute("title"));
//     }
//     ratedNames.length = 5;
//     return ratedNames;
// }

async function searchBook(){
    driver.get(`${baseUrl}/search?q=${searchData}`);

    let searchResults = await driver.findElements(By.className("bookTitle"));
    let searchTitles = [];
    for (let book of searchResults) {
        searchTitles.push(await book.getText());
    } 
    if (searchTitles.length > 5) {
      searchTitles.length = 5;
    }
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

const { REST, Routes, Message, MessageComponentInteraction } = require('discord.js');
console.log(process.env.TOKEN);
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'search',
    description: 'Searches for a book by title',
    options: [
      {
        "name": "title",
        "description": "Title of the book you're searching for",
        "requried": true,
        "type": 3,
      }
    ]
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const wait = require('node:timers/promises').setTimeout;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'search') {
    await interaction.deferReply();
    searchData = interaction.options.getString("title");
    let searchResults = JSON.stringify(await searchBook());
    await interaction.editReply(searchResults);
  }
});

client.login(process.env.TOKEN);

// setTimeout(cleanDrivers, 10000);