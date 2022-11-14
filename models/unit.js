const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
    unitID:{
        type: Number,
        required: true,
        unique: true,
    },
    unitName: {
        type: String,
    }
});

const Unit = mongoose.model("Unit", UnitSchema);

module.exports = Unit;