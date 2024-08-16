const express = require('express');
const paymentRouter = express.Router();
const userAuthentication = require('../middleware/userauth.cjs');
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
paymentRouter.route("/payment/process").post(userAuthentication, async (req, res, next) => {

    try {

        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount*100,
            payment_method: req.body.id,
            currency: "inr",
            description:"Red store payment using stripe",
            metadata: {
                company: "Ecommerce",
            }
            ,
            confirm: true

        });

        res.send({
            success: true,
            client_secret: myPayment.client_secret
        });

    }
    catch (err) {
        next(err);
    }



})

paymentRouter.route('/stripe/api/key').get(userAuthentication, async (req, res, next) => {
    res.send({ stripeApiKey: `${process.env.STRIPE_API_KEY}` });
});


module.exports = paymentRouter;


