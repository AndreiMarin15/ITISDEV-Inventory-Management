import mongoose from "mongoose";

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

export default mongoose.model("UnitConversion", UnitConversionSchema);