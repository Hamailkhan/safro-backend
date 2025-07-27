const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
    },
    desc: {
      type: String,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    collections: [
      {
        type: String,
        required: true,
      },
    ],
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    qty: {
      type: Number,
      required: true,
      default: 0,
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      weight: { type: Number },
    },
    size: [
      {
        type: String, // Example: 'S', 'M', 'L', 'XL'
      },
    ],
    color: [
      {
        type: String, // Example: 'Red', 'Blue', 'Black'
      },
    ],
    technicalSpecifications: {
      type: Map,
      of: String,
    },
    vendor: {
      type: String,
      required: true,
    },
    warranty: {
      type: String,
      required: true,
    },
    shippingInfo: {
      estimatedDeliveryDays: { type: Number, required: true },
      shippingCost: { type: Number, required: true },
    },
    lowStockThreshold: { type: Number, required: true, default: 1 },
    isStock: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
