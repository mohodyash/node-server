const OrderService = require("../services/order.service");
const UserService = require("../services/user.service");
const ProductService = require("../services/product.service");
const { compareSync } = require("bcryptjs");
exports.placeOrder = async (req, res, next) => {
  try {
    let newOrder = await OrderService.placeOrder(req.body);
    return res.status(200).json({
      message: "Order Place successfully.",
      newOrder,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.doShipped = async (req, res, next) => {
  try {
    await OrderService.doShipped(req.body);
    return res.status(200).json({
      message: "Comment Create successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllOrder = async (req, res, next) => {
  try {
    let allOrder = await OrderService.getAllOrder();
    let result = [];
    for (const order of allOrder) {
      // console.log(order);
      let orderProducts = order.orderProducts;
      let newOrderProducts = [];
      let orderProduct;
      let status = [];

      if (order.status.length > 0) {
        for (let i = 0; i < order.status.length; i++) {
          // console.log(order.status[i]);
          let comment = await OrderService.getCommentById(order.status[i]);

          status.push(comment);
        }
      }

      for (let i = 0; i < orderProducts.length; i++) {
        orderProduct = await OrderService.getOrderProductByid(orderProducts[i]);

        let product = await ProductService.getProductById(
          orderProduct.productId
        );
        product = {
          name: product[0].name,
          image: product[0].images[0],
          productId: product[0].productId,
        };
        newOrderProducts.push({
          _id: orderProduct._id,
          product: product,
          orderQuantity: orderProduct.orderQuantity,
          totalProductCost: orderProduct.totalProductCost,
        });
      }
      let user = await UserService.findById(order.userId);
      user = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
      };
      let response = {
        _id: order._id,
        totalCost: order.totalCost,
        shippingCost: order.shippingCost,
        gst: order.gst,
        orderNo: order.orderNo,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: user,
        orderProducts: [...newOrderProducts],
        status: [...status],
      };
      result.push(response);
    }
    allOrder = { ...allOrder, result: result };
    return res.status(200).json(allOrder);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.getOrderByUserId = async (req, res, next) => {
  try {
    let allOrder = await OrderService.getAllOrderByUserID(req.body.userId);
    let result = [];
    for (const order of allOrder) {
      // console.log(order);
      let orderProducts = order.orderProducts;
      let newOrderProducts = [];
      let orderProduct;
      let status = [];

      if (order.status.length > 0) {
        for (let i = 0; i < order.status.length; i++) {
          // console.log(order.status[i]);
          let comment = await OrderService.getCommentById(order.status[i]);

          status.push(comment);
        }
      }

      for (let i = 0; i < orderProducts.length; i++) {
        orderProduct = await OrderService.getOrderProductByid(orderProducts[i]);

        let product = await ProductService.getProductById(
          orderProduct.productId
        );
        product = {
          name: product[0].name,
          image: product[0].images[0],
          productId: product[0].productId,
        };
        newOrderProducts.push({
          _id: orderProduct._id,
          product: product,
          orderQuantity: orderProduct.orderQuantity,
          totalProductCost: orderProduct.totalProductCost,
        });
      }
      let user = await UserService.findById(order.userId);
      user = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
      };
      let response = {
        _id: order._id,
        totalCost: order.totalCost,
        shippingCost: order.shippingCost,
        gst: order.gst,
        orderNo: order.orderNo,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: user,
        orderProducts: [...newOrderProducts],
        status: [...status],
      };
      result.push(response);
    }
    allOrder = { result: result };
    return res.status(200).json(allOrder);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    let order = await OrderService.getOrderById(req.params.id);
    let orderProducts = order.orderProducts;
    let newOrderProducts = [];
    let orderProduct;
    for (let i = 0; i < orderProducts.length; i++) {
      orderProduct = await OrderService.getOrderProductByid(orderProducts[i]);
      console.log(orderProduct);
      let product = await ProductService.getProductById(orderProduct.productId);
      product = {
        name: product[0].name,
        image: product[0].images[0],
        productId: product[0].productId,
      };
      newOrderProducts.push({
        _id: orderProduct._id,
        product: product,
        orderQuantity: orderProduct.orderQuantity,
        totalProductCost: orderProduct.totalProductCost,
      });
    }
    let user = await UserService.findById(order.userId);
    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
    };
    let response = {
      _id: order._id,
      totalCost: order.totalCost,
      shippingCost: order.shippingCost,
      gst: order.gst,
      orderNo: order.orderNo,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: user,
      orderProducts: [...newOrderProducts],
    };
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

exports.removeOrderById = async (req, res, next) => {
  try {
    let order = await OrderService.removeOrderById(req.params.id);
    return res.status(200).json({
      order,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};
