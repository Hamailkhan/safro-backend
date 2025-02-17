// const cron = require("node-cron");
// const db = require("../models/index");

// const { product: Product, order: Order } = db;

// // const updateProductQty = async () => {
// //   cron.schedule("* * * * * *", async () => {
// //     try {
// //       const orders = await Order.find({ status: "Completed" });

// //       for (const order of orders) {
// //         for (const item of order.products) {
// //           // console.log(item.productId);
// //           // Update product qty
// //           // const product = await Product.findByIdAndUpdate(
// //           //   item.productId,
// //           //   {
// //           //     $inc: { qty: -item.quantity },
// //           //     $set: { isStock: item.quantity > 0 ? true : false },
// //           //   }, // Decrease the qty
// //           //   { new: true, runValidators: true } // Return the updated document and run validators
// //           // );
// //           // if (product) {
// //           //   // Check if the product is low in stock
// //           //   if (product.qty <= product.lowStockThreshold) {
// //           //     // console.log(`Alert: Product "${product.name}" is low in stock!`);
// //           //   }
// //           // }
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error processing orders:", error);
// //     }
// //   });
// // };

// const updateProductQty = async () => {};

// module.exports = {
//   updateProductQty,
// };
