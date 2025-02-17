const mongoose = require("mongoose");
const socketIo = require("socket.io");

// Initialize Socket.IO
let io;

const setUpRealTimeUpdates = (server) => {
  io = socketIo(server);
};

// Generic Function to Watch Any Model
const watchModelChanges = (modelName) => {
  const modelsToWatch = ["User", "Order", "Product"];

  const model = mongoose.model(modelName);
  const changeStream = model.watch(); // Watch the model for changes

  changeStream.on("change", (change) => {
    console.log(`${modelName} Change:`, change);
    // Emit real-time updates to all connected clients
    io.emit(`${modelName}Updated`, change);
  });
};

module.exports = { setUpRealTimeUpdates, watchModelChanges };
