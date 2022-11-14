const mongoose = require("mongoose");

const UnitConversionSchema = new mongoose.Schema({
    unitID:{
        type: Number,
        required: true,
        unique: true,
    },
    endUnit: {
        type: String,
    },
    multiplier: {
        type: Number,
    }
});

const UnitConversion = mongoose.model("UnitConversion", UnitConversionSchema);

module.exports = UnitConversion;
