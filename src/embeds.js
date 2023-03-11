const { EmbedBuilder } = require('discord.js');

function createEmbed(result, ...fields){
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(result.title)
      .setThumbnail(result.cover)
      .setURL(result.url)
      .addFields(
        fields
      )
    return embed;
}

function commonFields(book) {
    return [{name: "Book Author", value: book.author, inline: true}, {name: "Average Rating", value: book.avgRating, inline : true}]
} 

module.exports = {createEmbed, commonFields};