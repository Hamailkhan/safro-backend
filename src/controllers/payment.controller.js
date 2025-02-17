// const stripe = require("stripe")(
//   "sk_test_51Qidl1P3Hrmmrk6W20uttYpc3jlnZwdc6qUw6JQjkqXjS9pqdsSLSZeVnnTok92ZIch1js2ejKZThJznPFONOJXs00U2mvvbza"
// );

// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const createPaymentIntent = async (req, res) => {
  // try {
  //   // Get amount from the request body
  //   const { amount } = req.body;
  //   // Create a payment intent
  //   const paymentIntent = await stripe.paymentIntents.create({
  //     amount: amount * 100, // amount in cents (e.g., 100 = $1)
  //     currency: "usd", // or 'pkr' for Pakistan
  //   });
  //   res.status(200).json({
  //     clientSecret: paymentIntent.client_secret,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     success: false,
  //     message: "Error creating payment intent",
  //     error: error.message,
  //   });
  // }
};

const stripeWebhook = async (req, res) => {
  // const sig = req.headers["stripe-signature"];
  // let event;
  // try {
  //   // Verify the webhook signature
  //   event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  //   // Handle the event
  //   switch (event.type) {
  //     case "payment_intent.succeeded":
  //       // Handle successful payment here
  //       console.log("PaymentIntent was successful!");
  //       break;
  //     case "payment_intent.payment_failed":
  //       // Handle failed payment here
  //       console.log("Payment failed!");
  //       break;
  //     // Add more cases for other events as needed
  //     default:
  //       console.log(`Unhandled event type: ${event.type}`);
  //   }
  //   res.json({ received: true });
  // } catch (err) {
  //   console.error(`Error processing webhook: ${err.message}`);
  //   res.status(400).send(`Webhook error: ${err.message}`);
  // }
};

module.exports = { createPaymentIntent, stripeWebhook };
