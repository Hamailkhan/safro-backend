const jwt = require("jsonwebtoken");
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
} = require("../services/user.service");
const { createHash, compareHash } = require("../utils/hash.utils");
const { config } = require("../config/server.config");
const { sendEmail } = require("../services/mail.service");
const { generateOtp } = require("../utils/generateOtp.util");
const { getProductById } = require("../services/product.service");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findByEmail(email);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials", data: null });

    if (!user.isActive)
      return res.status(401).json({
        success: false,
        message: "please verify your account first",
        data: null,
      });

    const isAlreadyLoggedIn = await getTokenByUID(user.id);
    if (isAlreadyLoggedIn?.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Already logged in", data: null });

    const passwordMatch = await compareHash(password, user.password);
    if (!passwordMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials", data: null });

    const token = jwt.sign(
      { email: user.email, username: user.username },
      config.secret,
      { expiresIn: "24h" }
    );

    const generateToken = await saveToken({ token, user: user.id });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      data: user.id,
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
    const {
      username,
      email,
      password,
      phone,
      accountType: role,
      ...otherFields
    } = req.body;

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

    const checkStore = await checkStoreName(otherFields.storeName);
    if (checkStore) {
      return res
        .status(400)
        .json({ success: false, message: "Store Name Already Exist" });
    }

    const hashedPassword = await createHash(password);

    const payload = {
      username,
      email,
      phone,
      password: hashedPassword,
      role,
    };

    const newUser = await createUser(payload);
    if (!newUser) {
      return res
        .status(404)
        .json({ success: false, message: "Something went wrong" });
    }

    if (role === "seller") {
      const sellerPayload = {
        userId: newUser.id,
        ...otherFields,
      };

      const newSeller = await createSeller(sellerPayload);
      if (!newSeller) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create seller account" });
      }
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
    const { uid } = req.params;

    const logoutUser = await deleteTokensByUID(uid);
    if (logoutUser.deletedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Already logged out", data: null });
    }

    return res
      .status(200)
      .json({ success: true, message: "Successfully logged out", data: null });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", data: null });
  }
};

const profile = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await getUserByUid(uid);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });

    const { username, email, cart } = user;

    const data = {
      username,
      email,
      cart,
    };

    return res
      .status(200)
      .json({ success: true, message: "User Found", data: data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "There is no user profile",
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
    const { pid, uid, sid } = req.params;
    const { rating, comment } = req.body;

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
    const { id, uid } = req.params;

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

const addCardQty = async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { qty } = req.body;

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

const getSingleAddCard = async (req, res) => {
  try {
    const { uid } = req.params;

    const cart = await getUserForCart(uid);
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
    const { uid, id } = req.params;
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

const Contact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const payload = {
      from: email,
      to: "hamailkhan213@gmail.com",
      subject: name,
      text: `${email} ${message}`,
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
    const { userId, shippingAddress, items, totalAmount } = req.body;

    const newOrder = await createOrder({
      userId,
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
  getSingleAddCard,
  addCardQty,
  deleteCart,
  Contact,
  checkOut,
};
