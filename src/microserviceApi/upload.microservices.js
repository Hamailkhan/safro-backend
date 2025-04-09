require("dotenv").config();

const api = process.env.UPLOAD_API;

const uploadRoute = {
  storeImage: api + "image/upload-store-image",
};

module.exports = uploadRoute;
