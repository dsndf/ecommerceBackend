const  errorThrow  = require("../utils/errorThrow.cjs");


const verifyRole = (role) => {
    return async (req,res,next) => {
            try{
        if (req.user.role !== role) {
              
                throw errorThrow('Only admin can access resources at this route',403);

        }

       next();

    }
    catch(err){
        next(err);
    }


}
}
module.exports = verifyRole;