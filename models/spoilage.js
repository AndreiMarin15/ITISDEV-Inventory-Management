const mongoose = require("mongoose");

const SpoilageSchema = new mongoose.Schema({
    caseID:{
        type: String,
        required: true,
        unique: true,
    },
    ingredientID: {
        type: String,
    },
    employeeNo: {
        type: String,
    },
    amount: {
        type: Number,
    },
    caseDate: {
        type: Date,
    },
});

const Spoilage = mongoose.model("Spoilage", SpoilageSchema);

module.exports = Spoilage;