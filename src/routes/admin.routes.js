const express = require("express");
const {
  addProduct,
  deleteProduct,
  UpdateProduct,
  getAllOrders,
  updateOrder,
  salesReport,
  customerDetails,
  getProductReviewsByStoreId,
  deleteFeedBack,
} = require("../controllers/admin.controllers");
const authenticateUser = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/seller.middleware");
const upload = require("../middleware/multer.middleware");

const route = express.Router();

route.post(
  "/add-product",
  [authenticateUser, sellerMiddleware, upload.array("images", 4)],
  addProduct
);

route.put("/update-product/:id", UpdateProduct);
route.put("/update-order/:id", updateOrder);

route.get("/orders/:id", getAllOrders);
route.get("/sales-report", salesReport);
route.get("/customer/:id", customerDetails);
route.get("/feed-back/:id", getProductReviewsByStoreId);

route.delete("/delete-feed-back/:id", deleteFeedBack);
route.delete("/delete-product/:id", deleteProduct);
// route.get("/users", user);

module.exports = {
  route,
};
