const mongoose = require("mongoose");

const FoodGroupSchema = new mongoose.Schema({
    foodGroupID:{
        type: Number,
        required: true,
        unique: true,
    },
    foodGroupName: {
        type: String,
    }
});

const FoodGroup = mongoose.model("FoodGroup", FoodGroupSchema);

module.exports = FoodGroup;