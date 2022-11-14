import mongoose from "mongoose";

const TotalInventorySchema = new mongoose.Schema({
    totalInventoryID:{
        type: Number,
        required: true,
        unique: true,
    },
    ingredientID: {
        type: Number,
    },
    categoryID: {
        type: Number,
    },
    totalAMT: {
        type: Number,
    },
});

export default mongoose.model("TotalInventory", TotalInventorySchema);