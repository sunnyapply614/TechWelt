const mongoose = require("mongoose")

const schema = new mongoose.Schema({
	userId:{type:String},
	vehicle: {type:String, require:true},
	alert: {type:String, require:true, unique:true},
	time:{ type: Date, default: Date.now() }
}, { timestamps: true })

module.exports = mongoose.model("Alerts", schema)