const errorThrow = require('../utils/errorThrow.cjs');

const express = require("express");
const sendEmail = require('../utils/sendEmail.cjs');
const userRouter = express.Router();
const userResponse = require("../middleware/userResponse.cjs");
const UserCollection = require("../models/user.cjs");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const userAuth = require('../middleware/userauth.cjs');
const verifyRole = require('../middleware/verifyRole.cjs');
const cloudinary = require('cloudinary');

const OrderCollection =  require('../models/order.cjs');
const ProductCollection =  require('../models/product.cjs');

userRouter.route("/user").get((req, res) => {
    res.send("hii from the user side");
});

userRouter.route("/user/register").post(async (req, res, next) => {
    try {
        console.log("this is", req.body);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars"
        });
        const { name, email, password } = req.body;

        const userDoc = await UserCollection.create({
            name,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
        });

        let token = await userDoc.generateToken();
        res.status(201); 
        userResponse(userDoc, token, req, res);
    } catch (err) {
        next(err);
    }
});

userRouter.route("/user/login").post(async (req, res, next) => {
    try {
        console.log("req body is", req.body);
        const { email, password } = req.body;

        const data = await UserCollection.findOne({ email }).select("+password");
        console.log(data);
        if (!data) {

            throw new errorThrow("Invalid Login",401);
        }

        console.log(data.password);

        const ismatched = await bcrypt.compare(password, data.password);
        console.log(ismatched);
        if (ismatched) {
            const token = await data.generateToken();
            console.log("this is token ", token);
            userResponse(data, token, req, res);
        } else {
            throw errorThrow("Invalid Login", 401);
        }
    } catch (err) {
        next(err);
    }
});


//FORGOT PASSWORD ROUTE

userRouter.route('/user/new_password').post(async (req, res, next) => {

    try {
        const { email } = req.body;

        let userDoc = await UserCollection.findOne({ email });
        console.log(userDoc);
        if (!userDoc) {
            throw errorThrow("User Not Found", 404);
        }

        const resetToken = await userDoc.generateResetPasswordToken(next);
        let data = await userDoc.save({ validateBeforeSave: false });
        //Creating link 
        // const resetPasswordUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
        const resetPasswordUrl = `${process.env.HOST}/password/reset/${resetToken}`;

        const message = `Your reset password token is \n\n ${resetPasswordUrl} \n\n If you didn't do this activity then Please ignore this.`

        try {
            await sendEmail({
                email: userDoc.email,
                subject: "Ecomerce Password Recovery",
                message
            });
            res.send("Email has been sent to " + email);

        }
        catch (err) {
            userDoc.resetPasswordToken = undefined;
            userDoc.resetPasswordExpire = undefined;
            await userDoc.save()
            next(err);
        }


    }
    catch (err) {

        next(err);
    }




})

//GET RESET RESET PASSWORD TOKEN
userRouter.route('/user/password/reset/:token').put(async (req, res, next) => {
    try {
        console.log(req.params);
        const { token } = req.params;

        const resetPasswordToken = await crypto.createHash('sha256').update(token).digest('hex');

        const user = await UserCollection.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: new Date(Date.now()) } })
        if (!user) {
            throw new errorThrow("Invalid reset password token or token expired",401); 
        }

        if (req.body.password !== req.body.confirmPassword) {
            throw new errorThrow("Password and Confirmed password are not matched",401);

        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const jwtToken = await user.generateToken();

        userResponse(user, jwtToken, req, res);
    }

    catch (err) {
        next(err);
    }


})


// User password update route

userRouter.route('/user/password/update').put(userAuth, async (req, res, next) => {

    try {
        console.log(req.body);

        const { oldPassword, newPassword, confirmPassword } = req.body;



        const user = await UserCollection.findById(req.user._id).select('+password');
        console.log(user);
        const ismatched = await bcrypt.compare(oldPassword, user.password);

        if (!ismatched) {
            let err = new errorThrow("Invalid password",401);
            throw err;
        }
        if (newPassword !== confirmPassword) {
        throw  new errorThrow("password not matched",401);
        
        }

        user.password = newPassword;
        await user.save();
        res.send({
            success: true,
            user

        })
    }
    catch (err) {
        next(err);

    }


});


