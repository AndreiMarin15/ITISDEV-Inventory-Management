const mongoose = require("mongoose");

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

const TotalInventory = mongoose.model("TotalInventory", TotalInventorySchema);

module.exports = TotalInventory;