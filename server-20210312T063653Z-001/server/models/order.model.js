const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
    },
    orderProducts: {
      type: [ObjectId],
    },
    totalCost: Number,
    shippingCost: Number,
    gst: Number,
    orderNo: String,
    status: {
      type: [],
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
