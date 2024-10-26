const mongoose = require("mongoose")

const schema = new mongoose.Schema({

}, { timestamps: true })
//role : admin, manager, client
module.exports = mongoose.model("Users", schema)
