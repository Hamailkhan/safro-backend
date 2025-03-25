const express = require("express");
const {
  login,
  register,
  verifyOtp,
  logout,
  profile,
  forgotPassword,
  resetPassword,
  resendOtp,
  user,
  deleteUser,
  updateUser,
  addReview,
  addToCard,
  getSingleAddCard,
  addCardQty,
  deleteCart,
  Contact,
  checkOut,
  refreshAccessToken,
} = require("../controllers/user.controllers");
const { signupRouteValidator } = require("../validators/request.validator");
const authenticateUser = require("../middleware/authMiddleware");

const route = express.Router();

route.post("/login", login);
route.post("/register", signupRouteValidator, register);
route.post("/verify-otp", verifyOtp);
route.post("/resend-otp", resendOtp);
route.post("/logout", logout);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.post("/add-review/:pid/:uid/:sid", addReview);
route.post("/add-to-cart/:id/:uid", addToCard);
route.post("/contact-us", Contact);
route.post("/check-out", checkOut);
route.post("/refresh-token", refreshAccessToken);

route.delete("/delete-user/:id", deleteUser);
route.delete("/delete-cart/:uid/:id", deleteCart);

route.put("/update-user", updateUser);
route.put("/update-cart-qty/:id/:uid", addCardQty);

route.get("/get-cart-products/:uid", getSingleAddCard);
route.get("/user-profile", authenticateUser, profile);
route.get("/users", user);

module.exports = { route };
