"use strict";
const express = require("express");
const multer = require("multer");
const router = express.Router();
const uuidv4 = require("uuid/v4");
const ProductService = require("../services/product.service");
const ProductController = require("../controllers/product.controller");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

let imgId = uuidv4();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, imgId);
  },
});
let upload = multer({ storage: storage });

router.post("/createProducImg", upload.single("file"), async (req, res) => {
  try {
    // SEND FILE TO CLOUDINARY

    if (!req.body.productId)
      return res.status(403).json({ message: "productId is required" });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const path = req.file.path;
    cloudinary.uploader.upload(
      path,
      { public_id: `products/${imgId}` }, // directory and tags are optional
      async function (err, image) {
        if (err) return res.send(err);
        fs.unlinkSync(path);
        // return image details
        let response = await ProductService.addProductImg(
          image.url,
          image.public_id,
          req.body.productId
        );
        if (response) {
          res.status(200).json({
            message: "Img Added successfully.",
            imgUrl: image.url,
          });
        }
        // res.json(image);
      }
    );
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
  imgId = uuidv4();
});

router.get(
  "/getProductByCategory/:category",
  ProductController.getProductByCategory
);

router.post("/createProduct", ProductController.createProduct);
router.post("/updateProduct", ProductController.updateProduct);
router.get("/getAllProduct", ProductController.getAllProduct);
router.get("/getProduct/:id", ProductController.getProductById);
router.post("/removeProductImg", ProductController.removeProductImg);
router.delete("/removeProduct/:id", ProductController.removeProductbyProductId);

module.exports = router;
