const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    recipeID:{
        type: String,
        required: true,
        unique: true,
    },
    recipeName: {
        type: String,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
    menuGroupID:{
        type: Number,
    },
    price:{
        type: Number,
    },
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;