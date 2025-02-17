const { getStoreProductById } = require("../services/global.service");

const getStoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await getStoreProductById(id);
    if (!products) {
      return res.status(404).json({
        success: true,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store Product",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { getStoreProduct };
