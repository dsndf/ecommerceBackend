const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: "India",
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
        phoneNumber: {
            type: Number,
            required: true,
        },
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User",
    },

    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            quantity:{
                type:Number,
                default:1
            }
        },
    ],

    paymentInfo: {
        id: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },

    paidAt: {
        type: Date,
       default : Date.now()
    },
    itemsPrice: {
        type: Number,
        required: true,
        default:0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default:0

    },
    taxPrice: {
        type: Number,
        required: true,
        default:0

    },
    totalPrice: {
        type: Number,
        required: true,
        default:0

    },
    orderStatus: {
        type: String,
        required: true,
        default: "Processing"
    }
    ,
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

const orderCollection = new mongoose.model("order", orderSchema);

module.exports = orderCollection;
