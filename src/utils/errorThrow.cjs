const  errorThrow = (msg,status)=>{
let err = new Error(msg);
err.statusCode = status;
return err;
}

module.exports = errorThrow;