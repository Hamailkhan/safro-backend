require("dotenv").config();

const api = process.env.UPLOAD_API;

const uploadRoute = {
  storeImage: api + "image/upload-store-image",
  productImage: api + "image/upload-product-images",
};

module.exports = uploadRoute;
