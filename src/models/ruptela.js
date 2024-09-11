const mongoose = require("mongoose");

const IOvalue = new mongoose.Schema({
	dataId: { type: Number, default: 0 },
	dataValue: { type: Number, default: 0 },
	dataName: { type: String, default: "" },
});

module.exports = new mongoose.Schema(
	{

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
