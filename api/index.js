const express = require("express");
// const http = require("http");
// const bodyParser = require("body-parser");
const cors = require("cors");
const { config } = require("../src/config/server.config");
const { connectToDB } = require("../src/db/index");
const { corsOptions } = require("../src/config/cors.config");
const { route: ProductRoute } = require("../src/routes/product.routes");
const { route: AdminRoute } = require("../src/routes/admin.routes");
const { route: UserRoute } = require("../src/routes/user.routes");
// const {
//   setUpRealTimeUpdates,
//   watchModelChanges,
// } = require("../src/services/realTime.service");
// const { updateProductQty } = require("../src/jobs/updateProduct.job");
const { route: StoreRoute } = require("../src/routes/store.routes");
const { route: PaymentRoute } = require("../src/routes/payment.routes");
const { route: GlobalRoutes } = require("../src/routes/global.routes");

const app = express();

// const server = http.createServer(app);
// setUpRealTimeUpdates(server);

const PORT = config.port;

connectToDB()
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err.message));

// watchModelChanges();

app.use(express.json());
// app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use("/product", ProductRoute);
app.use("/admin", AdminRoute);
app.use("/user", UserRoute);
app.use("/store", StoreRoute);
app.use("/payment", PaymentRoute);
app.use("/global", GlobalRoutes);

app.get("*", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Invalid Route",
    data: null,
  });
});

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
