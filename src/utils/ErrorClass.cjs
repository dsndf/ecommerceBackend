class ErrorClass extends Error{

    constructor(msg,status){
     this.msg = msg;
       this.status =  status;
    
    }
geterror(){
    return new Error(this.msg);

}
}

module.exports = ErrorClass;