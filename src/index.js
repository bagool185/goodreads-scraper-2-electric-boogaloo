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

  //Open browser window, headless allows for it to run in the background

    let driver = new webdriver.Builder()
    .forBrowser('firefox')
    // .setFirefoxOptions(new firefox.Options().headless())
    .build();

    


//Get data from goodreads 

async function searchBook(){
  driver.get(`${baseUrl}/search?q=${searchData}`);

  let searchResult = await driver.findElement(By.css("tr"));
  let searchBook = [];
  let title = await searchResult.findElement(By.className("bookTitle")).getText();
  let author = await searchResult.findElement(By.className("authorName")).getText();
  let cover = await searchResult.findElement(By.css("img")).getAttribute("src");
  cover = cover.replace("._SY75_","");
  let url = await searchResult.findElement(By.className("bookTitle")).getAttribute("href");
  searchBook.push({title, author, cover, url});

return searchBook;
}

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
        let url = await row.findElement(By.css("a")).getAttribute("href");
        books.push({title, author, avgRating, cover, url});
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
      let url = await row.findElement(By.css("a")).getAttribute("href");
      books.push({title, author, avgRating, cover, url});
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


//Create connection to discord 

const { Client, GatewayIntentBits } = require('discord.js');
const { channel } = require('diagnostics_channel');
const { url } = require('inspector');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const wait = require('node:timers/promises').setTimeout;
client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//Listen for commands and respond

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'search') {
    await interaction.deferReply();
    searchData = interaction.options.getString("title");
    let searchResults = await searchBook();
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(searchResults[0].title)
      .setThumbnail(searchResults[0].cover)
      .setURL(searchResults[0].url)
      .addFields(
      {name:"Author", value:searchResults[0].author, inline:true},
      )
      // const channel = client.channels.cache.find(channel => channel.name === "general")
      // channel.send({ embeds : [embed] });
    await interaction.editReply({
      embeds : [embed]
    });
  }

  if (interaction.commandName === 'currently_reading') {
    // await interaction.deferReply();
    userId = interaction.options.getString("user");
    let currentResults = await getCurrentReading();
    // await interaction.editReply(currentResults);
    for (let i = 0; i < currentResults.length; i++) {
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(currentResults[i].title)
        .setThumbnail(currentResults[i].cover)
        .setURL(currentResults[i].url)
        .addFields(
          {name: "Author", value: currentResults[i].author, inline:true},
          {name: "Average Rating", value: currentResults[i].avgRating, inline:true}
        )
        const channel = client.channels.cache.find(channel => channel.name === "general")
        channel.send({ embeds : [embed] });
      }
    await interaction.reply()
  }

  if (interaction.commandName === 'top_rated') {
    // await interaction.deferReply();
    userId = interaction.options.getString("user");
    let topRated = await getTopRated();
    // console.log(topRated[0].title)
    // await interaction.editReply(topRated[0].title);
    // console.log(topRated);
    for (let i = 0; i < topRated.length; i++) {
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(topRated[i].title)
        .setThumbnail(topRated[i].cover)
        .setURL(topRated[i].url)
        .addFields(
          {name: "Book Author", value: topRated[i].author, inline: true},
          {name: "Average Rating", value: topRated[i].avgRating, inline : true},
        )
          // await interaction.replied;
        const channel = client.channels.cache.find(channel => channel.name === "general")
        channel.send({ embeds : [embed] });
    }
  }
});



// setTimeout(cleanDrivers, 10000);