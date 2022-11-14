const mongoose = require("mongoose");

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

const Transactions = mongoose.model("Transactions", TransactionsSchema);

module.exports = Transactions;