const mongoose = require("mongoose")

const schema = new mongoose.Schema({
	fname: { type: String, require: true },
	lname: { type: String, require: true, unique: true },
	email: { type: String, require: true, unique: true },
	password: { type: String, require: true },
	verified: { type: Boolean, default: false },
	token: { type: String, require: false },
	role: { type: String, default: "Client" },
	phone: { type: String, default: "" },
	country: { type: String, default: "" },
	address: { type: String, default: "" },
	company: { type: String, default: "" },
	image: { type: String, default: "" },
	status: { type: Boolean, default: false },
}, { timestamps: true })
//role : admin, manager, client
module.exports = mongoose.model("Users", schema)