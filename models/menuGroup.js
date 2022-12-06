const mongoose = require("mongoose");

const MenuGroupSchema = new mongoose.Schema({
    menuGroupID:{
        type: Number,
        required: true,
        unique: true,
    },
    menuGroupName: {
        type: String,
    }
});

const MenuGroup = mongoose.model("MenuGroup", MenuGroupSchema);

module.exports = MenuGroup;