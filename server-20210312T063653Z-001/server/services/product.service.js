const Product = require("../models/product.model");
const utils = require("../utils/index");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.addProductImg = async function (imgUrl, imgId, productId) {
  if (!imgId) throw Error("Img id required.");
  if (!imgUrl) throw Error("Img url required.");
  if (!productId) throw Error("Product id required.");

  let response = await module.exports.getProductById(productId);
  let product = response[0];
  if (!product) throw Error("Product not founnd with provided id");
  let images = [...product.images];
  let imgData = {
    imgUrl: imgUrl,
    imgId: imgId,
  };
  images.push(imgData);
  let imagesCount = product.imagesCount + 1;
  await Product.updateOne(
    {
      _id: product._id,
    },
    {
      $set: {
        images: images,
        imagesCount: imagesCount,
      },
    }
  ).exec();
  return "done";
};

const fs = require("fs");
const path = "uploads/products";
exports.removeProductImg = async (obj) => {
  if (!obj.productId) throw Error("Product  id required.");
  if (!obj.imgId) throw Error("Img id required.");
  let response = await module.exports.getProductById(obj.productId);
  let product = response[0];
  if (!product) throw Error("Product not founnd with provided id");
  let ImgCheck = product.images.filter((img) => img.imgId === obj.imgId);
  if (ImgCheck.length === 0) throw Error("Img is not found with Provide is");

  let images = [...product.images];
  try {
    // REMOVE FILE FROM CLOUDINARY

    cloudinary.uploader.destroy(obj.imgId, async (result) => {
      images = images.filter((img) => img.imgId !== obj.imgId);

      let imagesCount = product.imagesCount - 1;

      await Product.updateOne(
        {
          _id: product._id,
        },
        {
          $set: { images: images, imagesCount: imagesCount },
        }
      ).exec();
    });
    return "Img Remove Successfully";
  } catch (error) {
    throw Error(error);
  }
};

exports.removeProductbyProductId = async (id) => {
  try {
    let product;
    if (!id) throw Error("Id is required.");
    product = await Product.findById({ _id: id });
    if (product) {
      let images = [...product.images];
      images.forEach((img) => {
        cloudinary.uploader.destroy(img.imgId, async (result) => {});
      });
      let response = await Product.remove({ _id: product._id });
      if (!response) throw Error("somting went worng cant not remove");
      else return "product Remove successfully";
    } else {
      throw Error("product Not Found with this id");
    }
  } catch (error) {
    throw Error(error);
  }
};

// console.log(response)
// if (!response) throw Error('somting went worng cant not remove');
// else throw Error('product Remove successfully')

exports.createProduct = async (obj) => {
  if (!obj.name) throw Error("Name is required.");
  if (!obj.price) throw Error("Price is required.");
  if (!obj.description) throw Error("Description is required.");
  if (!obj.category) throw Error("Category  is required.");
  if (!obj.userId) throw Error("UserId is Required");
  if (!obj.quantity) throw Error("Qunatity is Required");
  if (!obj.brand) throw Error("Brand is Required");

  let productId = await utils.getUid(4, "numeric");
  let newProduct = await Product.create({
    name: obj.name,
    price: obj.price,
    description: obj.description,
    category: obj.category,
    user: obj.userId,
    quantity: obj.quantity,
    brand: obj.brand,
    productId: `PRO${productId}`,
  });
  return newProduct;
};

exports.updateProduct = async function (obj) {
  if (!obj.productId) throw Error("Prodcut not found.");
  let userObj = {};
  if (obj.hasOwnProperty("name")) {
    if (!obj.name) throw Error("Name is required.");
    Object.assign(userObj, { name: obj.name });
  }
  if (obj.hasOwnProperty("price")) {
    if (!obj.price) throw Error("Price is required.");
    Object.assign(userObj, { price: obj.price });
  }
  if (obj.hasOwnProperty("description")) {
    if (!obj.description) throw Error("Description is required.");
    Object.assign(userObj, { description: obj.description });
  }
  if (obj.hasOwnProperty("category")) {
    if (!obj.category) throw Error("Category is required.");
    Object.assign(userObj, { category: obj.category });
  }
  if (obj.hasOwnProperty("quantity")) {
    if (!obj.quantity) throw Error("Quantity is required.");
    Object.assign(userObj, { quantity: obj.quantity });
  }
  if (obj.hasOwnProperty("brand")) {
    if (!obj.quantity) throw Error("Brand is required.");
    Object.assign(userObj, { brand: obj.brand });
  }
  if (obj.hasOwnProperty("availability")) {
    if (!obj.quantity) throw Error("Availability is required.");
    Object.assign(userObj, { availability: obj.availability });
  }
  await Product.updateOne(
    {
      _id: obj.productId,
    },
    {
      $set: userObj,
    }
  ).exec();
};

exports.getAllProduct = async () => {
  return await Product.find();
};

exports.getProductById = async (id) => {
  if (!id) throw Error("Id is required.");
  return await Product.find({ _id: id });
};

exports.getProductByCategory = async (category) => {
  if (!category) throw Error("category is required.");
  if (category === "MP") {
    return await Product.find({ category: "Men's Perfumes" });
  }
  if (category === "MD") {
    return await Product.find({ category: "Men's Deodorant" });
  }
  if (category === "WP") {
    return await Product.find({ category: "Women's Perfumes" });
  }
  if (category === "WD") {
    return await Product.find({ category: "Women's  Deodorant" });
  }
  if (category === "ALL") {
    return await Product.find();
  }
};
