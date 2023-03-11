const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    discordID: String,
    goodreadsID: String,
});
const user = mongoose.model('User', userSchema);
mongoose.connect('mongodb://127.0.0.1:27017/good_database').then(console.log("Server connection succesful"));

async function storeUser(discordID, goodreadsID){
    const silence = new user({ discordID: discordID, goodreadsID: goodreadsID });
    await silence.save();
    console.log("User saved");
};

async function searchUser(discordID){
    let searchResults = await user.find({'discordID': discordID}).exec();
    return searchResults;
};

module.exports = {storeUser, searchUser};