const mongoose = require("mongoose")
const enums = require('../utile/enums')
const { cmdStatus } = enums()

const schema = new mongoose.Schema({

	deviceImei: { type: String, require: true}, 
	status: { type: String, default: cmdStatus.Queued }, 
	cmdType: { type: String, require: true },
	command: { type: String, require: true },
	response: { type: String, default: "" }
}, { timestamps: true })

module.exports = mongoose.model("Command", schema)