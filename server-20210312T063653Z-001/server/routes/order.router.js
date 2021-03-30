"use strict";
const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/order.controller");

router.post("/placeOrder", OrderController.placeOrder);
router.get("/getAllOrder", OrderController.getAllOrder);
router.get("/getOrder/:id", OrderController.getOrderById);
router.delete("/removeOrder/:id", OrderController.removeOrderById);
router.post("/doShipped", OrderController.doShipped);
router.post("/getOrderByUserId", OrderController.getOrderByUserId);

module.exports = router;
