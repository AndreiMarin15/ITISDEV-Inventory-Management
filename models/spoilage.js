import mongoose from "mongoose";

const SpoilageSchema = new mongoose.Schema({
    caseID:{
        type: String,
        required: true,
        unique: true,
    },
    ingredientID: {
        type: String,
    },
    employeeNo: {
        type: String,
    },
    amount: {
        type: Number,
    },
    caseDate: {
        type: Date,
    },
});

export default mongoose.model("Spoilage", SpoilageSchema);