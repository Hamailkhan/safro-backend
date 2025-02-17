const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const PaymentSchema = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Easypaisa", "COD", "Card"],
      default: "Card",
    },
    transactionId: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel = model("Payment", PaymentSchema);

module.exports = PaymentModel;
