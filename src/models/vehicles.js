const mongoose = require("mongoose")

const schema = new mongoose.Schema({
	userId: { type: String, require: true },
	vehicleType: { type: String, require: true, default: "Car" },
	vehicleNo: { type: String, require: true, default: "DUX 999" },
	deviceImei: { type: String, require: true, unique: true },
	deviceType: { type: String, require: true, default: "Teltonika" },
	deviceModel: { type: String, require: true, default: "FMB000" },
	camera: { type: String, default: "" },
	mobileNo: { type: String, require: true, default: "+1 000 0000" },
	addClient: { type: String, default: "" },
	isConnected: { type: String, default: "Not Connected" },
	polygonData: {type : Array},
	limitSpeed : { type: Number, default: 100 },
	limitFuel: {type:Number, default: 10},
	limitLowTemp: {type:Number, default: 20},
	limitHighTemp: {type:Number, default: 20},
	onStop: {type:Number, default: 0},
	onMove: {type:Number, default: 1},

}, { timestamps: true })

module.exports = mongoose.model("vehicles", schema)