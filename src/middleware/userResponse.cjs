

const userResponse = (doc,token,req,res)=>{

   
    res.cookie('token',token,{
        httpOnly:true,
        expires: new Date(Date.now()+process.env.COOKIE*24*60*60*1000)
    });

    res.send({
        success: true,
        user: doc,
        token
    });

}
module.exports = userResponse;