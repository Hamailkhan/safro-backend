const mongoose = require("mongoose");

const { Schema } = mongoose;

const addToCardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const AddToCardModel = mongoose.model("AddToCard", addToCardSchema);

module.exports = AddToCardModel;
