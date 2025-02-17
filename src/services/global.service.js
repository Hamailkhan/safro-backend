const db = require("../models/index");

const { product: Product } = db;

const getStoreProductById = async (id) => {
  try {
    const product = await Product.find({ seller: id });
    return product;
  } catch (error) {
    throw error;
  }
};

module.exports = { getStoreProductById };
