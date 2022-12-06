const mongoose = require("mongoose");

const MissingSchema = new mongoose.Schema({
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

const  Missing = mongoose.model("Missing", MissingSchema);

module.exports =  Missing;