require("dotenv").config();

const config = {
  port: process.env.PORT,
  db: process.env.MONGO_URI,
  secret: process.env.SECRET_KEY,
  sessionSecret: process.env.SESSION_SECRET_KEY,
  appPassword: process.env.APP_PASSWORD,
};

module.exports = {
  config,
};
