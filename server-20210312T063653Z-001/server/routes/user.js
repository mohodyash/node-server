'use strict';
const express = require('express');
const multer = require('multer');
const router = express.Router();
const UserController = require('../controllers/user.controller');

const storage = multer.diskStorage({
	//TODO: learn whats going on
	destination: function (req, file, cb) {
		cb(null, './uploads')
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
})
// let upload = multer({ storage: storage });
let upload = multer({ storage: storage });


router.get('/me', UserController.me);
// router.post('/updateProfile', upload.single('file'), UserController.updateProfile);
router.post('/updateProfile', UserController.updateProfile);
router.post('/logout', UserController.logout);
router.get('/client/getAllUser', UserController.getAllClientUser)
router.get('/admin/getAllUser', UserController.getAllAdminUser)
router.get('/getUserById/:id', UserController.getUserById)
router.delete('/removeUserById/:id', UserController.removeUserById)

	
module.exports = router;
