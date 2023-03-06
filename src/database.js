const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    
})
async function storeUser(discordID, goodreadsID){
    await mongoose.connect('mongodb://127.0.0.1:27017/good_database')
}