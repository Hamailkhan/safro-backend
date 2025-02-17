const express = require("express");
const { getStoreProduct } = require("../controllers/global.controllers");

const route = express.Router();

route.get("/get-store-products/:id", getStoreProduct);

module.exports = { route };
