const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, "name should not have less than 3 characters"]
        , lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email id");
            }
        }
    }
    ,
    password: {
        type: String,
        required: true
        , unique: true,
        minlength: [8, "Password length should be Greater than equal to 8 "],
        select: false
    }
    ,

    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }
    ,
    role: {
        type: String,
        default: "user"
    }
    ,
    createdAt: {
        type: Date,
        default: new Date(Date.now())
    }
    ,
    resetPasswordToken: String,
    resetPasswordExpire: Date


})


userSchema.pre('save', async function (next) {

    if (this.isModified("password")) {
        console.log("calledd")
        this.password = await bcrypt.hash(this.password, 10);
        console.log(this.password);
    }


    next();

});
userSchema.methods.generateToken = async function () {

    const token = jwt.sign({ id: this._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.TOKEN_EXPIRY
    });
    return token;

}

// GENERATING NEW RESET PASSWORD TOKEN

userSchema.methods.generateResetPasswordToken = async function (next) {
    try {
        const token = await crypto.randomBytes(20).toString('hex');

        const resetPasswordToken = await crypto.createHash('sha256').update(token).digest('hex');

        this.resetPasswordToken = resetPasswordToken;
        this.resetPasswordExpire = new Date(Date.now() + 15 * 60 *1000);

        return token;

    }
    catch (err) {
        next(err);
    }




}



const UserCollection = new mongoose.model('User', userSchema);


module.exports = UserCollection;
