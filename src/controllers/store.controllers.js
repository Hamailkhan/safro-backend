const {
  findStoreById,
  getStoreProduct,
  getStores,
} = require("../services/store.service");

const getAllStores = async (req, res) => {
  try {
    const stores = await getStores();

    const payload = stores?.map((store) => {
      const { id, storeName, storeDescription, storeLogo } = store;

      return {
        id,
        storeName,
        storeDescription,
        storeLogo,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Stores retrieved successfully",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in getting all stores",
      error: error.message,
    });
  }
};

const getSingleStoreDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await findStoreById(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const products = await getStoreProduct(id);

    const payload = {
      storeName: store.storeName,
      storeDescription: store.storeDescription,
      storeLogo: store.storeLogo,
      storeCoverPhoto: store.storeCoverPhoto,
    };

    return res.status(200).json({
      success: true,
      message: "Store fetch successfully",
      data: { payload, products },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getSingleStoreDetails,
  getAllStores,
};
