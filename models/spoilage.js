const mongoose = require("mongoose");

const SpoilageSchema = new mongoose.Schema({
    caseID:{
        type: String,
        required: true,
        unique: true,
    },
    categoryID: {
        type: String,
    },
    employeeNo: {
        type: String,
    },
    amount: {
        type: Number,
    },
    unitID: {
        type: Number,
    },
    caseDate: {
        type: Date,
    },
});

const Spoilage = mongoose.model("Spoilage", SpoilageSchema);

module.exports = Spoilage;