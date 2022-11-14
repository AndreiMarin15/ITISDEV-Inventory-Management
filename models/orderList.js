import mongoose from "mongoose";

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

export default mongoose.model("OrderList", OrderListSchema);