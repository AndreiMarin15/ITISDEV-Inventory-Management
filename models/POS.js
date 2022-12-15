const mongoose = require("mongoose");

const POSSchema = new mongoose.Schema({
	POSIDno: {
		type: String,
		required: true,
		unique: true,
	},
	dateOfOrder: {
		type: Date,
		default: null,
	},
	idPersonInCharge: {
		type: String,
		required: true,
	},
	totalPrice: {
		type: Number,
	},
});

const POS = mongoose.model("POS", POSSchema);

module.exports = POS;
