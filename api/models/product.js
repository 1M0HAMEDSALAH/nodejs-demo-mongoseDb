const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must not exceed 1000 characters"],
      default: "",
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Category is required"],
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(v);
        },
        message: "Please enter a valid image URL (jpg, png, etc.)",
      },
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

module.exports = mongoose.model("Product", productSchema);
