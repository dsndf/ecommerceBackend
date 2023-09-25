const { Router } = require('express');
const express = require('express');
const Products = require('../models/product.cjs');
const ProductRouter = express.Router();
const userAuthentiction = require("../middleware/userauth.cjs");
const verifyRole = require('../middleware/verifyRole.cjs');
const cloudinary = require('cloudinary');
const errorThrow = require('../utils/errorThrow.cjs');
const ApiFeatures = require('../utils/ApiFeature.cjs');
ProductRouter.get('/', (req, res) => {

    res.send("HELLO");

});


ProductRouter.get('/products', async (req, res, next) => {

    try {

        let counts = await Products.countDocuments();
        let resultPerPage = 8;
        console.log(req.query);
        let o1 = new ApiFeatures(Products.find(), req.query).search().filter();
        let products = await o1.api;
       
        let availableproducts = products.length;

        o1.pagination();
        products = await o1.api.clone(); // It is used to resolve the error that query is alredy executed
        res.send({
            success: true,
            products,
            counts,
            resultPerPage,
            availableproducts

        });
    }
    catch (err) {

        next(err);
    }
})
ProductRouter.route('/product/:id').get(async (req, res, next) => {
    try {

        const { id } = req.params;
        console.log(id)
        const product = await Products.findById(id);

        if (!product) {
          throw  errorThrow("Product Not Found",404);
        }

        res.send({
            succes: true,
            product
        });



    }
    catch (err) {
        next(err);
    }


})

ProductRouter.get('/related/products/:id',async (req,res,next)=>{
 try{
    const {category} = await Products.findById(req.params.id);
   const  products =   await Products.find(
{
    $and:[{category},{_id:{$ne:req.params.id}}]
}

   ).limit(5);
   res.json({success:true,products});
 }
catch(err){
    next(err);
}

})



//  THIS IS ADMIN ROUTE "ONLY ADMIN CAN ACCESS THIS ROUTE "
ProductRouter.post('/admin/new/product', userAuthentiction, verifyRole('admin'), async (req, res, next) => {
    try {
        // console.log(req.body);
        req.body.user = req.user._id;
        const { images } = req.body;
        let imgarr = [];
        let newimages = [];


        if (typeof images === "string") {

            imgarr.push(images);

        }
        else {
            imgarr = images;
        }
        for (let i of imgarr) {
            const myCloud = await cloudinary.v2.uploader.upload(i, {
                folder: "products"
            });
            newimages.push({ public_id: myCloud.public_id, url: myCloud.secure_url });


        }
        req.body.images = newimages;
        const newProduct = await Products.create(req.body);
    
        res.status(201).send({
            success: true,
            newProduct
        })

    }
    catch (err) {
        next(err);
    }



});

//  THIS IS ADMIN ROUTE "ONLY ADMIN CAN ACCESS THIS ROUTE "

ProductRouter.put('/product/:id', userAuthentiction, verifyRole('admin'), async (req, res, next) => {
    try {
        let data = await Products.findById({ _id: req.params.id });
        if (!data) {

            throw errorThrow("Product  Not Found",404);

        }

        if (req.body.images) {
            let imgarr = [];

            if (typeof req.body.images === "string") {
                imgarr.push(req.body.images);
            }
            else {
                imgarr = req.body.images;
            }
            let images = [];
            for (let i of imgarr) {
                const mycloud = await cloudinary.v2.uploader.upload(i, {
                    folder: "products"
                });
                images.push({ public_id: mycloud.public_id, url: mycloud.secure_url });

            }

            req.body.images = images;
        }
        data = await Products.findByIdAndUpdate(req.params.id, req.body);
        res.send({
            succes: true,
            message: data
        })
    }

    catch (err) {

        next(err);
    }
});
ProductRouter.route('/review/product/:id').put(userAuthentiction, async (req, res, next) => {
    try {
        const user_id = req.user.id;

        const { comment, rating } = req.body;

        const product = await Products.findById(req.params.id);


        let isReviewed = product.reviews.find((v) => {
            return (v.user.toString() === user_id.toString());
        })
        if (isReviewed) {
            isReviewed.comment = comment;
            isReviewed.rating = rating;
            if(isReviewed.avatar.url!==req.user.avatar.url){
                isReviewed.avatar.url = req.user.avatar.url;
            }
        }
        else {
            product.reviews.push({ user: user_id, name: req.user.name, comment, rating,  avatar:{url:req.user.avatar.url}  });
        }

        product.numOfReviews = product.reviews.length;

        let sum = 0;
        product.reviews.forEach(element => {
            sum += element.rating;
        });

        product.rating = sum / product.numOfReviews;

        await product.save({ validationBeforeSave: false });

        res.send(product);

    }
    catch (err) {
        next(err);
    }


});

//  THIS IS ADMIN ROUTE "ONLY ADMIN CAN ACCESS THIS ROUTE "

ProductRouter.route('/admin/product/:id').delete(userAuthentiction, verifyRole('admin'), async (req, res, next) => {
    try {

        console.log(req.params);
        let data = await Products.findByIdAndDelete(req.params.id);
        console.log(data);
        let flag = data == null;
        if (flag) {
            throw errorThrow("Product  Not Found",404);
        }

        res.send({
            succes: true,
            message: "Product Deleted"
        })
    }

    catch (err) {
        next(err);
    }
});


ProductRouter.route('/admin/product/reviews').get(async (req, res, next) => {

    try {


        const { productId } = req.query;

        let product = await Products.findById(productId);

        if (!product) {
            throw errorThrow("Product  Not Found",404);
        }



        res.send({ reviews: product.reviews });
    }
    catch (err) {
        next(err);
    }

})

ProductRouter.route('/admin/product/review').delete(userAuthentiction, verifyRole("admin"), async (req, res, next) => {

    try {
        console.log(req.query);
        const { user, productId } = req.query;

        const product = await Products.findById(productId);
        if (!product) {
            throw errorThrow("Product Not Found", 404);
        }
        console.log(product.reviews)
        let reviews = product.reviews.filter((v) => {

            return v._id.toString() !== user.toString();

        });

        product.reviews = reviews;
        console.log(product.reviews)

        product.numOfReviews = product.reviews.length;
        let sum = 0;
        product.reviews && product.reviews.forEach(element => {
            sum += element.rating;
        });

        if (product.numOfReviews > 0) {
            product.rating = sum / product.numOfReviews;
        }
        else {
            product.rating = 0;
        }
        await product.save();

        res.json({
            success: true
        })

    }
    catch (err) {
        next(err);
    }

});

ProductRouter.route('/admin/all/products').get(userAuthentiction, verifyRole("admin"), async (req, res, next) => {
    try {
        const allpro = await Products.find();

        res.send({
            allProducts: allpro
        });
    }
    catch (err) {
        next(err);
    }
});

module.exports = ProductRouter;
