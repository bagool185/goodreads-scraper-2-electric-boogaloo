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
      let cover = await row.findElement(By.css("img")).getAttribute("src");
      cover = cover.replace("._SY75_","");
      let url = await row.findElement(By.css("a")).getAttribute("href");
      books.push({title, author, avgRating, cover, url});
    }
    return books;
}

async function getPopularMonth () {
  let today = new Date()
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  driver.get(`${baseUrl}/book/popular_by_date/${yyyy}/${mm}`);
  let popularBooks = await driver.findElements(By.className("BookListItem"));
  let books = [];
  for (let book of popularBooks){ 
    let title = await book.findElement(By.className("Text__title3")).getText();
    let author = await book.findElement(By.className("BookListItem__authors")).getText();
    let avgRating = await book.findElement(By.className("AverageRating__ratingValue")).getText();
    let cover = await book.findElement(By.className("ResponsiveImage")).getAttribute("src");
    let url = await book.findElement(By.className("BookCard__clickCardTarget")).getAttribute("href");
    console.log(url);
    books.push({title, author, avgRating, cover, url});
  }
  return books;

}

async function addUser () {

}

const { REST, Routes, Message, MessageComponentInteraction } = require('discord.js');
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
    await interaction.editReply({embeds : [embed]});
  }

  if (interaction.commandName === 'currently_reading') {
    await interaction.deferReply();
    userId = interaction.options.getString("user");
    let currentResults = await getCurrentReading();
    let embeds = [];
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
        embeds.push(embed);
        // const channel = client.channels.cache.find(channel => channel.name === "general")
        // channel.send({ embeds : [embed] });
    }
    await interaction.editReply({embeds});
  }

  if (interaction.commandName === 'top_rated') {
    await interaction.deferReply();
    userId = interaction.options.getString("user");
    let topRated = await getTopRated();
    let embeds = [];
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
        embeds.push(embed);   
    }
    // const channel = client.channels.cache.find(channel => channel.name === "general")
    // channel.send({embeds});
    await interaction.editReply({embeds});
  }

  if (interaction.commandName === 'popular_month') {
    await interaction.deferReply();
    let popularBooks = await getPopularMonth();
    let embeds = [];
    for (let i = 0; i < 5; i++){
      const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(popularBooks[i].title)
      .setThumbnail(popularBooks[i].cover)
      .setURL(popularBooks[i].url)
      .addFields(
        {name: "Book Author", value: popularBooks[i].author, inline: true},
        {name: "Average Rating", value: popularBooks[i].avgRating, inline : true},
      )
      embeds.push(embed);  
    }
    interaction.editReply({embeds});
  }

  if (interaction.commandName === 'add_user') {
    console.log(interaction.user.id);
  }
});


// setTimeout(cleanDrivers, 10000);