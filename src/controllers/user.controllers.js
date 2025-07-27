const jwt = require("jsonwebtoken");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

const {
  findByEmail,
  createUser,
  UpdateUserByEmail,
  deleteTokensByUID,
  getTokenByUID,
  saveToken,
  getUserByUid,
  UpdateUserPassword,
  UpdateUserOtp,
  getAllUsers,
  deleteUserById,
  updateUserUsername,
  findUserByAndReview,
  findProductAndReview,
  findUserAndUpdateCart,
  findProductInUser,
  updateCartQty,
  getUserForCart,
  findCartAndDelete,
  checkProductQty,
  createOrder,
  updateUserOrder,
  findUserByUid,
  findProductById,
  saveReview,
  findCartByUserId,
  createSeller,
  checkStoreName,
  saveOrderItems,
  savePayment,
  deleteTokensByToken,
  getUserCartLength,
  storeCreated,
  updateRole,
} = require("../services/user.service");
const { createHash, compareHash } = require("../utils/hash.utils");
const { config } = require("../config/server.config");
const { sendEmail } = require("../services/mail.service");
const { generateOtp } = require("../utils/generateOtp.util");
const { getProductById } = require("../services/product.service");
const uploadRoute = require("../microserviceApi/upload.microservices");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (req.cookies.refreshToken) {
      return res.status(409).json({
        success: false,
        message: "Already logged in from this browser. Please logout first.",
        data: null,
      });
    }

    const user = await findByEmail(email);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials", data: null });

    if (!user.isActive)
      return res.status(401).json({
        success: false,
        message: "Please verify your account first",
        data: null,
      });

    const passwordMatch = await compareHash(password, user.password);
    if (!passwordMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials", data: null });

    const accessToken = jwt.sign({ id: user.id }, config.secret);

    const refreshToken = jwt.sign({ id: user.id }, config.secret);

    await saveToken({ token: refreshToken, user: user.id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Enable in production (HTTPS required)
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken, // Frontend will use this for API requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Internal Server Error", error.message],
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    const user = await findByEmail(email);
    if (user) {
      if (!user.isActive) {
        return res
          .status(200)
          .json({ success: true, message: "Please verify your account" });
      }

      return res
        .status(400)
        .json({ success: false, message: "Email Already Exist" });
    }

    const hashedPassword = await createHash(password);

    const payload = {
      username,
      email,
      phone,
      password: hashedPassword,
      // role,
    };

    const newUser = await createUser(payload);
    if (!newUser) {
      return res
        .status(404)
        .json({ success: false, message: "Something went wrong" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Register successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Register successfully", error.message],
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await findByEmail(email);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });

    if (user.otp !== otp)
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    const response = await UpdateUserByEmail(user.email);
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["OTP verified successfully", error.message],
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found ",
        data: null,
      });
    }

    const otp = generateOtp();

    const update = await UpdateUserOtp(user.email, otp);

    const payload = {
      from: "hamailkhan213@gmail.com",
      to: user.email,
      subject: "Resend OTP",
      text: `Hi ${user.username}, Your OTP is ${otp}`,
    };

    const send = await sendEmail({
      ...payload,
    })
      .then((res) => console.log(`Success sending email to ${user.email}`))
      .catch((err) => console.log(`Error sending email to ${user.email}`));

    if (send) {
      return res.status(500).json({
        success: false,
        message: "Resend OTP in email failed",
        data: null,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP Send", data: otp });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Resend OTP Failed", data: null });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Already logged out",
        data: null,
      });
    }

    // ✅ Refresh token database se delete karen
    const logoutUser = await deleteTokensByToken(refreshToken);
    if (logoutUser.deletedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Already logged out",
        data: null,
      });
    }

    // ✅ Cookies se token remove karein
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // Production mai true karein
      sameSite: "Strict",
    });

    return res.status(200).json({
      success: true,
      message: "Successfully logged out",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    jwt.verify(refreshToken, config.secret, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid refresh token" });
      }

      const newAccessToken = jwt.sign({ id: decoded.id }, config.secret, {
        expiresIn: "15m",
      });

      return res
        .status(200)
        .json({ success: true, accessToken: newAccessToken });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await getUserByUid(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const { username, email, role, phone } = user;

    const cart = await getUserCartLength(req.user.id);
    if (!cart) {
      const payload = {
        username,
        email,
        role,
        phone,
      };

      return res.status(200).json({
        success: true,
        message: "User Found",
        data: payload,
      });
    }

    const payload = {
      username,
      email,
      role,
      phone,
      cart: cart?.items,
    };

    return res.status(200).json({
      success: true,
      message: "User Found",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findByEmail(email);
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "There is no user", data: null });
    }

    const payload = {
      from: "hamailkhan213@gmail.com",
      to: user.email,
      subject: "Reset Password",
      html: `<p>Hi ${user.username}, Please copy the link to reset your password <a href="http://localhost:3002/user/reset-password?id=${user._id}">click</a></p>`,
    };

    const send = await sendEmail({
      ...payload,
    })
      .then((res) => console.log(`Success sending email to ${user.email}`))
      .catch((err) => console.log(`Error sending email to ${user.email}`));

    if (send) {
      return res
        .status(500)
        .json({ success: false, message: "Email not sent", data: null });
    }

    return res
      .status(200)
      .json({ success: true, message: "Email sent", data: null });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", data: null });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.query;
    const { password } = req.body;

    const user = await getUserByUid(id);
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "There is no user",
        data: null,
      });
    }

    const hashedPassword = await createHash(password);

    const payload = {
      email: user.email,
      password: hashedPassword,
    };

    const update = await UpdateUserPassword(payload);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", data: null });
  }
};

