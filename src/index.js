const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
let database = require('./database.js');
const baseUrl = "http://goodreads.com";
const { By } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { SlashCommandBuilder, ChannelType, quote } = require('discord.js');
const { commands } = require('./commands.js');
const { EmbedBuilder } = require('discord.js');
const embedUtils = require('./embeds.js');

//Open browser window, headless allows for it to run in the background

let driver = new webdriver.Builder()
  .forBrowser('firefox')
  // .setFirefoxOptions(new firefox.Options().headless())
  .build();
driver.manage().setTimeouts({implicit:5000, pageLoad: 10000}).then()

//Get data from goodreads 

async function searchBook(searchData) {
  driver.get(`${baseUrl}/search?q=${searchData}`);

  let searchResult = await driver.findElement(By.css("tr"));
  let searchBook = [];
  let title = await searchResult.findElement(By.className("bookTitle")).getText();
  let author = await searchResult.findElement(By.className("authorName")).getText();
  let cover = await searchResult.findElement(By.css("img")).getAttribute("src");
  cover = cover.replace("._SY75_", "");
  let url = await searchResult.findElement(By.className("bookTitle")).getAttribute("href");
  searchBook.push({ title, author, cover, url });

  return searchBook;
}

async function getCurrentReading(userId) {
  driver.get(`${baseUrl}/review/list/${userId}?shelf=currently-reading`);

  let rows = await driver.findElements(By.className("bookalike"))
  let books = [];
  for (let row of rows) {
    let title = await row.findElement(By.className("title")).getText();
    let author = await row.findElement(By.className("author")).getText();
    let avgRating = await row.findElement(By.className("avg_rating")).getText();
    let cover = await row.findElement(By.css("img")).getAttribute("src");
    cover = cover.replace("._SY75_", "");
    let url = await row.findElement(By.css("a")).getAttribute("href");
    books.push({ title, author, avgRating, cover, url });
  }
  return books;
}

async function getTopRated(userID) {
  driver.get(`${baseUrl}/review/list/${userID}?shelf=read&sort=rating`);

  let ratedRows = await driver.findElements(By.className("bookalike"));
  ratedRows.length = 5;
  let books = [];
  for (let row of ratedRows) {
    let title = await row.findElement(By.className("title")).getText();
    let author = await row.findElement(By.className("author")).getText();
    let avgRating = await row.findElement(By.className("avg_rating")).getText();
    let cover = await row.findElement(By.css("img")).getAttribute("src");
    cover = cover.replace("._SY75_", "");
    let url = await row.findElement(By.css("a")).getAttribute("href");
    books.push({ title, author, avgRating, cover, url });
  }
  return books;
}

async function getPopularMonth() {
  let today = new Date()
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  driver.get(`${baseUrl}/book/popular_by_date/${yyyy}/${mm}`);
  let popularBooks = await driver.findElements(By.className("BookListItem"));
  let books = [];
  for (let book of popularBooks) {
    let title = await book.findElement(By.className("Text__title3")).getText();
    let author = await book.findElement(By.className("BookListItem__authors")).getText();
    let avgRating = await book.findElement(By.className("AverageRating__ratingValue")).getText();
    let cover = await book.findElement(By.className("ResponsiveImage")).getAttribute("src");
    let url = await book.findElement(By.className("BookCard__clickCardTarget")).getAttribute("href");
    books.push({ title, author, avgRating, cover, url });
  }
  return books;

}

async function addUser(discordID, goodreadsID) {
  let results = await database.searchUser(discordID);
  if (results == null) {
    await database.storeUser(discordID, goodreadsID);
    return true;
  } else { return false; }
}

function parseGoodreadsUserID(userID) {
  if (userID.includes("goodreads.com")) {
    let splitUser = userID.split("/");
    if (splitUser[splitUser.length - 1] == "") {
      return splitUser[splitUser.length - 2];
    } else {
      return splitUser[splitUser.length - 1]
    }
  } else {
    return userID;
  }

};

async function validifyUserID(userID) {
  await driver.get(`${baseUrl}/user/show/${userID}`);
  let mainContent = await driver.findElement(By.css(".leftContainer  .gr-button")).getText();
  console.log(mainContent);
  return !mainContent.includes("Back to the Goodreads homepage")
}

async function randomQuote() {
  await driver.get(`${baseUrl}/quotes?page=${Math.floor(Math.random() * 100) + 1}`);
  let quotes = await driver.findElements(By.className("quote"));
  let number = Math.floor(Math.random() * quotes.length);
  let text = await quotes[number].findElement(By.className("quoteText")).getText();
  let image = await quotes[number].findElement(By.css("img")).getAttribute("src");
  let quote = {text, image};
  console.log(quote);
  return quote;
}

