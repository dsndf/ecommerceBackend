

const verifyRole = (role) => {
    return async (req,res,next) => {
            try{



        if (req.user.role !== role) {
              
                throw new Error('Only admin can access resources at this route');

        }

       next();

    }
    catch(err){
   err.statusCode = 400;
        next(err);
    }


}
}
module.exports = verifyRole;