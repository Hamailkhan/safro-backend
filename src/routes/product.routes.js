const express = require("express");
const {
  getAllProducts,
  getSingleProduct,
  searchAndGetProduct,
  getProductReviews,
  filterProduct,
} = require("../controllers/product.controllers");

const route = express.Router();

route.get("/products", getAllProducts);
route.get("/single-product/:id", getSingleProduct);
route.get("/product-reviews/:id", getProductReviews);
route.get("/search", searchAndGetProduct);
route.get("/filter-product", filterProduct);

route.post("/upload-img", async (req, res) => {
  console.log(req.file);
});

module.exports = {
  route,
};
