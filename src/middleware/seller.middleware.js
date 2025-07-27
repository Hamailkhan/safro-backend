const { findSellerRoleByUid } = require("../services/admin.service");
const sendResponse = require("../utils/sendResponse");

const sellerMiddleware = async (req, res, next) => {
  const user = await findSellerRoleByUid(req.user.id);

  if (user && user.role === "seller") {
    next();
  } else {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "Access denied. Admins only.",
    });
  }
};

module.exports = sellerMiddleware;
