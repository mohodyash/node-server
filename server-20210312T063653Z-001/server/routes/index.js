'use strict'
const express = require('express');
const router = express.Router();

const user = require('./user');
const product = require('./product.router');
const order = require('./order.router');

const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');

router.use('/user/signup',UserController.signup);
router.use('/user/login', UserController.login);
router.use('/user/resendOtp',UserController.resendOtp);
router.use('/user/verifyMobile',UserController.verifyMobile);
router.use('/user/verifyEmail', UserController.verifyEmail);
router.use('/user/forgotPassword',UserController.forgotPassword);
router.use('/user/resetPassword', UserController.resetPassword);
//router.use(AuthController.verifyToken);
router.use('/user', user);
router.use('/product', product);
router.use('/order',order);
module.exports = router;
