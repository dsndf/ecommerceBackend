

const userResponse = (doc,token,req,res)=>{

   
    res.cookie('token',token,{
        expires: new Date(Date.now()+process.env.COOKIE*24*60*60*1000),

        httpOnly:true,
        secure:process.env.NODE_ENV==="production"?true:false,
        sameSite:process.env.NODE_ENV==="production"?"none":false,
    });

    res.send({
        success: true,
        user: doc,
        token
    });

}
module.exports = userResponse;