const ProductService = require('../services/product.service');
const Product = require('../models/product.model');
exports.createProduct = async (req, res, next) => {
    try {
        let newProduct = await ProductService.createProduct(req.body);
        return res.status(200).json({
            message: 'Product Created successfully.',
            // temp send mobile for
            newProduct
        });
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
}
exports.updateProduct = async (req, res, next) => {
    try {
        let response = await ProductService.updateProduct(req.body)
        return res.status(200).json({
            message: 'Product Updated Successfully',
            response
        })
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}

exports.getAllProduct = async (req, res, next) => {
    try {
        let response = await ProductService.getAllProduct()
        return res.status(200).json({
            response
        })
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}

exports.getProductById = async (req, res, next) =>{
    try {
        let response = await ProductService.getProductById(req.params.id)
        return res.status(200).json({
            response
        })
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}

exports.removeProductbyProductId = async (req, res, next) =>{
    try {
        let response = await ProductService.removeProductbyProductId(req.params.id)
        return res.status(200).json({
            response
        })
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}

exports.removeProductImg = async (req,res,next) =>{
    try {
        let response = await ProductService.removeProductImg(req.body)
       if(response){
        return res.status(200).json({
            response
        })
       }
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}
exports.getProductByCategory = async (req, res, next) =>{
    try {
        let response = await ProductService.getProductByCategory(req.params.category)
        return res.status(200).json({
            response
        })
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}




