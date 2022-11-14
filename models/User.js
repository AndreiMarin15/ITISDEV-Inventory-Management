import mongoose from "mongoose";

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

export default mongoose.model("User", UserSchema);