async function getProfile(userID){
  await driver.get(`${baseUrl}/user/show/${userID}`);
  let profileData = await driver.findElement(By.className("mainContentFloat"));
  let profile = {}
  profile["profilePicture"] = await profileData.findElement(By.className("profilePictureIcon")).getAttribute("src");
  profile["name"] = await profileData.findElement(By.className("userProfileName")).getText();
  let temp = await profileData.findElements(By.className("userShowPageShelfListItem"));
  profile["shelves"] = await Promise.all(temp.map(element => element.getText()));
  return profile;
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
    let searchResults = await searchBook(interaction.options.getString("title"));
    let embed = embedUtils.createEmbed(searchResults[0], { name: "Author", value: searchResults[0].author, inline: true });
    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'currently_reading') {
    await interaction.deferReply();
    let userID = "";
    if (interaction.options.getString("user") != null) {
      userID = parseGoodreadsUserID(interaction.options.getString("user"));
    } else {
      let searchResult = await database.searchUser(interaction.user.id);
      userID = searchResult['goodreadsID']
    }
    if (await validifyUserID(userID)) {
      let currentResults = await getCurrentReading(userID);
      let embeds = [];
      for (let i = 0; i < currentResults.length; i++) {
        let embed = embedUtils.createEmbed(currentResults[i], ...embedUtils.commonFields(currentResults[i]))
        embeds.push(embed);
      }
      await interaction.editReply({ embeds });
    } else {
      await interaction.editReply("Goodreads ID invalid");
    }
  }

  if (interaction.commandName === 'top_rated') {
    await interaction.deferReply();
    let userID = "";
    if (interaction.options.getString("user") != null) {
      userID = parseGoodreadsUserID(interaction.options.getString("user"));
    } else {
      let searchResult = await database.searchUser(interaction.user.id);
      userID = searchResult['goodreadsID']
    }
    if (await validifyUserID(userID)) {
      let topRated = await getTopRated(userID);
      let embeds = [];
      for (let i = 0; i < topRated.length; i++) {
        let embed = embedUtils.createEmbed(topRated[i], ...embedUtils.commonFields(topRated[i]));
        embeds.push(embed);
      }
      await interaction.editReply({ embeds });
    } else {
      await interaction.editReply("Goodreads ID invalid");
    }
  }

  if (interaction.commandName === 'popular_month') {
    await interaction.deferReply();
    let popularBooks = await getPopularMonth();
    let embeds = [];
    for (let i = 0; i < 5; i++) {
      let embed = embedUtils.createEmbed(popularBooks[i], ...embedUtils.commonFields(popularBooks[i]))
      embeds.push(embed);
    }
    interaction.editReply({ embeds });
  }

  if (interaction.commandName === 'add_user') {
    userId = parseGoodreadsUserID(interaction.options.getString("user"));
    let querySuccesful = await addUser(interaction.user.id, userId);
    if (querySuccesful) {
      interaction.reply("User added to database")
    } else {
      interaction.reply("User not added to database :(")
    }
  }

  if (interaction.commandName === 'get_profile') {
    await interaction.deferReply();
    let userID = "";
    if (interaction.options.getString("user") != null) {
      userID = parseGoodreadsUserID(interaction.options.getString("user"));
    } else {
      let searchResult = await database.searchUser(interaction.user.id);
      userID = searchResult['goodreadsID']
    }

    if (await validifyUserID(userID)) {
      let profile = await getProfile(userID);
      let fields = [];  
      for (let i = 0; profile.shelves.length > i; i++) {
        fields.push({name: "Shelf " + (i + 1), value: profile.shelves[i], inline: true});
      }
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(profile.name)
        .setThumbnail(profile.profilePicture)
        .setURL(`${baseUrl}/user/show/${userID}`)
        .addFields(
          ...fields
        )
      await interaction.editReply({embeds: [embed]});
    } else {
      await interaction.editReply("Goodreads ID invalid");
    }
  }

  if (interaction.commandName === 'quote') {
    await interaction.deferReply();
    let quote = await randomQuote();
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Random Quote :)")
        .setThumbnail(quote.image)
        .setDescription(quote.text);
    await interaction.editReply({embeds: [embed]});
  }

  if (interaction.commandName === 'help') {
    await interaction.deferReply();
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Help")
        .setThumbnail("https://i.redd.it/9z9sqjxnz2831.jpg")
        .addFields(
        ...commands.map(command => {
          return {name: command.name, value: command.description};
        }),
        )
    await interaction.editReply({embeds: [embed]});
  }
});