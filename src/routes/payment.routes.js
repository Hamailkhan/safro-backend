const express = require("express");
const {
  createPaymentIntent,
  stripeWebhook,
} = require("../controllers/payment.controller");

const route = express.Router();

route.post("/create-payment-intent", createPaymentIntent);
route.post("/stripe-webhook", stripeWebhook);

module.exports = { route };
