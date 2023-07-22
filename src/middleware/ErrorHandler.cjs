const ErrorHandler = (err,req,res,next)=>{
console.log("custom error handling");
console.log(err.message);

if(err.name === "CastError"){
 err.message = "Product not found";
}


err.statusCode = err.statusCode||500;
 err.message =err.message||"Something went wrong";
console.log("this is error",err.message);
res.status(err.statusCode).send({
  success:false,
  message:err.message,
error_name:err.name
})


}

module.exports = ErrorHandler;