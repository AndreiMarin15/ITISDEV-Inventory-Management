const mongoose = require("mongoose");

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

const  Category = mongoose.model("Category", CategorySchema);

module.exports =  Category;