const db = require("../models/index");

const {
  product: Product,
  addToCard: Card,
  review: Review,
  seller: Seller,
} = db;

const getProducts = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    return product;
  } catch (error) {
    throw error;
  }
};

const sellerDetail = async (id) => {
  try {
    const seller = await Seller.findOne({
      _id: id,
    });

    return seller;
  } catch (error) {
    throw error;
  }
};
// const saveAddToCard = async (payload) => {
//   try {
//     const newCard = new Card({ ...payload });
//     const addCard = await newCard.save();
//     return addCard;
//   } catch (error) {
//     throw error;
//   }
// };

// const findCard = async (uid, id, price, img) => {
//   try {
//     const cart = await Card.findOneAndUpdate(
//       { userId: uid, productId: id },
//       {
//         $inc: { quantity: 1 }, // Increment the quantity
//         $setOnInsert: {
//           // If inserting, set these fields
//           price: price,
//           image: img,
//         },
//       },
//       { new: true, upsert: true }
//     );
//     return cart;
//   } catch (error) {
//     throw error;
//   }
// };

const findProducts = async (payload) => {
  try {
    const products = await Product.find(payload);
    return products;
  } catch (error) {
    throw error;
  }
};

// const findCardByUid = async (uid) => {
//   try {
//     const cards = await Card.find({
//       userId: uid,
//     });
//     return cards;
//   } catch (error) {
//     throw error;
//   }
// };

const getReviewsByProductId = async (id) => {
  try {
    const review = await Review.find({
      productId: id,
    });
    return review;
  } catch (error) {
    throw error;
  }
};

const countReview = async (productId) => {
  try {
    const totalReview = await Review.countDocuments({ productId });
    return totalReview;
  } catch (error) {
    throw error;
  }
};

const getReviews = async () => {
  try {
    const reviews = await Review.find();
    return reviews;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getProducts,
  getProductById,
  findProducts,
  getReviewsByProductId,
  countReview,
  sellerDetail,
  getReviews,
};
