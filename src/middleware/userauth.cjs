
const jwt = require('jsonwebtoken');

const UserCollection = require('../models/user.cjs');
const { default: errorThrow } = require('../utils/errorThrow.cjs');

const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            throw errorThrow("Please Log In",401);
        }


        const verified = jwt.verify(token, process.env.SECRET_KEY);


        req.user = await UserCollection.findById(verified.id);

        next()
    }
    catch (err) {
        next(err);
    }

}



module.exports = userAuth;
