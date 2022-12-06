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
    foodGroupID: {
        type: Number,
    },
    runningTotal: {
        type: Number,
    },
    // unitGroupID:{
    //     type: String,
    // },
    unitID: {
        type: Number,
        required: true,
    },
});

const  Category = mongoose.model("Category", CategorySchema);

module.exports =  Category;