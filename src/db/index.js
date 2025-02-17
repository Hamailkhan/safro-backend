const mongoose = require("mongoose");
const { config } = require("../config/server.config");
const { DB_RETRY_LIMIT, DB_RETRY_TIMEOUT } = require("../constants/constants");

let connnectionRetries = 0;

const connectToDB = async () => {
  try {
    await mongoose.connect(config.db);

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "Connection error:"));
    db.once("open", () => {
      console.log("MongoDB connected");
    });
  } catch (error) {
    if (connnectionRetries < DB_RETRY_LIMIT) {
      connnectionRetries++;
      console.log(`Reconnecting to DB ${connnectionRetries}/${DB_RETRY_LIMIT}`);
      await new Promise((resolve) => setTimeout(resolve, DB_RETRY_TIMEOUT));
      await connectToDB();
    } else {
      process.exit();
    }
  }
};

module.exports = {
  connectToDB,
};
