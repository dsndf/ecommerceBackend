const ErrorHandler = (err,req,res,next)=>{
if(err.name === "CastError"){
 err.message = "Product not found";
}

err.statusCode = err.statusCode||500;
 err.message =err.message||"Something went wrong";
res.status(err.statusCode).send({
  success:false,
  message:err.message,
error_name:err.name
})


}

module.exports = ErrorHandler;