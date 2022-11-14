const mongoose = require("mongoose");

const IngredientsSchema = new mongoose.Schema({
    ingredientID:{
        type: String,
        required: true,
        unique: true,
    },
    ingredientName: {
        type: String,
    },
    netWeight: {
        type: String,
    },
    unitMeasure: {
        type: String,
        required: true,
    },
    categoryID: {
        type: Number,
        required: true,
    },
});

const  Ingredients = mongoose.model("Ingredients", IngredientsSchema);

module.exports =  Ingredients;