import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    categoryID:{
        type: Number,
        required: true,
        unique: true,
    },
    categoryName: {
        type: String,
    },
    runningTotal: {
        type: Number,
    },
    unitID: {
        type: Number,
        required: true,
    },
});

export default mongoose.model("Category", CategorySchema);