const {
  getProducts,
  getProductById,
  findProducts,
  getReviewsByProductId,
  countReview,
  sellerDetail,
  getReviews,
} = require("../services/product.service");

const getAllProducts = async (req, res) => {
  try {
    const products = await getProducts();
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No products found",
        data: null,
      });
    }

    const reviews = await getReviews();

    const productsWithReviews = products.map((product) => {
      const productReviews = reviews.filter(
        (review) => review.productId.toString() === product._id.toString()
      );

      return {
        ...product._doc,
        reviews: productReviews,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Get all products successfully",
      data: productsWithReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
      data: null,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await getProductById(id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const seller = await sellerDetail(product.seller);

    const a = {
      product,
      seller: {
        storeName: seller.storeName,
        id: seller.id,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Get Single Product Successfully",
      data: a,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
      data: null,
    });
  }
};

const searchAndGetProduct = async (req, res) => {
  try {
    const { q } = req.query;

    const filter = {};

    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { desc: { $regex: q, $options: "i" } },
      { price: { $regex: q, $options: "i" } },
      { vendor: { $regex: q, $options: "i" } },
      { categories: { $in: [q] } },
      { tags: { $in: [q] } },
    ];

    const products = await findProducts(filter);
    if (!products) {
      return res.status(200).json({
        success: true,
        message: "No products found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product Found",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching for product",
      error: error.message,
      data: null,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Fetch reviews for the product with pagination
    const review = await getReviewsByProductId(id);

    const reviews = review
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // JavaScript array sorting
      .slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Count total reviews for the product
    const totalReviews = await countReview(id);

    // Determine if there are more reviews to fetch
    const hasMore = totalReviews > pageNum * limitNum;

    return res.status(200).json({
      success: true,
      reviews,
      hasMore,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  searchAndGetProduct,
  getProductReviews,
};
