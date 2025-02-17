const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const SellerSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    storeName: {
      type: String,
      unique: true,
      required: true,
    },
    storeDescription: {
      type: String,
      required: true,
    },
    storeLogo: {
      type: String,
      required: true,
    },
    storeCoverPhoto: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subscription: {
      isActive: {
        type: Boolean,
        default: false,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiryDate: {
        type: Date,
      },
      subscriptionType: {
        type: String,
        enum: ["free", "premium", "enterprise"],
        default: "free",
      },
      paymentStatus: {
        type: Boolean,
        default: false,
      },
    },
    productLimit: {
      type: Number,
      default: 5,
    },
    productsAdded: {
      type: Number,
      default: 0,
    },
    // status: {
    //   type: String,
    //   enum: ["active", "inactive", "suspended"],
    //   default: "inactive",
    // },
  },
  { timestamps: true }
);

SellerSchema.methods.activateSubscription = function (subscriptionType) {
  this.subscription.isActive = true;
  this.subscription.subscriptionType = subscriptionType;
  this.subscription.startDate = Date.now();

  this.subscription.expiryDate = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );
  this.productLimit =
    subscriptionType === "premium"
      ? 100
      : subscriptionType === "enterprise"
      ? Infinity
      : 5;
  this.save();
};

SellerSchema.methods.checkSubscriptionValidity = function () {
  if (this.subscription.isActive) {
    const currentDate = new Date();
    if (currentDate > this.subscription.expiryDate) {
      this.subscription.isActive = false;
      this.productLimit = 5;
      this.save();
      return false;
    }
    return true;
  }
  return false;
};

const SellerModel = model("Seller", SellerSchema);

module.exports = SellerModel;
