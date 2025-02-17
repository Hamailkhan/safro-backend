const db = require("../models/index");

const {
  product: Product,
  order: Order,
  addToCard: AddToCart,
  seller: Seller,
  orderItem: OrderItem,
  review: Review,
} = db;

const saveProduct = async (payload) => {
  try {
    const newProduct = new Product({ ...payload });
    const product = await newProduct.save();
    return product;
  } catch (error) {
    throw error;
  }
};

const ProductDelete = async (id) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    return product;
  } catch (error) {
    throw error;
  }
};

const productUpdate = async (id, payload) => {
  try {
    const update = await Product.findByIdAndUpdate(
      {
        _id: id,
      },
      { ...payload },
      { new: true }
    );

    return update;
  } catch (error) {
    throw error;
  }
};

const findOrders = async () => {
  try {
    const orders = await Order.find({}, "_id");
    return orders;
  } catch (error) {
    throw error;
  }
};

const findOrderByStoreId = async (storeId) => {
  try {
    const order = await OrderItem.find({ storeId })
      .populate("orderId")
      .populate("productId");

    return order;
  } catch (error) {
    throw error;
  }
};

const findOrderAndUpdate = async (id, status) => {
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        status: status,
      },
      { new: true }
    );

    return order;
  } catch (error) {
    throw error;
  }
};

const findOrderByUserId = async (id) => {
  try {
    const order = await Order.find({
      customerId: id,
    });

    return order;
  } catch (error) {
    throw error;
  }
};

const findAddToCartByUserId = async (id) => {
  try {
    const addToCart = await AddToCart.find({
      userId: id,
    });

    return addToCart;
  } catch (error) {
    throw error;
  }
};

const findReviewsByUserId = async (id) => {
  try {
    const reviews = await Product.find(
      {
        "reviews.user": id,
      },
      { "reviews.$": 1 }
    );

    return reviews;
  } catch (error) {
    throw error;
  }
};

const findSellerByUId = async (uid) => {
  try {
    const seller = await Seller.findOne({
      userId: uid,
    });
    return seller;
  } catch (error) {
    throw error;
  }
};

const findReviewsByStoreId = async (id) => {
  try {
    const reviews = await Review.find({ storeId: id });
    return reviews;
  } catch (error) {
    throw error;
  }
};

const findByIdAndDeleteReview = async (id) => {
  try {
    const review = await Review.findByIdAndDelete(id);
    return review;
  } catch (error) {
    throw error;
  }
};

const findOrderByDate = async (start, end) => {
  try {
    const order = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: "Completed", // Exclude cancelled orders
    });

    return order;
  } catch (error) {
    throw error;
  }
};

const findOrderItemsByOrderId = async (orderIds, storeId) => {
  try {
    const orderItems = await OrderItem.find({
      orderId: { $in: orderIds },
      storeId: storeId,
    });

    return orderItems;
  } catch (error) {
    throw error;
  }
};

module.exports = {
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
};
