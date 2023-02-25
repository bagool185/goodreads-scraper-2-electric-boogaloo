const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = "http://goodreads.com";
let  userId = "82924012-bagool";
let searchData = "THE BIBLE";
const { By } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { commands } = require('./commands.js');
const { EmbedBuilder } = require('discord.js');

    let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();


// const cleanDrivers = () => {
//     driver.quit();
// }

async function getCurrentReading (){
    driver.get(`${baseUrl}/review/list/${userId}?shelf=currently-reading`);

    let rows = await driver.findElements(By.className("bookalike"))
    // console.log(await title.findElement(By.css("a")).getAttribute("title"));
    // titles.splice(0, 1);
    let books = [];
    for (let row of rows){
        let title = await row.findElement(By.className("title")).getText();
        let author = await row.findElement(By.className("author")).getText();
        let avgRating = await row.findElement(By.className("avg_rating")).getText();
        let cover = await row.findElement(By.css("img")).getAttribute("src");
        cover = cover.replace("._SY75_","");
        books.push({title, author, avgRating, cover});
    }
    // console.log(books[0].title);
    return books;
};

async function getTopRated () {
    driver.get(`${baseUrl}/review/list/${userId}?shelf=read&sort=rating`);

    let ratedRows = await driver.findElements(By.className("bookalike"));
    ratedRows.length = 5;
    let books = [];
    for (let row of ratedRows) {
      let title = await row.findElement(By.className("title")).getText();
      let author = await row.findElement(By.className("author")).getText();
      let avgRating = await row.findElement(By.className("avg_rating")).getText();
      // let rating = await row.findElement(By.className("stars")).getAttribute("data-rating");
      let cover = await row.findElement(By.css("img")).getAttribute("src");
      cover = cover.replace("._SY75_","");
      books.push({title, author, avgRating, cover});
    }
    return books;
    // let ratedTitles = await driver.findElements(By.className("title"));
    // ratedTitles.splice(0,1);
    // let ratedNames = [];
    // for (let name of ratedTitles){
    //     ratedNames.push(await name.findElement(By.css("a")).getAttribute("title"));
    // }
    // ratedNames.length = 5;
    // return ratedNames;
}

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

const { REST, Routes, Message, MessageComponentInteraction } = require('discord.js');
console.log(process.env.TOKEN);

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
const { channel } = require('diagnostics_channel');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const wait = require('node:timers/promises').setTimeout;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'search') {
    await interaction.deferReply();
    searchData = interaction.options.getString("title");
    let searchResults = JSON.stringify(await searchBook());
    await interaction.editReply(searchResults);
  }

  if (interaction.commandName === 'currently_reading') {
    // await interaction.deferReply();
    userId = interaction.options.getString("user");
    let currentResults = await getCurrentReading();
    // await interaction.editReply(currentResults);
    bookNum = 0;
    for (book in currentResults) {
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Current Reading")
        .setThumbnail(currentResults[bookNum].cover)
        .addFields(
          {name: "Book Title", value: currentResults[bookNum].title, inline:true},
          {name: "Author", value: currentResults[bookNum].author, inline:true},
          {name: "Average Rating", value: currentResults[bookNum].avgRating, inline:true}
        )
        const channel = client.channels.cache.find(channel => channel.name === "general")
        channel.send({ embeds : [embed] });
        bookNum++;
      }
  }

  if (interaction.commandName === 'top_rated') {
    // await interaction.deferReply();
    userId = interaction.options.getString("user");
    let topRated = await getTopRated();
    // console.log(topRated[0].title)
    // await interaction.editReply(topRated[0].title);
    // console.log(topRated);
    bookNum = 0;
    for (book in topRated) {
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Top Rated Books!")
        .setThumbnail(topRated[bookNum].cover)
        .addFields(
          {name: "Book Title", value: topRated[bookNum].title, inline:true},
          {name: "Book Author", value: topRated[bookNum].author, inline: true},
          {name: "Average Rating", value: topRated[bookNum].avgRating, inline : true},
        )
          // await interaction.replied;
        const channel = client.channels.cache.find(channel => channel.name === "general")
        channel.send({ embeds : [embed] });
        bookNum++;
    }
  }
});

client.login(process.env.TOKEN);

// setTimeout(cleanDrivers, 10000);