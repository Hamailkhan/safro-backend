// const mongoose = require("mongoose");

// const { Schema } = mongoose;

// const productSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     seller: {
//       type: Schema.Types.ObjectId,
//       ref: "Seller",
//     },
//     desc: {
//       type: String,
//       required: true,
//     },
//     images: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     price: {
//       type: Number,
//       required: true,
//     },
//     oldPrice: {
//       type: String,
//       required: true,
//     },
//     categories: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     tags: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//     qty: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     dimensions: {
//       length: { type: Number },
//       width: { type: Number },
//       height: { type: Number },
//       weight: { type: Number },
//     },
//     size: [
//       {
//         type: String, // Example: 'S', 'M', 'L', 'XL'
//       },
//     ],
//     color: [
//       {
//         type: String, // Example: 'Red', 'Blue', 'Black'
//       },
//     ],
//     technicalSpecifications: {
//       type: Map,
//       of: String,
//     },
//     vendor: {
//       type: String,
//       required: true,
//     },
//     warranty: {
//       type: String,
//       required: true,
//     },
//     shippingInfo: {
//       estimatedDelivery: { type: Date, required: true },
//       shippingCost: { type: Number, required: true },
//     },
//     lowStockThreshold: { type: Number, required: true, default: 1 },
//     isStock: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// const ProductModel = mongoose.model("Product", productSchema);

// module.exports = ProductModel;

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
        type: String,
        required: true,
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
    collection: [
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
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
