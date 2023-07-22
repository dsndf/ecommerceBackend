
const jwt = require('jsonwebtoken');

const UserCollection = require('../models/user.cjs');

const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Please Log in");
        }


        const verified = jwt.verify(token, process.env.SECRET_KEY);


        req.user = await UserCollection.findById(verified.id);

        next()
    }
    catch (err) {

        next(err,400);


    }

}



module.exports = userAuth;
