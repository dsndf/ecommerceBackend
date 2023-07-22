const Products =  require('../models/product.cjs');

let updateStocks = async (id,quantity)=>{
console.log("update stocks quantity",quantity);
const pro = await Products.findById(id);
console.log(pro);
pro.stocks = pro.stocks - quantity;
console.log(await pro.save());
}
module.exports = updateStocks;