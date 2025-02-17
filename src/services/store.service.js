const db = require("../models/index");

const { seller: Seller, product: Product } = db;

const findStoreById = async (id) => {
  try {
    const store = await Seller.findById(id);
    return store;
  } catch (error) {
    throw error;
  }
};

const getStoreProduct = async (id) => {
  try {
    const products = await Product.find({
      seller: id,
    });
    return products;
  } catch (error) {
    throw error;
  }
};

const getStores = async () => {
  try {
    const stores = await Seller.find({});
    return stores;
  } catch (error) {
    throw error;
  }
};

module.exports = { findStoreById, getStoreProduct, getStores };
