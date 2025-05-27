const express = require("express");
const Product = require("../models/product");
const mongoose = require("mongoose");

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().exec();
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    console.error("Error finding products:", err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Failed to fetch products",
      error: err.message,
    });
  }
});

// POST new product
router.post("/", async (req, res, next) => {
  console.log("Request body:", req.body);

  try {
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      imageUrl: req.body.imageUrl,
      price: req.body.price,
      inStock: req.body.inStock,
      rating: req.body.rating
    });

    const result = await newProduct.save();

    res.status(200).json({
      message: "Product created successfully",
      createdProduct: result
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error"
    });
  }
});


// GET product by ID
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).exec();
    if (!product) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Product not found",
      });
    }
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error finding product:", err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Failed to fetch product",
      error: err.message,
    });
  }
});

// PATCH (update) product
router.put("/:productId", async (req, res) => {
  try {
    const result = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        status: "error",
        code: 404,
        error: err.message,
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Product updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      status: "err error: err.message,or",
      code: 500,
      message: "Failed to update product",
     
    });
  }
});



// DELETE product
router.delete("/:productId", async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.productId).exec();

    if (!result) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Product deleted successfully",
      data: {
        message: "Product deleted successfully",
      },
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Failed to delete product",
      error: err.message,
    });
  }
});

module.exports = router;
