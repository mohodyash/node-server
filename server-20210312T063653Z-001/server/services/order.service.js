const Order = require("../models/order.model");
const OrderProduct = require("../models/order.product.model");
const User = require("../models/user.model");
const utils = require("../utils/index");
const Comment = require("../models/comment.model");
const { restart } = require("nodemon");

exports.placeOrder = async function (obj) {
  console.log("in side");
  if (!obj.cart) throw Error("Cart is required.");

  let cart = obj.cart;
  let orderProductList = [];
  let totalCost = 0;
  for (let i = 0; i < cart.length; i++) {
    let orderProduct = await OrderProduct.create({
      productId: cart[i].product._id,
      userId: obj.user._id,
      orderQuantity: cart[i].count,
      totalProductCost: cart[i].totalPrice,
    });
    totalCost = totalCost + cart[i].totalPrice;
    orderProductList.push(orderProduct._id);
  }
  totalCost = totalCost - 500;
  let orderNo = await utils.getUid(4, "numeric");
  let order = await Order.create({
    userId: obj.user._id,
    orderProducts: [...orderProductList],
    totalCost: totalCost,
    shippingCost: 0,
    gst: 0,
    orderNo: `OR${orderNo}`,
  });
  return order;
};

exports.doShipped = async function (obj) {
  if (!obj.comment) throw Error("Comment is required.");
  if (!obj.orderId) throw Error("Order id is require");
  if (!obj.userId) throw Error("User id is require");
  if (!obj.status) throw Error("Status is require");
  // if (!obj.location) throw Error("Location is require");

  let data = {
    comment: obj.comment,
    orderId: obj.orderId,
    userId: obj.userId,
    status: obj.status,
    // location: obj.location,
  };
  let comment = await Comment.create(data);
  let response = await module.exports.getOrderById(obj.orderId);
  if (!response) {
    throw Error("Order id is not find.");
  }
  let status = [...response.status];
  status.push(comment._id);
  await Order.updateOne(
    {
      _id: response._id,
    },
    {
      $set: { status: status },
    }
  ).exec();
};

exports.getAllOrder = async function () {
  let result = await Order.find();
  return result;
};

exports.getAllOrderByUserID = async function (userId) {
  if (!userId) throw Error("UserId is required.");
  let result = await Order.find({ userId: userId });
  return result;
};

exports.pagination = async (dataSet, page, limit) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const startIndex = (page - 1) * limit;

  const endIndex = page * limit;
  const results = {};

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (endIndex < (await dataSet.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }
  results.result = await dataSet.find().limit(limit).skip(startIndex).exec();
  return results;
};

exports.getOrderById = async function (id) {
  if (!id) throw Error("Id is required.");
  return await Order.findOne({ _id: id });
};

exports.getOrderProductByid = async function (id) {
  if (!id) throw Error("Id is required.");
  return await OrderProduct.findOne({ _id: id });
};

exports.removeOrderById = async function (id) {
  if (!id) throw Error("Id is required.");
  let order = await Order.findOne({ _id: id });
  if (!order) throw Error("Order is not available with this id ");
  let response = await Order.deleteOne({ _id: order._id });
  if (!response) throw Error("somting went worng cant not remove");
  else return "Order Remove successfully";
};

exports.getCommentByOrderId = async function (orderId) {
  if (!orderId) throw Error("order id is required");
  return Comment.find();
};
exports.getCommentById = async function (commentId) {
  if (!commentId) throw Error("Comment id is required");
  return Comment.findOne({ _id: commentId });
};
