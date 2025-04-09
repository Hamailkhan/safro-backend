const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { config } = require("../src/config/server.config");
const { connectToDB } = require("../src/db/index");
const { corsOptions } = require("../src/config/cors.config");
const { route: ProductRoute } = require("../src/routes/product.routes");
const { route: AdminRoute } = require("../src/routes/admin.routes");
const { route: UserRoute } = require("../src/routes/user.routes");
const { route: StoreRoute } = require("../src/routes/store.routes");
const { route: PaymentRoute } = require("../src/routes/payment.routes");
const { route: GlobalRoutes } = require("../src/routes/global.routes");
const errorHandler = require("../src/middleware/errorHandler");

const app = express();

const PORT = config.port;

connectToDB()
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err.message));

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Production mein secure=true rakhein
      // secure: process.env.NODE_ENV === "production", // Production mein secure=true rakhein
      sameSite: "Strict",
    },
  })
);
app.use(errorHandler);

app.use("/product", ProductRoute);
app.use("/admin", AdminRoute);
app.use("/user", UserRoute);
app.use("/store", StoreRoute);
app.use("/payment", PaymentRoute);
app.use("/global", GlobalRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
    data: null,
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: true,
    message: "Invalid Route",
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
