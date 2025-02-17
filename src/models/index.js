const mongoose = require("mongoose");
const ProductModel = require("./product.model");
const AddToCardModel = require("./addToCard.model");
const OrderModel = require("./order.model");
const UserModel = require("./user.model");
const TokenModel = require("./token.model");
const ReviewModel = require("./reviews.model");
const SellerModel = require("./seller.model");
const OrderItemModel = require("./orderItem.model");
const PaymentModel = require("./payment.model");

const db = {};

db.mongoose = mongoose;
db.product = ProductModel;
db.addToCard = AddToCardModel;
db.order = OrderModel;
db.orderItem = OrderItemModel;
db.payment = PaymentModel;
db.user = UserModel;
db.token = TokenModel;
db.review = ReviewModel;
db.seller = SellerModel;

module.exports = db;
