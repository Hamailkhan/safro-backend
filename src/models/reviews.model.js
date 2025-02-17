const mongoose = require("mongoose");

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReviewModel = mongoose.model("Review", ReviewSchema);

module.exports = ReviewModel;
