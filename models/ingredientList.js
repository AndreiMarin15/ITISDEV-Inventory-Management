const mongoose = require("mongoose");

const IngredientListSchema = new mongoose.Schema({
    ingredientListID:{
        type: String,
        required: true,
        unique: true,
    },
    categoryID: {
        type: Number,
    },
    recipeID: {
        type: String,
    },
    amount: {
        type: Number,
    },
    unitID: {
        type: Number,
        required: true,
    },
});

const  IngredientList = mongoose.model("IngredientList", IngredientListSchema);

module.exports =  IngredientList;