import mongoose from "mongoose";

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

export default mongoose.model("Unit", UnitSchema);