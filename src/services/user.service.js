const db = require("../models/index");

const {
  user: User,
  token: Token,
  product: Product,
  order: Order,
  review: Review,
  addToCard: AddToCard,
  seller: Seller,
  orderItem: OrderItem,
  payment: Payment,
} = db;

const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    throw error;
  }
};

const createUser = async (payload) => {
  try {
    const newUser = new User({ ...payload });
    const user = await newUser.save();
    return user;
  } catch (error) {
    throw error;
  }
};

const checkStoreName = async (name) => {
  try {
    const check = await Seller.findOne({
      storeName: name,
    });
    return check;
  } catch (error) {
    throw error;
  }
};

const UpdateUserByEmail = async (email) => {
  try {
    const response = await User.updateOne(
      { email: email }, // filter,
      { isActive: true } // data to update
    );
    return response;
  } catch (error) {
    throw error;
  }
};

const UpdateUserPassword = async (payload) => {
  try {
    const { email, password } = payload;

    const response = await User.updateOne(
      { email: email }, // filter,
      { password: password } // data to update
    );
    return response;
  } catch (error) {
    throw error;
  }
};

const UpdateUserOtp = async (email, otp) => {
  try {
    const response = await User.updateOne(
      { email: email }, // filter,
      { otp: otp } // data to update
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// DELETE KARNA HAI YAI WALA FUNC
const deleteTokensByUID = async (uid) => {
  try {
    const response = await Token.deleteMany({ user: uid });
    return response;
  } catch (error) {
    throw error;
  }
};

const deleteTokensByToken = async (refreshToken) => {
  try {
    const result = await Token.deleteOne({ token: refreshToken });
    return result; // `{ deletedCount: 1 }` return karega agar delete ho gaya
  } catch (error) {
    console.error("Error deleting token:", error);
    return { deletedCount: 0 }; // Error aaye to zero return kare
  }
};

const saveToken = async (payload) => {
  try {
    const newToken = new Token({ ...payload });
    const token = await newToken.save();
    return token;
  } catch (error) {
    throw error;
  }
};

const getTokenByUID = async (uid) => {
  try {
    const response = await Token.find({ user: uid });
    return response;
  } catch (error) {
    throw error;
  }
};

const getUserByUid = async (_id) => {
  try {
    const user = await User.findById(_id);
    return user;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const user = await User.find({});
    return user;
  } catch (error) {
    throw error;
  }
};

const deleteUserById = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id);
    return user;
  } catch (error) {
    throw error;
  }
};

const updateUserUsername = async (payload) => {
  try {
    const { email, username } = payload;
    const user = await User.updateOne(
      { email: email }, // filter,
      { username: username } // data to update
    );
    return user;
  } catch (error) {
    throw error;
  }
};

const findUserByAndReview = async (payload, uid) => {
  try {
    const update = await User.findByIdAndUpdate(
      uid,
      {
        $push: {
          reviews: payload,
        },
      },
      { new: true }
    );
    return update;
  } catch (error) {
    throw error;
  }
};

const findProductAndReview = async (payload, id) => {
  try {
    const update = Product.findByIdAndUpdate(
      id,
      {
        $push: {
          reviews: payload,
        },
      },
      { new: true }
    );
    return update;
  } catch (error) {
    throw error;
  }
};

const findUserAndUpdateCart = async (uid, pid) => {
  try {
    const user = await User.findByIdAndUpdate(
      uid,
      {
        $push: {
          cart: { productId: pid },
        },
      },
      { new: true }
    );
    return user;
  } catch (error) {
    throw error;
  }
};

const findProductInUser = async (uid, pid) => {
  try {
    const cart = await AddToCard.findOne({ userId: uid });

    if (cart) {
      const productIndex = cart.items.findIndex(
        (item) => item.productId.toString() === pid
      );

      if (productIndex > -1) {
        // Product already in cart, increase quantity
        cart.items[productIndex].quantity += 1;
      } else {
        // Product not in cart, add it
        cart.items.push({ productId: pid, quantity: 1 });
      }

      await cart.save();
      return cart;
    } else {
      // Create new cart if it doesn't exist
      const newCart = await AddToCard.create({
        userId: uid,
        items: [{ productId: pid, quantity: 1 }],
      });
      return newCart;
    }
  } catch (error) {
    throw error;
  }
};

const findCartByUserId = async (uid) => {
  try {
    const cart = await AddToCard.findOne({
      userId: uid,
    });
    return cart;
  } catch (error) {
    throw error;
  }
};

const updateCartQty = async (cart, qty, pid) => {
  try {
    const cartItem = cart.items.find(
      (item) => item.productId.toString() === pid
    );
    cartItem.quantity = qty;

    await cart.save();
    return cartItem;
  } catch (error) {
    throw error;
  }
};

const getUserForCart = async (uid) => {
  try {
    const userCart = await AddToCard.findOne({
      userId: uid,
    }).populate("items.productId");
    return userCart;
  } catch (error) {
    throw error;
  }
};

const findCartAndDelete = async (uid, id) => {
  try {
    const deleteCart = await AddToCard.findOneAndDelete(
      { userId: uid },
      { $pull: { items: { productId: id } } }, // Removes the item with matching productId
      { new: true } // Return the updated user document
    );

    return deleteCart;
  } catch (error) {
    throw error;
  }
};

const checkProductQty = async (uid, id) => {
  try {
    const cart = await AddToCard.findOne({ userId: uid });
    const existingCartItem = cart?.items?.find(
      (item) => item.productId.toString() === id
    );

    const currentCartQuantity = existingCartItem
      ? existingCartItem.quantity
      : 0;
    const newCartQuantity = currentCartQuantity + 1;

    return { newCartQuantity, currentCartQuantity };
  } catch (error) {
    throw error;
  }
};

const createOrder = async (payload) => {
  try {
    const order = new Order({ ...payload });
    const newOrder = await order.save();
    return newOrder;
  } catch (error) {
    throw error;
  }
};

const updateUserOrder = async (uid, oid) => {
  try {
    const update = await User.findByIdAndUpdate(
      uid,
      { $push: { orderHistory: { orderId: oid } } },
      { new: true }
    );

    return update;
  } catch (error) {
    throw error;
  }
};

const findUserByUid = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw error;
  }
};

const findProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    return product;
  } catch (error) {
    throw error;
  }
};

const saveReview = async (payload) => {
  try {
    const newReview = new Review({ ...payload });
    const review = await newReview.save();
    return review;
  } catch (error) {
    throw error;
  }
};

const createSeller = async (payload) => {
  try {
    const newSeller = new Seller({ ...payload });
    const seller = await newSeller.save();
    return seller;
  } catch (error) {
    throw error;
  }
};

const saveOrderItems = async (orderId, items) => {
  try {
    const orderItems = items.map((item) => ({
      orderId,
      productId: item._id,
      storeId: item.seller,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
    }));

    const saveItem = await OrderItem.insertMany(orderItems);

    return saveItem;
  } catch (error) {
    throw error;
  }
};

const savePayment = async (payload) => {
  try {
    const newPayment = new Payment({ ...payload });
    const payment = await newPayment.save();
    return payment;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  findByEmail,
  UpdateUserByEmail,
  deleteTokensByUID,
  saveToken,
  getTokenByUID,
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
};
