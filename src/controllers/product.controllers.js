const {
  getProducts,
  getProductById,
  findProducts,
  getReviewsByProductId,
  countReview,
  sellerDetail,
  getReviews,
  filter,
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

      const totalRating = productReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      const reviewCount = productReviews.length;
      const averageRating = productReviews.length
        ? totalRating / productReviews.length
        : 0;

      // return {
      //   ...product._doc,
      //   rating: Number(averageRating.toFixed(1)),
      //   reviews: reviewCount,
      // };
      return {
        images: product.images,
        name: product.name,
        price: product.price,
        categories: product.categories,
        vendor: product.vendor,
        tags: product.tags,
        id: product._id,
        rating: Number(averageRating.toFixed(1)),
        discount: product.discount, // Assuming discount is optional
        reviews: reviewCount,
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
      // { price: { $regex: q, $options: "i" } },
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

const filterProduct = async (req, res) => {
  try {
    const { vendors, categories, tags, priceMin, priceMax } = req.query;

    const pipeline = [];

    const matchStage = {};

    if (vendors) {
      const vendorsArr = vendors.split(",").map((v) => v.trim());
      matchStage.vendor = { $in: vendorsArr };
    }

    if (categories) {
      const categoriesArr = categories.split(",").map((c) => c.trim());
      matchStage.categories = { $in: categoriesArr };
    }

    if (tags) {
      const tagsArr = tags.split(",").map((t) => t.trim());
      matchStage.tags = { $in: tagsArr };
    }

    if (priceMin || priceMax) {
      matchStage.price = {};
      if (priceMin) matchStage.price.$gte = Number(priceMin);
      if (priceMax) matchStage.price.$lte = Number(priceMax);
    }

    // Ensure all conditions are met simultaneously
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: { $and: [matchStage] } });
    }

    pipeline.push(
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          rating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] }, // Agar reviews hain
              then: { $avg: "$reviews.rating" }, // Average rating calculate karo
              else: 0, // Warna default 0 do
            },
          },
          reviews: { $size: "$reviews" }, // Total reviews count
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          images: 1,
          discount: 1,
          rating: { $round: ["$rating", 1] }, // Round to 1 decimal
          reviews: 1, // Total review count
        },
      }
    );

    const products = await filter(pipeline);

    return res.status(200).json({
      success: true,
      message: products.length
        ? "Filtered products found"
        : "No products found",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error filtering products",
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
  filterProduct,
};
