const mongoose = require("mongoose");

const IOvalue = new mongoose.Schema({
	dataId: { type: Number, default: 0 },
	dataValue: { type: Number, default: 0 },
	dataName: { type: String, default: "" },
});

module.exports = new mongoose.Schema(
	{
		deviceImei: { type: String, require: true },
		deviceType: { type: String, default: "Ruptela" },
		deviceModel: { type: String },
		fw_version: { type: String, require: true },
		transferDate: { type: Date, default: Date.now() },
		lat: { type: Number, default: 0 },
		lng: { type: Number, default: 0 },
		speed: { type: Number, default: 0 },
		imsi: { type: String },
		ignition: { type: String },
		fuel: { type: String },
		movement: { type: Number },
		IOvalue: { type: [IOvalue] },
		address: {type: String},
		DoorStatus: { type: String, default: 'Closed' },
		cmdResult: { type: String },
		cmdResStr: { type: String },
		trackMode: { type: String },
		sendCommandDate:{ type: Date},
		responseCommandDate:{ type: Date},
	},
	{ timestamps: true }
);
