const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const {
  saveProduct,
  ProductDelete,
  productUpdate,
  findOrders,
  findOrderAndUpdate,
  findOrderByUserId,
  findAddToCartByUserId,
  findReviewsByUserId,
  findSellerByUId,
  findOrderByStoreId,
  findReviewsByStoreId,
  findByIdAndDeleteReview,
  findOrderByDate,
  findOrderItemsByOrderId,
} = require("../services/admin.service");
const uploadRoute = require("../microserviceApi/upload.microservices");

const addProduct = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);

    const uid = req.user.id;

    const seller = await findSellerByUId(uid);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const formData = new FormData();

    req.files.forEach((file) => {
      formData.append("productImages", fs.createReadStream(file.path));
    });

    const uploadRes = await axios.post(uploadRoute.productImage, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const uploadedImage = uploadRes.data;

    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting file ${file.path}:`, err);
      });
    });

    if (!uploadedImage.success) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const payload = {
      seller: seller.id,
      ...data,
      images: uploadedImage.images,
    };

    const product = await saveProduct(payload);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not added",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Add product successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message,
      data: null,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductDelete(id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delete product successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

const UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const update = await productUpdate(id, req.body);
    if (!update) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Update product successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const orderItems = await findOrderByStoreId(id);

    const ordersMap = new Map();

    orderItems.forEach((item) => {
      const orderId = item.orderId._id.toString();

      if (!ordersMap.has(orderId)) {
        // Add order details if not already in the map
        ordersMap.set(orderId, {
          order: item.orderId,
          items: [],
        });
      }

      // Push item details to the order's items
      ordersMap.get(orderId).items.push({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      });
    });

    const ordersWithItems = Array.from(ordersMap.values());

    // const orders = await findOrders();

    return res.status(200).json({
      success: true,
      message: "Get all orders successfully",
      data: ordersWithItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
      data: null,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const order = await findOrderAndUpdate(id, status);
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Update order successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

const salesReport = async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Please provide storeId.",
      });
    }

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    end.setHours(23, 59, 59, 999);

    // Fetch only "Delivered" orders within the date range
    const orders = await findOrderByDate(start, end);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No completed sales found for this date range.",
      });
    }

    const orderIds = orders.map((order) => order._id);

    // Fetch order items for the specific store
    const orderItems = await findOrderItemsByOrderId(orderIds, storeId);

    if (orderItems.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No completed sales found for this store in the given date range.",
      });
    }

    let dailySales = {};

    orderItems.forEach((item) => {
      const order = orders.find(
        (o) => o._id.toString() === item.orderId.toString()
      );
      if (!order) return;

      const dateKey = order.createdAt.toISOString().split("T")[0];

      if (!dailySales[dateKey]) {
        dailySales[dateKey] = {
          date: dateKey,
          totalOrders: 0,
          totalRevenue: 0,
          totalItemsSold: 0,
        };
      }

      dailySales[dateKey].totalOrders += 1;
      dailySales[dateKey].totalRevenue += item.totalPrice;
      dailySales[dateKey].totalItemsSold += item.quantity;
    });

    return res.status(200).json({
      success: true,
      data: Object.values(dailySales),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the sales report.",
    });
  }
};

const customerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await findOrderByUserId(id);
    const addToCart = await findAddToCartByUserId(id);
    const reviews = await findReviewsByUserId(id);

    const payload = {
      order,
      addToCart,
      reviews,
    };

    return res.status(200).json({
      success: true,
      message: "Customer Details",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching customer details",
      error: error.message,
      data: null,
    });
  }
};

const getProductReviewsByStoreId = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await findReviewsByStoreId(id);

    return res.status(200).json({
      success: true,
      message: "Product Reviews",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product reviews",
      error: error.message,
    });
  }
};

const deleteFeedBack = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteReview = await findByIdAndDeleteReview(id);

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting feedback",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  deleteProduct,
  UpdateProduct,
  getAllOrders,
  updateOrder,
  salesReport,
  customerDetails,
  getProductReviewsByStoreId,
  deleteFeedBack,
};
