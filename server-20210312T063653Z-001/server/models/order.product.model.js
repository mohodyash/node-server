const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const OrderProductSchema = new mongoose.Schema({

     productId :{
         type:ObjectId
     },
     userId : {
         type:ObjectId
     },
     orderQuantity : {
         type: Number
     },
     totalProductCost : {
         type : Number
     }
     
}, {timestamps:true})

const OrderProduct = mongoose.model('OrderProduct', OrderProductSchema)

module.exports = OrderProduct;