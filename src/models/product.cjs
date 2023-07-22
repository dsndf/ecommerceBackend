const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({

    name: {
        type: String,
        unique:true,
        required: [true, "Product name is required"]
    }
    ,
    description: {
        type: String,
        required: [true, "Please enter the product description"]
    }

    ,
    price: {
        type: Number,
        required: [true],
        maxLength: [8, "Price cannot exceed 8 characters"]
    },
    category: {
        type: String,
        required: [true, "Please enter the category of the price"]
    }
    ,
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }

        }


    ]
    ,
    rating: {
        type: Number,
        default: 0
    }
    ,
    stocks: {
        type: Number,
        required: [true, "Enter the number of stocks"],
        maxLength: [4, "value of stocks cannot exceed more than 4 characters"]
        , default: 1
    }
    ,
    numOfReviews: {
        type: Number,
        default: 0
    }
    ,
    reviews: [
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            }
             ,
             avatar:{
                url:{
                    type:String
                }
             } 
             ,
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            }
            ,
            comment: {
                type: String,
                required: true
            }

        }




    ]

,
    createdAt: {
    type: Date,
    default: Date.now()
}
,
user:{
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
}

});


const Products = new mongoose.model('product', ProductSchema);

module.exports = Products;