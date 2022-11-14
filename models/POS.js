import mongoose from "mongoose";

const POSSchema = new mongoose.Schema({
    POSIDno:{
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
});

export default mongoose.model("POS", POSSchema);