// User profile update




// user details
userRouter.route('/my').put(userAuth, async (req, res, next) => {
    try {
        console.log("this is", req.body);
        const { name, email, avatar } = req.body;
        let obj = {};
        if (name) {
            obj.name = name;
        }
        if (email) {
            obj.email = email
        }
        if (avatar) {
            obj.avatar = avatar;
            let getCloud = await cloudinary.v2.uploader.destroy(req.user.avatar.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(obj.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale"
            });

            obj.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }



        const user = await UserCollection.findByIdAndUpdate(req.user._id, obj, {
            new: true,
            runValidators: true
        })
        res.send({
            success: true,
            user
        })

    }
    catch (err) {
        next(err);

    }


});



userRouter.route('/my').get(userAuth, async (req, res, next) => {
    try {
        const userdata = await UserCollection.findById(req.user.id);
        res.send({
            success: true,
            userdata
        })

    }
    catch (err) {
        next(err);

    }


});


// GET ALL USERS DATA --- ADMIN
userRouter.route('/admin/all/users').get(userAuth, verifyRole("admin"), async (req, res, next) => {
    try {
        const allUsersData = await UserCollection.find(); res.send({
            success: true,
            allUsersData
        })
    }

    catch (err) {
        next(err);
    }

});


//GET SINGLE USER DATA 
userRouter.route('/admin/single/user/:id').get(userAuth, verifyRole("admin"), async (req, res, next) => {
    try {

        const user = await UserCollection.findById(req.params.id);
        res.send({
            success: true,
            user
        })

    }

    catch (err) {
        next(err);
    }

});

userRouter.route('/logout').get(userAuth, async (req, res, next) => {
    try {
        console.log(req.cookies);
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production"?true:false,
            sameSite:process.env.NODE_ENV==="production"?"none":false,
        });
        res.send({
            success: true,
            message: "Logout Successfully"
        });
    }
    catch (err) {
        next(err);
    }

})

userRouter.delete('/admin/user/:id',userAuth,verifyRole("admin"),async (req,res,next)=>{

try{
const user = await UserCollection.findById(req.params.id);
console.log(user);
if(!user){
throw errorThrow("User Not Found",404);
}

else{

 await cloudinary.v2.uploader.destroy(req.user.avatar.public_id);
 await user.remove();
 res.send({
    success:true
 })
}
}
catch(err){
    next(err);
}


})
userRouter.put('/admin/user/:id',userAuth,verifyRole("admin"),async (req,res,next)=>{

try{
const user = await UserCollection.findById(req.params.id);

if(!user){
throw errorThrow("User Not Found",404);
}
else{
  await UserCollection.findByIdAndUpdate(req.params.id,req.body);
 res.send({
    success:true
 })
}
}
catch(err){
    next(err);
}


});


userRouter.route('/admin/user/:id').get(userAuth,verifyRole("admin"), async (req, res, next) => {

    try {

        const user = await UserCollection.findById(req.params.id);
        res.send({
            success: true,
            user
        })

    }
    catch (err) {
        next(err);

    }


});

userRouter.route('/admin/stats').get(userAuth,verifyRole("admin"), async (req, res, next) => {

    try {
       const users = await UserCollection.countDocuments();
       const orders = await OrderCollection.countDocuments();
        const data = await OrderCollection.aggregate(
[
 {
    $group:{
        _id:"",
        income:{
            $sum:"$totalPrice"
        }
    }
 }

]


       )

   
       const products = await ProductCollection.find();
       let outOfStock=0;
       if(products.length>0){
       for(let i of products){
        if(i.stocks === 0){
            outOfStock++;
        }
       }
       }
res.send ({
    users,
    orders,
   products:products.length,
    income:data.length?data[0].income:0,
  inStock:products.length-outOfStock,
  outOfStock

});
    }
    catch (err) {
        next(err);

    }


});



module.exports = userRouter;
