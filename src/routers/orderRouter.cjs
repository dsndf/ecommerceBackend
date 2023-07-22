const express = require('express');
const orderRouter = express.Router();
const orderCollection = require('../models/order.cjs');
const userAuthentication = require('../middleware/userauth.cjs')
const verifyRole = require('../middleware/verifyRole.cjs')
const ErrorHandler = require('../utils/errorThrow.cjs');
const updateStocks = require('../utils/updateStocks.cjs');
const errorThrow = require('../utils/errorThrow.cjs');
orderRouter.route('/order/new').post(userAuthentication, async (req, res, next) => {

    const { shippingInfo, orderItems, itemsPrice, taxPrice, shippingPrice, paymentInfo, paidAt, totalPrice } = req.body;

    console.log("this backend ", orderItems);
    try {

        const order = await orderCollection.create({
            shippingInfo
            , orderItems
            , itemsPrice
            , taxPrice
            , shippingPrice
            , paymentInfo
            , paidAt
            , totalPrice,
            user: req.user.id
        });

        res.send({
            success: true,
            order
        })
    }
    catch (err) {
        next(err);
    }

});

orderRouter.route('/order/:id').get(userAuthentication, async (req, res, next) => {
    try {
        console.log(req.body.id);
        const order = await orderCollection.findById(req.params.id).populate(
            "user",
            "name email");
        if (!order) {
            throw errorThrow("There is no order exits", 400);
        }

        res.send({
            success: true,
            order
        })
    }
    catch (err) {
        next(err)
    }

});


orderRouter.route('/orders/me').get(userAuthentication, async (req, res, next) => {
    try {


        const order = await orderCollection.find({ user: req.user.id });
        if (!order) {
            throw errorThrow("There is no order exits", 400);
        }

        res.send({
            success: true,
            order
        })
    }
    catch (err) {
        next(err)
    }

})


orderRouter.route('/admin/orders').get(userAuthentication, verifyRole('admin'), async (req, res, next) => {
    try {

        const orders = await orderCollection.find();
        if (!orders) {
            throw errorThrow("There are no orders", 400);
        }

        let totalPrice = 0;

        for (let i of orders) {
            totalPrice += i.itemsPrice;
        }
        res.send({
            success: true,
            orders,
            totalPrice
        });


    }
    catch (err) {
        next(err);
    }

})



orderRouter.route('/admin/order/:id').put(userAuthentication, verifyRole("admin"), async (req, res, next) => {

    try {
        console.log(req.params)
        const order = await orderCollection.findById(req.params.id);

        if (order.orderStatus === "Delivered") {
            throw errorThrow("You have been delivered this product", 400);
        }

        order.orderStatus = req.body.status;
        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
        }

        if (order.orderStatus === "Shipped") {
            order.orderItems.forEach(async (v) => {

                await updateStocks(v.product, v.quantity);
            });
        }


        await order.save();
        res.send({
            success: true,
            order
        })


    }
    catch (err) {
        next(err);
    }


})
orderRouter.route('/admin/order/:id').delete(userAuthentication, verifyRole("admin"), async (req, res, next) => {

    try {

        const order = await orderCollection.findById(req.params.id);
        if (!order) {
            throw errorThrow("You have already deleted this order", 400);
        }
        console.log(order);
        await order.remove();

        res.send({
            success: true,
            message: "Order has been  deleted succesfully"
        })


    }
    catch (err) {
        next(err);
    }


})

module.exports = orderRouter;