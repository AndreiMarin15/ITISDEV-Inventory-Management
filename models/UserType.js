const mongoose = require("mongoose");

const UserTypeSchema = new mongoose.Schema({
    userID: Number,
    userTypeDesc: String,
});

const UserType = mongoose.model("UserType", UserTypeSchema);

module.exports = UserType;
