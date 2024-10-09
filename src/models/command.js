const mongoose = require("mongoose")
const enums = require('../utile/enums')
const { cmdStatus } = enums()

const schema = new mongoose.Schema({


}, { timestamps: true })

module.exports = mongoose.model("Command", schema)
