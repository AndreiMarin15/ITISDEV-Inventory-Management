import mongoose from "mongoose";

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
});

export default mongoose.model("Recipe", RecipeSchema);