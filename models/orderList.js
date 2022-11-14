const mongoose = require("mongoose");

const OrderListSchema = new mongoose.Schema({
    orderListID:{
        type: String,
        required: true,
        unique: true,
    },
    POSIDno: {
        type: String,
    },
    recipeID: {
        type: String,
    },
    quantity: {
        type: Number,
    },
});

const  OrderList = mongoose.model("OrderList", OrderListSchema);

module.exports =  OrderList;