const user = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.send(users);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "There is no users", data: null });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userDelete = await deleteUserById(id);
    if (!userDelete) {
      return res.status(500).json({
        success: false,
        message: "There is no user",
        data: null,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "user delete successfully", data: null });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "There is no users", data: null });
  }
};

const updateUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    const user = await findByEmail(email);
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "There is no user",
        data: null,
      });
    }

    const payload = {
      username: username,
      email: user.email,
    };

    const update = await updateUserUsername(payload);
    if (!update) {
      return res.status(500).json({
        success: false,
        message: "User not Updated",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Updated",
      data: payload,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "can't update user", data: null });
  }
};

const addReview = async (req, res) => {
  try {
    const { pid, sid } = req.params;
    const { rating, comment } = req.body;

    const uid = req.user.id;

    const user = await findUserByUid(uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "There is no user",
        data: null,
      });
    }

    const product = await findProductById(pid);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const payload = {
      user: user.username,
      userId: user.id,
      productId: product.id,
      storeId: sid,
      rating,
      comment,
    };

    const review = await saveReview(payload);

    return res.status(200).json({
      success: true,
      message: "Review Added",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Something went wrong", error.message],
      data: null,
    });
  }
};

const addToCard = async (req, res) => {
  try {
    const { id } = req.params;

    const uid = req.user.id;

    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
        data: null,
      });
    }

    const { newCartQuantity, currentCartQuantity } = await checkProductQty(
      uid,
      id
    );

    if (newCartQuantity > product.qty) {
      return res.status(400).json({
        success: false,
        message: `Product is out of stock. Only ${
          product.qty - currentCartQuantity
        } more available.`,
        data: null,
      });
    }

    const findProductInUserCard = await findProductInUser(uid, id);

    return res.status(200).json({
      success: true,
      message: "Product Added to Cart Successfully",
      data: findProductInUserCard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding product to cart",
      error: error.message,
      data: null,
    });
  }
};

