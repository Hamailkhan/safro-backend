const express = require("express");
const {
  addProduct,
  DeleteProduct,
  UpdateProduct,
  getAllOrders,
  updateOrder,
  salesReport,
  customerDetails,
  getProductReviewsByStoreId,
  deleteFeedBack,
} = require("../controllers/admin.controllers");

const route = express.Router();

route.post("/add-product/:uid", addProduct);

route.put("/update-product/:id", UpdateProduct);
route.put("/update-order/:id", updateOrder);

route.get("/orders/:id", getAllOrders);
route.get("/sales-report", salesReport);
route.get("/customer/:id", customerDetails);
route.get("/feed-back/:id", getProductReviewsByStoreId);

route.delete("/delete-feed-back/:id", deleteFeedBack);
route.delete("/delete-product/:id", DeleteProduct);
// route.get("/users", user);

module.exports = {
  route,
};
