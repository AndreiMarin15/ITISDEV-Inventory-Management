import mongoose from "mongoose";

const UserTypeSchema = new mongoose.Schema({
    userID:{
        type: Number,
        required: true,
        unique: true,
    },
    userTypeDesc: {
        type: String,
    },
});

export default mongoose.model("UserType", UserTypeSchema);