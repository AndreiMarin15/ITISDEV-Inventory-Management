import mongoose from "mongoose";

const TransactionsSchema = new mongoose.Schema({
    transactionID:{
        type: String,
        required: true,
        unique: true,
    },
    ingredientID: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    buyDate: {
        type: Date,
    },
    expirationDate: {
        type: Date,
    },
});

export default mongoose.model("Transactions", TransactionsSchema);