const { urlencoded } = require('express');
const cookieparser = require('cookie-parser');
const cloudinary = require('cloudinary');
const cors = require('cors');
const ErrorHandler = require('./middleware/ErrorHandler.cjs');
const ProductRouter = require('./routers/ProductRouter.cjs')
const userRouter = require('./routers/UserRouter.cjs');
const orderRouter = require('./routers/orderRouter.cjs')
const paymentRouter = require('./routers/paymentRouter.cjs');
const express = require('express');
const userAuth = require('./middleware/userauth.cjs');
const fileUpload = require('express-fileupload');
const bodyparser = require('body-parser');
process.on('uncaughtException', (err) => {
    console.log(`Error:${err.message}`);
    console.log("uncaught error");
    process.exit(1);

});


require('dotenv').config();
require('./db/conn.cjs');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});

const app = express();
 app.use(cors({
    origin:process.env.FRONTEND,
    credentials:true
 }));
 app.use(urlencoded({ extended: false }));
app.use(cookieparser());
app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(fileUpload());

app.use(ProductRouter);

app.use(userRouter);

app.use(orderRouter);
app.use(paymentRouter);

app.use(ErrorHandler);



const server = app.listen(process.env.PORT, () => {
    console.log("listening at port->", process.env.PORT);
    console.log("environment mode", process.env.NODE_ENV);
})

process.on("unhandledRejection", (err) => {
    console.log("this error is->" + err.message);
    server.close(() => {
        process.exit(1);
    })

});