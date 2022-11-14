const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: Number,
        required: true,
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
