const express = require("express");
const {
  getSingleStoreDetails,
  getAllStores,
} = require("../controllers/store.controllers");

const route = express.Router();

route.get("/stores", getAllStores);
route.get("/single-store/:id", getSingleStoreDetails);

module.exports = { route };