const updateCardQty = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    const uid = req.user.id;

    const cart = await findCartByUserId(uid);
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "User cart not found" });
    }

    const update = await updateCartQty(cart, qty, id);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: update,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserAddToCard = async (req, res) => {
  try {
    const id = req.user.id;

    const cart = await getUserForCart(id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const cartDetails = cart.items.map((cartItem) => ({
      _id: cartItem.productId._id,
      name: cartItem.productId.name,
      price: cartItem.productId.price,
      image: cartItem.productId.images[0],
      stock: cartItem.productId.qty,
      quantity: cartItem.quantity,
      seller: cartItem.productId.seller,
      totalPrice: cartItem.productId.price * cartItem.quantity,
    }));

    return res.status(200).json({
      success: true,
      message: "Getting single add card successfully",
      data: cartDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting single add card",
      error: error.message,
      data: null,
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const uid = req.user.id;

    const cart = await findCartAndDelete(uid, id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Failed to delete cart",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting cart",
      error: error.message,
    });
  }
};

const contact = async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;

    const payload = {
      from: email,
      to: "hamailkhan213@gmail.com",
      subject: name,
      html: `Email: ${email} <br/> Phone:${phone} <br/> Message: ${message} `,
    };

    const resendPayload = {
      form: "hamailkhan213@gmail.com",
      to: email,
      subject: "Safro",
      html: `<table style="width: 100%; text-align: center; padding: 20px; font-family: Arial, sans-serif;">
  <!-- Icon -->
  <tr>
    <td>
      <img src="https://lh3.googleusercontent.com/pw/AP1GczORkJuqr-XSjQkHvvEiHFtIM74Hw9gJrLIQgt9_BaB47yedUXHfMkhNpMHa9zZsSLyOiVI_eLYBRz-sKdcclZViuBABc21hsX59lFBrB-8VmhJwBabjFczc4FDinE8ERW2GqKMA4OWBvHBEvlcTGZ8-=w473-h473-s-no-gm?authuser=0" alt="Company Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
    </td>
  </tr>

  <!-- Personalized Greeting with User Name -->
  <tr>
    <td>
      <h1 style="color: #333;">Hi, ${name}!</h1> <!-- Placeholder for user name -->
      <p style="color: #555; font-size: 16px;">Thank you for reaching out to us.  We have received your message and will review it shortly. You will hear back from us soon.</p>
    </td>
  </tr>

  <!-- Button -->
  <tr>
    <td>
      <a href="https://shamoil-khan.vercel.app/" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Explore More</a>
    </td>
  </tr>

  <!-- Closing Message -->
  <tr>
    <td>
      <p style="color: #555; font-size: 14px; margin-top: 30px;">Best regards,</p>
      <p style="color: #333; font-size: 16px; font-weight: bold;">Safro</p>
    </td>
  </tr>
</table>
`,
    };

    await sendEmail({
      ...payload,
    })
      .then((res) => {
        console.log(`Success sending email to hamail`);

        sendEmail({
          ...resendPayload,
        })
          .then((res) => console.log(`Success resending email to ${res}`))
          .catch((err) => console.log(`Error resending email to ${email}`));
      })
      .catch((err) => console.log(`Error sending email to ${email}`));

    return res.status(200).json({
      success: true,
      message: "Message Sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error",
      error: error.message,
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const { shippingAddress, items, totalAmount } = req.body;

    const newOrder = await createOrder({
      userId: req.user.id,
      shippingAddress,
      totalAmount,
    });

    if (!newOrder) {
      return res.status(400).json({
        success: false,
        message: "Failed to create order",
        data: null,
      });
    }

    const saveItems = await saveOrderItems(newOrder.id, items);
    if (!saveItems) {
      return res.status(400).json({
        success: false,
        message: "Failed to save order items",
        data: null,
      });
    }

    const savePaymentDetails = await savePayment({
      orderId: newOrder.id,
      storeId: items[0].seller,
      amount: totalAmount,
    });

    if (!savePaymentDetails) {
      return res.status(400).json({
        success: false,
        message: "Failed to save payment details",
        data: savePaymentDetails,
      });
    }

    const payload = {
      newOrder,
      items,
    };

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error",
      error: error.message,
    });
  }
};

const createStore = async (req, res) => {
  try {
    const { storeName, storeDescription, address } = req.body;

    const uid = req.user.id;

    const user = await getUserByUid(uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const formData = new FormData();

    formData.append(
      "storeLogo",
      fs.createReadStream(req.files.storeLogo[0].path),
      req.files.storeLogo[0].originalname
    );

    formData.append(
      "storeCover",
      fs.createReadStream(req.files.storeCover[0].path),
      req.files.storeCover[0].originalname
    );

    const uploadRes = await axios.post(uploadRoute.storeImage, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const uploadedImage = uploadRes.data;

    const { storeLogo, storeCover } = uploadedImage.images;

    const payload = {
      userId: user.id,
      storeName,
      storeDescription,
      storeLogo: storeLogo.url,
      storeLogoID: storeLogo.public_id,
      storeCoverPhoto: storeCover.url,
      storeCoverPhotoId: storeCover.public_id,
      address: JSON.parse(address),
    };

    const storeCreate = await storeCreated(payload);
    if (!storeCreate) {
      return res.status(400).json({
        success: false,
        message: "Store Created failed",
      });
    }

    const updateUserRole = await updateRole(user.id, "seller");
    if (!updateUserRole) {
      return res.status(400).json({
        success: false,
        message: "Update user role failed",
      });
    }

    fs.unlinkSync(req.files.storeLogo[0].path);
    fs.unlinkSync(req.files.storeCover[0].path);

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      store: storeCreate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create store",
      error: error.message,
    });
  }
};

module.exports = {
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
  getUserAddToCard,
  updateCardQty,
  deleteCart,
  contact,
  checkOut,
  refreshAccessToken,
  createStore,
};
