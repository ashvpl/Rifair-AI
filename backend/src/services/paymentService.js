// backend/src/services/paymentService.js
'use strict';

const Razorpay = require("razorpay");
const crypto = require("crypto");
const { secrets } = require("../core/secrets/secretManager");

const razorpay = new Razorpay({
  key_id: secrets.get('RAZORPAY_KEY_ID'),
  key_secret: secrets.get('RAZORPAY_KEY_SECRET'),
});

/**
 * Create a new Razorpay order
 */
async function createOrder(amount, currency = "INR", receipt, notes = {}) {
  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });
    return order;
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error.message);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 */
function verifySignature(orderId, paymentId, signature) {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secrets.get('RAZORPAY_KEY_SECRET'))
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

module.exports = {
  createOrder,
  verifySignature,
};
