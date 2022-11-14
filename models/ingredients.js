import mongoose from "mongoose";

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

export default mongoose.model("Ingredients", IngredientsSchema);